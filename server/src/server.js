import { createServer } from "http";
import app from "./app.js";
import config from "./config/index.js";
import { validateProductionEnv } from "./config/validateEnv.js";
import prisma from "./config/database.js";
import { initSocket } from "./socket/index.js";
import ReminderSchedulerService from "./services/scheduler/ReminderSchedulerService.js";

validateProductionEnv();

const httpServer = createServer(app);
initSocket(httpServer);

const server = httpServer.listen(config.port, () => {
  console.log(`TaskFlow API running on port ${config.port}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Socket.IO enabled`);
  if (config.swagger.enabled) {
    console.log(`Swagger docs: /api/docs`);
  }
  if (config.scheduler.enabled) {
    ReminderSchedulerService.start();
  }
});

async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  ReminderSchedulerService.stop();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default server;
