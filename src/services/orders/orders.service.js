const prisma = require("../../config/db");
const { validateStatusUpdate } = require("../../validators/orders/orders.validator");
const deliverySettingsService = require("../deliverySettings/deliverySettings.service");
const notificationsService = require("../notifications/notifications.service");
const razorpayService = require("../payments/razorpay.service");

function notFoundError(message) {
  const err = new Error(message);
  err.statusCode = 404;
  err.expose = true;
  return err;
}
function badRequestError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  err.expose = true;
  return err;
}

/**
 * Turns the customer's chosen option ids into a priced, validated snapshot.
 * Prices are always re-read from the DB - the browser's numbers are never used.
 * Also enforces required groups and single-select rules server-side, so a
 * tampered request can't skip a mandatory choice or stack two marinations.
 */
async function resolveSelectedOptions(optionIds, productId) {
  if (!Array.isArray(optionIds) || optionIds.length === 0) {
    // Still need to check nothing required was skipped.
    const requiredGroups = await prisma.productOptionGroup.count({
      where: { productId, isRequired: true },
    });
    if (requiredGroups > 0) {
      throw badRequestError("Please choose the required options for this item.");
    }
    return { selectedOptions: [], optionsTotal: 0 };
  }

  const options = await prisma.productOption.findMany({
    where: { id: { in: optionIds } },
    include: { group: true },
  });

  if (options.length !== optionIds.length) {
    throw notFoundError("One of the selected options is no longer available.");
  }

  for (const option of options) {
    if (option.group.productId !== productId) {
      throw badRequestError("An option was selected that doesn't belong to this product.");
    }
    if (!option.isAvailable) {
      throw badRequestError(`"${option.name}" isn't available right now.`);
    }
  }

  // Single-select groups may appear at most once.
  const countByGroup = new Map();
  for (const option of options) {
    countByGroup.set(option.groupId, (countByGroup.get(option.groupId) || 0) + 1);
  }
  for (const option of options) {
    if (!option.group.allowMultiple && countByGroup.get(option.groupId) > 1) {
      throw badRequestError(`Please pick only one ${option.group.name.toLowerCase()}.`);
    }
  }

  // Every required group must be represented.
  const requiredGroups = await prisma.productOptionGroup.findMany({
    where: { productId, isRequired: true },
  });
  for (const group of requiredGroups) {
    if (!countByGroup.has(group.id)) {
      throw badRequestError(`Please choose a ${group.name.toLowerCase()}.`);
    }
  }

  const optionsTotal = options.reduce((sum, o) => sum + Number(o.extraPrice), 0);
  const selectedOptions = options.map((o) => ({
    groupName: o.group.name,
    optionName: o.name,
    extraPrice: Number(o.extraPrice),
  }));

  return { selectedOptions, optionsTotal };
}

const orderInclude = {
  items: true,
  createdByAdmin: { select: { id: true, name: true } },
};

/**
 * Recomputes every line item's price server-side from the current
 * ProductVariant row - the client's submitted prices are never trusted.
 * Also enforces that a variant marked out-of-stock can't be ordered.
 */
