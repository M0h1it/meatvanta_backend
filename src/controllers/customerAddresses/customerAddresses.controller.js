const service = require("../../services/customerAddresses/customerAddresses.service");
const { validateAddress } = require("../../validators/customerAddresses/customerAddresses.validator");
const { success, failure } = require("../../utils/apiResponse.util");

function handleServiceError(err, next, res) {
  if (err.expose) return failure(res, err.statusCode, err.message);
  return next(err);
}

async function list(req, res, next) {
  try {
    const addresses = await service.listAddresses(req.customer.id);
    return success(res, 200, "Addresses fetched.", { addresses });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { isValid, errors } = validateAddress(req.body);
    if (!isValid) return failure(res, 422, "Please check the address details.", errors);

    const address = await service.createAddress(req.customer.id, req.body);
    return success(res, 201, "Address saved.", { address });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function update(req, res, next) {
  try {
    const { isValid, errors } = validateAddress(req.body, { partial: true });
    if (!isValid) return failure(res, 422, "Please check the address details.", errors);

    const address = await service.updateAddress(req.customer.id, Number(req.params.id), req.body);
    return success(res, 200, "Address updated.", { address });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function remove(req, res, next) {
  try {
    const result = await service.deleteAddress(req.customer.id, Number(req.params.id));
    return success(res, 200, "Address removed.", result);
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function setDefault(req, res, next) {
  try {
    const address = await service.setDefaultAddress(req.customer.id, Number(req.params.id));
    return success(res, 200, "Default address updated.", { address });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

module.exports = { list, create, update, remove, setDefault };
