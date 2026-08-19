import { HTTP_STATUS } from "../constants/index.js";

export default class ApiResponse {
  static success(res, data, message = "Success", statusCode = HTTP_STATUS.OK, meta = null) {
    const body = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static created(res, data, message = "Created successfully") {
    return ApiResponse.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static noContent(res) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  static paginated(res, data, meta, message = "Success") {
    return ApiResponse.success(res, data, message, HTTP_STATUS.OK, meta);
  }
}
