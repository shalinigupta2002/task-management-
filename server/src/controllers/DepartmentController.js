import DepartmentService from "../services/DepartmentService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class DepartmentController {
  getAll = asyncHandler(async (req, res) => {
    const result = await DepartmentService.getAll(req.validatedQuery || req.query, req.user);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const dept = await DepartmentService.getById(req.validatedParams?.id || req.params.id, req.user);
    return ApiResponse.success(res, dept);
  });

  create = asyncHandler(async (req, res) => {
    const dept = await DepartmentService.create(req.validatedBody || req.body, req.user);
    return ApiResponse.created(res, dept, "Department created successfully");
  });

  update = asyncHandler(async (req, res) => {
    const dept = await DepartmentService.update(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user
    );
    return ApiResponse.success(res, dept, "Department updated successfully");
  });

  remove = asyncHandler(async (req, res) => {
    await DepartmentService.remove(req.validatedParams?.id || req.params.id, req.user);
    return ApiResponse.success(res, null, "Department deleted successfully");
  });
}

export default new DepartmentController();
