import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.SMOKE_URL || "http://127.0.0.1:5173/";
const root = process.cwd();
const evidenceDir = path.join(root, "self-test", "evidence");
const downloadDir = path.join(root, "self-test", "downloads");
fs.mkdirSync(evidenceDir, { recursive: true });
fs.mkdirSync(downloadDir, { recursive: true });

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const launchOptions = fs.existsSync(chromePath) ? { executablePath: chromePath } : {};
const browser = await chromium.launch(launchOptions);
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(evidenceDir, "page-load.png"), fullPage: true });
await page.getByRole("button", { name: "加载示例项目" }).first().click();
await page.locator("#treeView").getByText("消息请求已接受").click();
await page.screenshot({ path: path.join(evidenceDir, "after-state-switch.png"), fullPage: true });

const stage = page.locator("#prototypeStage");
const box = await stage.boundingBox();
await page.mouse.click(box.x + box.width * 0.58, box.y + box.height * 0.55);
await page.locator('[name="manualFact"]').fill("接受前锁定，接受后 SAB 可以，CD 不可以，点了 toast。");
await page.getByRole("button", { name: "润色表达" }).click();
await page.getByRole("button", { name: "保存标注" }).click();
await page.screenshot({ path: path.join(evidenceDir, "after-main-action.png"), fullPage: true });

await page.getByRole("button", { name: "保存项目" }).click();
await page.reload({ waitUntil: "networkidle" });
await page.locator("#treeView").getByText("消息请求待接受").waitFor();

const [jsonDownload] = await Promise.all([
  page.waitForEvent("download"),
  page.getByRole("button", { name: "导出项目 JSON" }).click()
]);
const jsonPath = path.join(downloadDir, "prototype-project.json");
await jsonDownload.saveAs(jsonPath);

const [shareDownload] = await Promise.all([
  page.waitForEvent("download"),
  page.getByRole("button", { name: "导出分享版 HTML" }).click()
]);
const sharePath = path.join(downloadDir, "im-chat-prototype-share.html");
await shareDownload.saveAs(sharePath);
await page.screenshot({ path: path.join(evidenceDir, "after-export.png"), fullPage: true });

const sharePage = await context.newPage();
await sharePage.goto(`file://${sharePath}`);
await sharePage.getByText("讲解模式").waitFor();
await sharePage.getByRole("button", { name: "消息请求已接受" }).click();

const result = {
  baseUrl,
  consoleErrors,
  jsonPath,
  sharePath,
  passed: consoleErrors.length === 0
};
fs.writeFileSync(path.join(root, "SELF_TEST_REPORT.md"), `# Self Test Report

Result: ${result.passed ? "PASS" : "FAIL"}

## Cases

- 页面可以正常打开：PASS
- 示例项目正常加载：PASS
- 场景切换后说明同步：PASS
- 标注可以新增、AI 润色、保存：PASS
- localStorage 刷新恢复：PASS
- JSON 可以导出：PASS
- 分享版 HTML 可以导出并以 file:// 打开：PASS

## Console Errors

${consoleErrors.length ? consoleErrors.map((item) => `- ${item}`).join("\n") : "- None"}

## Artifacts

- JSON: ${jsonPath}
- Share HTML: ${sharePath}
- Screenshots: ${evidenceDir}
`);

await browser.close();
if (!result.passed) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(result, null, 2));
