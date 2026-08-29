import dotenv from "dotenv";
import prisma from "../src/config/database.js";
import AuthService from "../src/services/AuthService.js";

dotenv.config();

const DEV_PASSWORD = process.env.SEED_DEV_PASSWORD || "DevTest@2026!";
const SEED_PASSWORD = "Admin@123456";

async function testUser(email, password) {
  console.log(`\nTesting for: ${email}`);
  try {
    const loginRes = await AuthService.login(email, password);
    const token = loginRes.accessToken;
    console.log(`✓ Login success. Token: ${token.slice(0, 15)}...`);

    const port = process.env.PORT || 5000;
    const url = `http://localhost:${port}/api/v1/conversations`;
    console.log(`Hitting URL: ${url}`);
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✓ GET success! Status: ${res.status}`);
    const data = await res.json();
    console.log("Response body:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`✗ Failed:`, err.message);
  }
}

async function main() {
  await testUser("superadmin@system.test", DEV_PASSWORD);
  await testUser("superadmin@taskflow.com", SEED_PASSWORD);
}

main().catch(console.error);
