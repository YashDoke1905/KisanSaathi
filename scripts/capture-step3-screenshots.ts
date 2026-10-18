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

  // 1. Planner List Light
  await page.goto("http://localhost:3000/planner", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "planner_mobile_light.png"), fullPage: false });
  console.log("Captured: planner_mobile_light.png");

  // 2. Planner List Dark
  try {
    const themeBtn = await page.$('button[aria-label="Toggle display theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "planner_mobile_dark.png"), fullPage: false });
      console.log("Captured: planner_mobile_dark.png");
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }
  } catch (e) {
    console.warn("Theme toggle error:", e);
  }

  // 3. New Plan Wizard Light
  await page.goto("http://localhost:3000/planner/new", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "planner_new_mobile_light.png"), fullPage: false });
  console.log("Captured: planner_new_mobile_light.png");

  // 4. Crop Comparison Light
  await page.goto("http://localhost:3000/planner/compare", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "planner_compare_mobile_light.png"), fullPage: false });
  console.log("Captured: planner_compare_mobile_light.png");

  // 5. Market Intelligence Light
  await page.goto("http://localhost:3000/market", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "market_mobile_light.png"), fullPage: false });
  console.log("Captured: market_mobile_light.png");

  // 6. Market Intelligence Dark
  try {
    const themeBtn = await page.$('button[aria-label="Toggle display theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "market_mobile_dark.png"), fullPage: false });
      console.log("Captured: market_mobile_dark.png");
    }
  } catch (e) {
    console.warn("Theme toggle error:", e);
  }

  await browser.close();
  console.log("All Step 3 screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