async function createOrder({ customerName, customerPhone, deliveryAddress, items, deliveryCharge, discount, paymentMethod, notes }, actingAdminId) {
  const variantIds = items.map((i) => i.productVariantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { select: { name: true } } },
  });

  const variantsById = new Map(variants.map((v) => [v.id, v]));

  const lineItems = [];
  for (const item of items) {
    const variant = variantsById.get(item.productVariantId);
    if (!variant) {
      throw notFoundError(`Variant id ${item.productVariantId} does not exist.`);
    }
    if (!variant.isInStock) {
      throw badRequestError(`"${variant.product.name} - ${variant.label}" is marked out of stock.`);
    }

    const { selectedOptions, optionsTotal } = await resolveSelectedOptions(
      item.optionIds,
      variant.productId
    );

    const unitPrice = Number(variant.price);
    lineItems.push({
      productVariantId: variant.id,
      productName: variant.product.name,
      variantLabel: variant.label,
      unitPrice,
      selectedOptions: selectedOptions.length ? selectedOptions : undefined,
      optionsTotal,
      quantity: item.quantity,
      lineTotal: (unitPrice + optionsTotal) * item.quantity,
    });
  }

  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
  const deliveryChargeValue = deliveryCharge ?? 0;
  const discountValue = discount ?? 0;
  const total = Math.max(0, subtotal + deliveryChargeValue - discountValue);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: "PENDING",
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress || null,
        paymentMethod: paymentMethod || "cod",
        subtotal,
        deliveryCharge: deliveryChargeValue,
        discount: discountValue,
        total,
        notes: notes || null,
        createdByAdminId: actingAdminId,
        items: { create: lineItems },
      },
    });

    return tx.order.update({
      where: { id: created.id },
      data: { orderNumber: `ORD-${1000 + created.id}` },
      include: orderInclude,
    });
  });

  return order;
}

async function listOrders({ status, search, page = 1, pageSize = 25 } = {}) {
  const where = {};
  if (status) where.status = status;

  // One box, three things staff actually search by at the counter.
  const trimmedSearch = typeof search === "string" ? search.trim() : "";
  if (trimmedSearch) {
    where.OR = [
      { orderNumber: { contains: trimmedSearch } },
      { customerName: { contains: trimmedSearch } },
      { customerPhone: { contains: trimmedSearch } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: orderInclude,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

async function getOrderById(id) {
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) throw notFoundError("Order not found.");
  return order;
}

async function updateOrderStatus(id, requestedStatus) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) throw notFoundError("Order not found.");

  const transitionError = validateStatusUpdate(existing.status, requestedStatus);
  if (transitionError) throw badRequestError(transitionError);

  const data = { status: requestedStatus };
  if (requestedStatus === "delivered" && existing.paymentMethod === "cod") {
    data.paymentStatus = "paid"; // COD collected on delivery
  }

  return prisma.order.update({ where: { id }, data, include: orderInclude });
}

async function cancelOrder(id) {
  return updateOrderStatus(id, "cancelled");
}

/** Powers the admin dashboard's stat cards - counts only, cheap to compute. */
async function getDashboardStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [todayOrders, pendingCount, todayDelivered, totalCustomers] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { status: { in: ["placed", "preparing", "out_for_delivery"] } } }),
    prisma.order.findMany({
      where: { createdAt: { gte: startOfToday }, status: { not: "cancelled" } },
      select: { total: true },
    }),
    // Stock counts aren't meaningful for a fresh-cut business - customer
    // count is the number the owner actually cares about growing.
    prisma.customer.count({ where: { isActive: true } }),
  ]);

  const todayRevenue = todayDelivered.reduce((sum, o) => sum + Number(o.total), 0);

  return { todayOrdersCount: todayOrders, pendingCount, todayRevenue, totalCustomers };
}

/**
 * Prices a customer's cart server-side - same rules as createPublicOrder used
 * to apply inline. Split out so both the "cod" path (creates the Order right
 * away) and the "razorpay" path (stashes the draft in PendingCheckout until
 * payment is confirmed) price things identically, from one place.
 */
