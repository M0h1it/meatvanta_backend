const customersService = require("../../services/customers/customers.service");
const { success, failure } = require("../../utils/apiResponse.util");

async function list(req, res, next) {
  try {
    const { search, page, pageSize } = req.query;
    const result = await customersService.listCustomers({
      search: search || undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 25,
    });
    return success(res, 200, "Customers fetched.", result);
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const customer = await customersService.getCustomerById(Number(req.params.id));
    return success(res, 200, "Customer fetched.", { customer });
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

module.exports = { list, getOne };
