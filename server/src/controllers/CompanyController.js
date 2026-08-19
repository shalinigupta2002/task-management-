import CompanyService from "../services/CompanyService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class CompanyController {
  getAll = asyncHandler(async (req, res) => {
    const result = await CompanyService.getAll(req.validatedQuery || req.query, req.user);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const company = await CompanyService.getById(req.validatedParams?.id || req.params.id, req.user);
    return ApiResponse.success(res, company);
  });

  create = asyncHandler(async (req, res) => {
    const company = await CompanyService.create(req.validatedBody || req.body, req.user);
    return ApiResponse.created(res, company, "Company created successfully");
  });

  update = asyncHandler(async (req, res) => {
    const company = await CompanyService.update(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user
    );
    return ApiResponse.success(res, company, "Company updated successfully");
  });

  remove = asyncHandler(async (req, res) => {
    await CompanyService.remove(req.validatedParams?.id || req.params.id, req.user);
    return ApiResponse.success(res, null, "Company deleted successfully");
  });
}

export default new CompanyController();
