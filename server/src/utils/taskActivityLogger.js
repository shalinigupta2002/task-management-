import TaskActivityRepository from "../repositories/TaskActivityRepository.js";
import prisma from "../config/database.js";

export async function logActivity(taskId, performedById, activityType, description, tx = prisma) {
  return TaskActivityRepository.create({
    taskId,
    performedById,
    activityType,
    description,
  }, undefined, tx);
}

export default logActivity;
