const categoriesService = require("../../services/categories/categories.service");
const productsService = require("../../services/products/products.service");
const ordersService = require("../../services/orders/orders.service");
const { validatePublicCreateOrder } = require("../../validators/orders/orders.validator");
const { success, failure } = require("../../utils/apiResponse.util");

// No auth on any of these - this is the customer-facing read surface.
// Every function explicitly filters to active records only, regardless of
// what the underlying service defaults to, so a customer can never see
// something the admin has deactivated - even by guessing an id.

async function listCategories(req, res, next) {
  try {
    const categories = await categoriesService.listCategories({ includeInactive: false });
    return success(res, 200, "Categories fetched.", { categories });
  } catch (err) {
    return next(err);
  }
}

async function listProducts(req, res, next) {
  try {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const products = await productsService.listProducts({
      categoryId,
      includeInactive: false,
      inStockOnly: true,
      search: req.query.search,
    });
    return success(res, 200, "Products fetched.", { products });
  } catch (err) {
    return next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await productsService.getProductById(Number(req.params.id));
    if (!product.isActive || !product.isInStock) {
      return failure(res, 404, "Product not found.");
    }
    return success(res, 200, "Product fetched.", { product });
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const { isValid, errors } = validatePublicCreateOrder(req.body);
    if (!isValid) return failure(res, 422, "Please check your order details.", errors);

    // req.customer is set by attachCustomerIfPresent when signed in, absent for guests.
    const order = await ordersService.createPublicOrder(req.body, req.customer?.id ?? null);

    // Only what the customer needs back - no internal ids or admin fields.
    return success(res, 201, "Order placed.", {
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        deliveryDate: order.deliveryDate,
        deliveryStartTime: order.deliveryStartTime,
        deliveryEndTime: order.deliveryEndTime,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        deliveryChargeStatus: order.deliveryChargeStatus,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        total: order.total,
        status: order.status,
        items: order.items,
      },
    });
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

async function trackOrder(req, res, next) {
  try {
    const { orderNumber, phone } = req.query;
    if (!orderNumber || !phone) {
      return failure(res, 422, "Order number and phone number are both required.");
    }

    const order = await ordersService.getOrderForTracking(orderNumber, phone);

    return success(res, 200, "Order found.", {
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        deliveryDate: order.deliveryDate,
        deliveryStartTime: order.deliveryStartTime,
        deliveryEndTime: order.deliveryEndTime,
        deliveryAddress: order.deliveryAddress,
        deliveryChargeStatus: order.deliveryChargeStatus,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items,
      },
    });
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

/** Everything the customer needs about an order, nothing internal. */
function toCustomerOrderView(order) {
  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    deliveryDate: order.deliveryDate,
    deliveryStartTime: order.deliveryStartTime,
    deliveryEndTime: order.deliveryEndTime,
    deliveryAddress: order.deliveryAddress,
    deliveryChargeStatus: order.deliveryChargeStatus,
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items,
  };
}

async function myOrders(req, res, next) {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const result = await ordersService.listCustomerOrders(req.customer.id, { page });
    return success(res, 200, "Orders fetched.", {
      ...result,
      orders: result.orders.map(toCustomerOrderView),
    });
  } catch (err) {
    return next(err);
  }
}

async function myOrderDetail(req, res, next) {
  try {
    const order = await ordersService.getCustomerOrder(req.customer.id, req.params.orderNumber);
    return success(res, 200, "Order fetched.", { order: toCustomerOrderView(order) });
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

module.exports = {
  listCategories,
  listProducts,
  getProduct,
  createOrder,
  trackOrder,
  myOrders,
  myOrderDetail,
};