async function priceCheckoutItems(items) {
  const variantIds = items.map((i) => i.productVariantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { select: { name: true, isActive: true, isInStock: true } } },
  });
  const variantsById = new Map(variants.map((v) => [v.id, v]));

  const lineItems = [];
  for (const item of items) {
    const variant = variantsById.get(item.productVariantId);
    if (!variant || !variant.product.isActive) {
      throw notFoundError("One of the items in your cart is no longer available.");
    }
    // Product-level availability wins over variant - if the owner pulled the
    // whole item for today, no variant of it can be ordered.
    if (!variant.product.isInStock) {
      throw badRequestError(`"${variant.product.name}" is not available today.`);
    }
    if (!variant.isInStock) {
      throw badRequestError(`"${variant.product.name} - ${variant.label}" is not available today.`);
    }

    const { selectedOptions, optionsTotal } = await resolveSelectedOptions(
      item.optionIds,
      variant.productId
    );

    const unitPrice = Number(variant.price); // always re-read server-side
    lineItems.push({
      productVariantId: variant.id,
      productName: variant.product.name,
      variantLabel: variant.label,
      unitPrice,
      selectedOptions: selectedOptions.length ? selectedOptions : undefined,
      optionsTotal,
      quantity: item.quantity,
      lineTotal: (unitPrice + optionsTotal) * item.quantity,
    });
  }

  return lineItems;
}

/** Alerts the shop that a real, paid-for (or COD) order came in. Deliberately
 * fire-and-forget - see createNotification - and never called for a
 * still-unpaid Razorpay draft, since that isn't a real order yet. */
async function notifyNewOrder(order) {
  const itemSummary = order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ");
  await notificationsService.createNotification({
    type: "new_order",
    title: `New order ${order.orderNumber}`,
    message:
      `${order.customerName} · Rs.${Number(order.total).toFixed(0)} · ${order.paymentMethod.toUpperCase()}` +
      ` — ${itemSummary}`.slice(0, 480),
    entityType: "Order",
    entityId: order.id,
  });
}

/**
 * Customer-site order creation. Differs from the admin path in three ways:
 *  - re-validates the delivery date against current settings (it may have
 *    expired between page load and submit)
 *  - pulls the delivery charge from settings rather than trusting the client
 *  - for "razorpay", nothing is written to the Order table yet. A customer
 *    can open the payment widget just to see the final price/a discount and
 *    close it without ever creating a "phantom" order the shop has to see -
 *    the priced draft is stashed in PendingCheckout and only becomes a real
 *    Order once payment is actually confirmed (see promotePendingCheckout).
 */
async function createPublicOrder(payload, customerId = null) {
  const {
    customerName, customerPhone, deliveryAddress, deliveryDate,
    items, paymentMethod, notes,
  } = payload;

  const settings = await deliverySettingsService.getSettings();

  if (paymentMethod === "cod" && !settings.codEnabled) {
    throw badRequestError("Cash on delivery isn't available right now.");
  }
  // The existing "upiEnabled" toggle in Delivery Settings now gates the
  // Razorpay ("Pay Online") option too - it still means "is online/non-COD
  // payment available today", just via a gateway instead of a manual UPI ID.
  if (paymentMethod === "razorpay" && !settings.upiEnabled) {
    throw badRequestError("Online payment isn't available right now.");
  }

  const dateStillValid = await deliverySettingsService.isDateSelectable(deliveryDate);
  if (!dateStillValid) {
    throw badRequestError("That delivery date is no longer available. Please pick another.");
  }

  const lineItems = await priceCheckoutItems(items);
  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
  const isFlatCharge = settings.deliveryChargeMode === "flat";
  const deliveryCharge = isFlatCharge ? Number(settings.flatDeliveryCharge) : 0;
  const total = subtotal + deliveryCharge;

  if (paymentMethod === "cod") {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: "PENDING",
          customerId, // null for guest checkout - the order still works either way
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          deliveryDate: new Date(`${deliveryDate}T00:00:00`),
          deliveryStartTime: settings.deliveryStartTime,
          deliveryEndTime: settings.deliveryEndTime,
          deliveryChargeStatus: isFlatCharge ? "confirmed" : "pending",
          paymentMethod,
          paymentStatus: "unpaid", // collected on delivery
          subtotal,
          deliveryCharge,
          discount: 0,
          total,
          notes: notes ? notes.trim() : null,
          createdByAdminId: null, // placed by a customer, not staff
          items: { create: lineItems },
        },
      });

      return tx.order.update({
        where: { id: created.id },
        data: { orderNumber: `ORD-${1000 + created.id}` },
        include: orderInclude,
      });
    });

    await notifyNewOrder(order);
    return { order, razorpayKeyId: null, razorpayOrderId: null, amount: null };
  }

  // paymentMethod === "razorpay": open the gateway order, but do NOT create
  // our own Order row yet - only a PendingCheckout holding everything needed
  // to build it later. Nothing here is visible to the shop until paid.
  const razorpayOrder = await razorpayService.createRazorpayOrder({
    amountInRupees: total,
    receipt: `checkout-${Date.now()}`,
    notes: { customerPhone: customerPhone.trim() },
  });

  await prisma.pendingCheckout.create({
    data: {
      razorpayOrderId: razorpayOrder.id,
      customerId,
      amount: total,
      payload: {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        deliveryDate,
        notes: notes ? notes.trim() : null,
        lineItems,
        subtotal,
        deliveryCharge,
        total,
        isFlatCharge,
        deliveryStartTime: settings.deliveryStartTime,
        deliveryEndTime: settings.deliveryEndTime,
      },
    },
  });

  return {
    order: null,
    razorpayOrderId: razorpayOrder.id,
    razorpayKeyId: razorpayService.getPublicKeyId(),
    amount: total,
  };
}

