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

  // 1. Doctor Light
  await page.goto("http://localhost:3000/doctor", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "doctor_mobile_light.png"), fullPage: false });
  console.log("Captured: doctor_mobile_light.png");

  // 2. Doctor Dark
  try {
    const themeBtn = await page.$('button[aria-label="Toggle display theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "doctor_mobile_dark.png"), fullPage: false });
      console.log("Captured: doctor_mobile_dark.png");
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }
  } catch (e) {
    console.warn("Theme toggle error doctor:", e);
  }

  // 3. Ledger Light
  await page.goto("http://localhost:3000/ledger", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "ledger_mobile_light.png"), fullPage: false });
  console.log("Captured: ledger_mobile_light.png");

  // 4. Ledger Dark
  try {
    const themeBtn = await page.$('button[aria-label="Toggle display theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "ledger_mobile_dark.png"), fullPage: false });
      console.log("Captured: ledger_mobile_dark.png");
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }
  } catch (e) {
    console.warn("Theme toggle error ledger:", e);
  }

  // 5. Farm Light
  await page.goto("http://localhost:3000/farm", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "farm_mobile_light.png"), fullPage: false });
  console.log("Captured: farm_mobile_light.png");

  // 6. Farm Dark
  try {
    const themeBtn = await page.$('button[aria-label="Toggle display theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "farm_mobile_dark.png"), fullPage: false });
      console.log("Captured: farm_mobile_dark.png");
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }
  } catch (e) {
    console.warn("Theme toggle error farm:", e);
  }

  // 7. Admin
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "admin_mobile_dark.png"), fullPage: false });
  console.log("Captured: admin_mobile_dark.png");

  await browser.close();
  console.log("All Step 5 screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
