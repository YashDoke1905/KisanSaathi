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

  // 1. Schemes Light
  await page.goto("http://localhost:3000/schemes", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "schemes_mobile_light.png"), fullPage: false });
  console.log("Captured: schemes_mobile_light.png");

  // 2. Schemes Dark
  try {
    const themeBtn = await page.$('button[aria-label="Toggle display theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "schemes_mobile_dark.png"), fullPage: false });
      console.log("Captured: schemes_mobile_dark.png");
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }
  } catch (e) {
    console.warn("Theme toggle error:", e);
  }

  // 3. Diversification Light
  await page.goto("http://localhost:3000/diversification", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "diversification_mobile_light.png"), fullPage: false });
  console.log("Captured: diversification_mobile_light.png");

  // 4. Diversification Dark
  try {
    const themeBtn = await page.$('button[aria-label="Toggle display theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "diversification_mobile_dark.png"), fullPage: false });
      console.log("Captured: diversification_mobile_dark.png");
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }
  } catch (e) {
    console.warn("Theme toggle error:", e);
  }

  // 5. Weather Light
  await page.goto("http://localhost:3000/weather", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "weather_mobile_light.png"), fullPage: false });
  console.log("Captured: weather_mobile_light.png");

  // 6. Weather Dark
  try {
    const themeBtn = await page.$('button[aria-label="Toggle display theme"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, "weather_mobile_dark.png"), fullPage: false });
      console.log("Captured: weather_mobile_dark.png");
    }
  } catch (e) {
    console.warn("Theme toggle error:", e);
  }

  await browser.close();
  console.log("All Step 4 screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
