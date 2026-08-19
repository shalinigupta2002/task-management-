import TaskOccurrenceService from "../services/TaskOccurrenceService.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class TaskOccurrenceController {
  getCalendar = asyncHandler(async (req, res) => {
    const data = await TaskOccurrenceService.getCalendar(
      req.validatedQuery || req.query,
      req.user.userId
    );
    return ApiResponse.success(res, data);
  });

  getByTask = asyncHandler(async (req, res) => {
    const data = await TaskOccurrenceService.getByTask(
      req.validatedParams?.taskId || req.params.taskId,
      req.user.userId
    );
    return ApiResponse.success(res, data);
  });

  updateProgress = asyncHandler(async (req, res) => {
    const data = await TaskOccurrenceService.updateAssigneeProgress(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, data, "Occurrence updated");
  });

  complete = asyncHandler(async (req, res) => {
    const data = await TaskOccurrenceService.completeOccurrence(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, data, "Occurrence submitted");
  });

  approve = asyncHandler(async (req, res) => {
    const data = await TaskOccurrenceService.approveOccurrence(
      req.validatedParams?.id || req.params.id,
      req.user.userId
    );
    return ApiResponse.success(res, data, "Occurrence approved");
  });

  reject = asyncHandler(async (req, res) => {
    const data = await TaskOccurrenceService.rejectOccurrence(
      req.validatedParams?.id || req.params.id,
      req.validatedBody || req.body,
      req.user.userId
    );
    return ApiResponse.success(res, data, "Occurrence rejected");
  });

  resubmit = asyncHandler(async (req, res) => {
    const data = await TaskOccurrenceService.resubmitOccurrence(
      req.validatedParams?.id || req.params.id,
      req.user.userId
    );
    return ApiResponse.success(res, data, "Occurrence reopened for rework");
  });
}

export default new TaskOccurrenceController();
