const { validateCreateOrder, validatePaymentVerification } = require("../../validators/orders/orders.validator");
const ordersService = require("../../services/orders/orders.service");
const { success, failure } = require("../../utils/apiResponse.util");
const { writeAuditLog } = require("../../utils/auditLogger.util");

function handleServiceError(err, next, res) {
  if (err.expose) return failure(res, err.statusCode, err.message);
  return next(err);
}

async function create(req, res, next) {
  try {
    const { isValid, errors } = validateCreateOrder(req.body);
    if (!isValid) return failure(res, 422, "Please check the submitted details.", errors);

    const order = await ordersService.createOrder(req.body, req.admin.id);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "orders:create",
      entity: "Order",
      entityId: order.id,
      ipAddress: req.ip,
    });

    return success(res, 201, "Order created.", { order });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function list(req, res, next) {
  try {
    const { status, search, page, pageSize } = req.query;
    const result = await ordersService.listOrders({
      status: status || undefined,
      search: search || undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 25,
    });
    return success(res, 200, "Orders fetched.", result);
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const order = await ordersService.getOrderById(Number(req.params.id));
    return success(res, 200, "Order fetched.", { order });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!status) return failure(res, 422, "status is required.");

    const order = await ordersService.updateOrderStatus(Number(req.params.id), status);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "orders:updateStatus",
      entity: "Order",
      entityId: order.id,
      metadata: { status },
      ipAddress: req.ip,
    });

    return success(res, 200, "Order status updated.", { order });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function cancel(req, res, next) {
  try {
    const id = Number(req.params.id);
    const order = await ordersService.cancelOrder(id);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "orders:cancel",
      entity: "Order",
      entityId: id,
      ipAddress: req.ip,
    });

    return success(res, 200, "Order cancelled.", { order });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function stats(req, res, next) {
  try {
    const stats = await ordersService.getDashboardStats();
    return success(res, 200, "Stats fetched.", stats);
  } catch (err) {
    return next(err);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { isValid, errors } = validatePaymentVerification(req.body);
    if (!isValid) return failure(res, 422, "Please check the submitted details.", errors);

    const order = await ordersService.verifyPayment(Number(req.params.id), req.body);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "orders:updateStatus",
      entity: "Order",
      entityId: order.id,
      metadata: { paymentStatus: req.body.paymentStatus },
      ipAddress: req.ip,
    });

    return success(res, 200, `Payment ${req.body.paymentStatus}.`, { order });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function setDeliveryCharge(req, res, next) {
  try {
    const { deliveryCharge } = req.body || {};
    const charge = Number(deliveryCharge);
    if (Number.isNaN(charge) || charge < 0) {
      return failure(res, 422, "deliveryCharge must be a non-negative number.");
    }

    const order = await ordersService.setDeliveryCharge(Number(req.params.id), charge);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "orders:updateStatus",
      entity: "Order",
      entityId: order.id,
      metadata: { deliveryCharge: charge },
      ipAddress: req.ip,
    });

    return success(res, 200, "Delivery charge updated.", { order });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function assignDeliveryPerson(req, res, next) {
  try {
    const { deliveryPersonName } = req.body || {};
    const order = await ordersService.assignDeliveryPerson(Number(req.params.id), deliveryPersonName);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "orders:updateStatus",
      entity: "Order",
      entityId: order.id,
      metadata: { deliveryPersonName },
      ipAddress: req.ip,
    });

    return success(res, 200, "Delivery person updated.", { order });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

module.exports = {
  create,
  list,
  getOne,
  updateStatus,
  cancel,
  stats,
  verifyPayment,
  setDeliveryCharge,
  assignDeliveryPerson,
};
