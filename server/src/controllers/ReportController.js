import ReportService from "../services/ReportService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class ReportController {
  getAll = asyncHandler(async (req, res) => {
    const result = await ReportService.getAll(req.validatedQuery || req.query, req.user);
    return ApiResponse.paginated(res, result.items, result.meta);
  });

  getById = asyncHandler(async (req, res) => {
    const report = await ReportService.getById(req.validatedParams?.id || req.params.id, req.user);
    return ApiResponse.success(res, report);
  });

  create = asyncHandler(async (req, res) => {
    const report = await ReportService.create(req.validatedBody || req.body, req.user);
    return ApiResponse.created(res, report, "Report created successfully");
  });

  exportReport = asyncHandler(async (req, res) => {
    const csvContent = await ReportService.exportReport(req.user);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="task-report.csv"');
    return res.status(200).send(csvContent);
  });
}

export default new ReportController();
