import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\dokey\\.gemini\\antigravity\\brain\\5317d010-bb3d-4a08-a4f2-10e340c0d567";

async function run() {
  if (!fs.existsSync(EDGE_PATH)) {
    console.error("Edge executable not found at:", EDGE_PATH);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // 1. Login Light
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "login_mobile_light.png"), fullPage: false });
  console.log("Captured: login_mobile_light.png");

  // 2. Login Dark Mode
  try {
    const themeBtn = await page.$('button[aria-label="Toggle display theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "login_mobile_dark.png"), fullPage: false });
      console.log("Captured: login_mobile_dark.png");
      // switch back to light
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }
  } catch (e) {
    console.warn("Theme toggle error:", e);
  }

  // 3. Signup Light
  await page.goto("http://localhost:3000/signup", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "signup_mobile_light.png"), fullPage: true });
  console.log("Captured: signup_mobile_light.png");

  // 4. Forgot Password Light
  await page.goto("http://localhost:3000/forgot-password", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "forgot_password_mobile_light.png"), fullPage: false });
  console.log("Captured: forgot_password_mobile_light.png");

  // 5. More / Account Light
  await page.goto("http://localhost:3000/more", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "more_mobile_light.png"), fullPage: false });
  console.log("Captured: more_mobile_light.png");

  // 6. More / Account Dark
  try {
    const themeBtn = await page.$('button[aria-label="Toggle display theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "more_mobile_dark.png"), fullPage: false });
      console.log("Captured: more_mobile_dark.png");
    }
  } catch (e) {
    console.warn("Theme toggle error:", e);
  }

  await browser.close();
  console.log("All Auth & Account screenshots captured!");
}

run().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
