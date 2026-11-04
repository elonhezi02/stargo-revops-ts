import { test, expect } from "@playwright/test";
test("desktop report drilldown and evidence", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Every signal. A clear next step." }),
  ).toBeVisible();
  await page.screenshot({ path: "runtime/desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Weekly performance" }).click();
  await page
    .getByRole("button", { name: /Meetings held.*View supporting records/ })
    .click();
  await expect(page.getByRole("dialog")).toContainText("PE-002");
  await page.getByRole("button", { name: /Felix Wagner.*PE-002/ }).click();
  await expect(page.getByRole("dialog")).toContainText("No inbound evidence");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("390px inbound, acceptance, brief and no page overflow", async ({
  page,
}) => {
  const prospectName = "Browser QA " + Date.now();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "New inbound", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Name", exact: true })
    .fill(prospectName);
  await page
    .getByRole("textbox", { name: "Original message" })
    .fill(
      "I own a 45-person customs brokerage in Haifa. We handle import declarations manually. Can we see a demo?",
    );
  await page.getByRole("button", { name: "Add and analyze" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: prospectName, exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("QL candidate");
  await page.getByRole("button", { name: "Accept", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("All five checks pass");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "AI visibility", exact: true })
    .click();
  await page.getByRole("button", { name: "Generate brief" }).click();
  await expect(
    page.getByText("50 words · schema.org/Article", { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "runtime/mobile.png", fullPage: true });
});