/**
 * Order tracking without accounts. Requires the phone number as well as the
 * order number so someone can't walk the sequence (ORD-1001, ORD-1002...)
 * and read other people's addresses.
 */
async function getOrderForTracking(orderNumber, customerPhone) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.trim().toUpperCase() },
    include: { items: true },
  });

  if (!order || order.customerPhone !== customerPhone.trim()) {
    throw notFoundError("No order found with that order number and phone number.");
  }
  return order;
}

/** Order history for a signed-in customer - no order number needed. */
async function listCustomerOrders(customerId, { page = 1, pageSize = 20 } = {}) {
  const skip = (page - 1) * pageSize;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: { items: true },
    }),
    prisma.order.count({ where: { customerId } }),
  ]);

  return { orders, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

/** Scoped by customerId, so one customer can never read another's order. */
async function getCustomerOrder(customerId, orderNumber) {
  const order = await prisma.order.findFirst({
    where: { customerId, orderNumber: orderNumber.trim().toUpperCase() },
    include: { items: true },
  });
  if (!order) throw notFoundError("Order not found.");
  return order;
}

/** Admin confirms or rejects a legacy manual-UPI (phone order) payment. */
async function verifyPayment(id, { paymentStatus, paymentNote }) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) throw notFoundError("Order not found.");
  if (existing.paymentMethod !== "upi") {
    throw badRequestError("Only manually-entered UPI payments need verification.");
  }

  return prisma.order.update({
    where: { id },
    data: {
      paymentStatus,
      paymentNote: paymentNote || null,
      paymentVerifiedAt: paymentStatus === "verified" ? new Date() : null,
    },
    include: orderInclude,
  });
}

/**
 * Turns a still-pending checkout draft into the real, shop-visible Order -
 * the moment (and only the moment) payment is actually confirmed. Called
 * from both verifyRazorpayPayment (the widget's own success callback) and
 * the webhook safety net, so it's written to be idempotent either way:
 *  - if an Order already exists for this razorpayOrderId, that path already
 *    won the race - just return it, don't create a second one.
 *  - if no PendingCheckout row exists either, this isn't a checkout we
 *    started (or it was already promoted and cleaned up) - return null.
 */
