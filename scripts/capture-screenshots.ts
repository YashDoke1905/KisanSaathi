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

  // 1. Mobile 390x844 Light Mode
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1000));

  const mobileLightPath = path.join(ARTIFACT_DIR, "home_mobile_light.png");
  await page.screenshot({ path: mobileLightPath, fullPage: false });
  console.log("Captured:", mobileLightPath);

  // 2. Mobile Full Page Light Mode (scrolled)
  const mobileFullPath = path.join(ARTIFACT_DIR, "home_mobile_full.png");
  await page.screenshot({ path: mobileFullPath, fullPage: true });
  console.log("Captured:", mobileFullPath);

  // 3. Switch to Dark Mode via Theme button
  try {
    const themeButton = await page.$('button[aria-label="Toggle display theme"]');
    if (themeButton) {
      await themeButton.click();
      await new Promise((r) => setTimeout(r, 800));
      const mobileDarkPath = path.join(ARTIFACT_DIR, "home_mobile_dark.png");
      await page.screenshot({ path: mobileDarkPath, fullPage: false });
      console.log("Captured:", mobileDarkPath);
    }
  } catch (err) {
    console.warn("Theme toggle screenshot error:", err);
  }

  await browser.close();
  console.log("Screenshot capture complete!");
}

run().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