async function promotePendingCheckout(razorpayOrderId, razorpayPaymentId) {
  const existingOrder = await prisma.order.findFirst({
    where: { razorpayOrderId },
    include: orderInclude,
  });
  if (existingOrder) return existingOrder;

  const pending = await prisma.pendingCheckout.findUnique({ where: { razorpayOrderId } });
  if (!pending) return null;

  const d = pending.payload;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: "PENDING",
        customerId: pending.customerId,
        customerName: d.customerName,
        customerPhone: d.customerPhone,
        deliveryAddress: d.deliveryAddress,
        deliveryDate: new Date(`${d.deliveryDate}T00:00:00`),
        deliveryStartTime: d.deliveryStartTime,
        deliveryEndTime: d.deliveryEndTime,
        deliveryChargeStatus: d.isFlatCharge ? "confirmed" : "pending",
        paymentMethod: "razorpay",
        paymentStatus: "paid",
        razorpayOrderId,
        razorpayPaymentId,
        paymentVerifiedAt: new Date(),
        subtotal: d.subtotal,
        deliveryCharge: d.deliveryCharge,
        discount: 0,
        total: d.total,
        notes: d.notes,
        createdByAdminId: null,
        items: { create: d.lineItems },
      },
    });

    const withNumber = await tx.order.update({
      where: { id: created.id },
      data: { orderNumber: `ORD-${1000 + created.id}` },
      include: orderInclude,
    });

    // Draft's job is done - remove it so it can't be promoted twice.
    await tx.pendingCheckout.delete({ where: { id: pending.id } });

    return withNumber;
  });

  await notifyNewOrder(order);
  await notificationsService.createNotification({
    type: "payment_received",
    title: `Payment received for ${order.orderNumber}`,
    message: `${order.customerName} · Rs.${Number(order.total).toFixed(0)} · paid via Razorpay`,
    entityType: "Order",
    entityId: order.id,
  });

  return order;
}

/**
 * Confirms a Razorpay payment the checkout widget just completed. The
 * signature is the actual cryptographic proof of payment; once it checks
 * out, this is the first moment the customer's order becomes real (see
 * promotePendingCheckout) - so a customer who never gets this far (closes
 * the widget, payment fails) never leaves anything for the shop to see.
 */
async function verifyRazorpayPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const isValid = razorpayService.verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!isValid) {
    throw badRequestError("Payment verification failed. Please try again or contact us.");
  }

  const order = await promotePendingCheckout(razorpayOrderId, razorpayPaymentId);
  if (!order) {
    throw notFoundError(
      "We couldn't find this checkout. If money was deducted, it will reflect shortly - please check My Orders."
    );
  }
  return order;
}

/**
 * Safety net for the case where the customer paid but their browser closed
 * (or the network dropped) before the widget's own success callback could
 * call verifyRazorpayPayment. Razorpay retries this webhook until it gets a
 * 200, so promotePendingCheckout's idempotency is what makes that safe - it
 * either creates the order for the first time here, or finds the widget path
 * already did, and never throws for a payment it doesn't recognise.
 */
async function markOrderPaidFromWebhook({ razorpayOrderId, razorpayPaymentId }) {
  return promotePendingCheckout(razorpayOrderId, razorpayPaymentId);
}

/** Used in manual charge mode, once the admin has checked the address. */
async function setDeliveryCharge(id, deliveryCharge) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) throw notFoundError("Order not found.");

  const charge = Number(deliveryCharge);
  const total = Number(existing.subtotal) + charge - Number(existing.discount);

  return prisma.order.update({
    where: { id },
    data: { deliveryCharge: charge, total, deliveryChargeStatus: "confirmed" },
    include: orderInclude,
  });
}

/** Free-text so the shop can note who's delivering without a staff table. */
async function assignDeliveryPerson(id, deliveryPersonName) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) throw notFoundError("Order not found.");

  return prisma.order.update({
    where: { id },
    data: { deliveryPersonName: deliveryPersonName ? deliveryPersonName.trim() : null },
    include: orderInclude,
  });
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getDashboardStats,
  createPublicOrder,
  getOrderForTracking,
  listCustomerOrders,
  getCustomerOrder,
  verifyPayment,
  verifyRazorpayPayment,
  markOrderPaidFromWebhook,
  setDeliveryCharge,
  assignDeliveryPerson,
};