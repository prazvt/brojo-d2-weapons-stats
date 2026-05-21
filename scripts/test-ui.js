import { chromium } from 'playwright';

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture all console messages
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  // Capture errors
  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR] ${err.toString()}`);
  });

  try {
    console.log('Navigating to http://localhost:5173/...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    console.log('Page loaded.');
    
    // Check initial active weapon name
    const initialWeaponTitle = await page.locator('h2.font-display').textContent();
    console.log(`Initial Showcase Weapon Title: "${initialWeaponTitle.trim()}"`);

    // Let's count visible weapon buttons in the catalog sidebar
    const catalogButtons = page.locator('button.w-full.flex.items-center.justify-between.p-2\\.5');
    const count = await catalogButtons.count();
    console.log(`Found ${count} weapon buttons in catalog sidebar.`);

    if (count > 0) {
      // Print first 3 catalog weapon names
      for (let i = 0; i < Math.min(3, count); i++) {
        const text = await catalogButtons.nth(i).locator('div.font-semibold').textContent();
        console.log(`  Sidebar Option #${i + 1}: "${text.trim()}"`);
      }

      // Click on the second weapon button
      const targetName = await catalogButtons.nth(1).locator('div.font-semibold').textContent();
      console.log(`Clicking on sidebar weapon: "${targetName.trim()}"...`);
      await catalogButtons.nth(1).click();

      // Wait a bit for navigation and state updates
      await page.waitForTimeout(2000);

      // Check URL
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);

      // Check showcase weapon title again
      const newWeaponTitle = await page.locator('h2.font-display').textContent();
      console.log(`New Showcase Weapon Title: "${newWeaponTitle.trim()}"`);
      
      // Let's print out all the visible stats in the showcase
      const statsList = page.locator('span.font-semibold.text-slate-300.flex.items-center.gap-1\\.5');
      const statsCount = await statsList.count();
      console.log(`Stats rendered in list: ${statsCount}`);
      for (let i = 0; i < statsCount; i++) {
        const statName = await statsList.nth(i).textContent();
        console.log(`  - Stat #${i + 1}: "${statName.trim()}"`);
      }
    } else {
      console.log('No weapon buttons found in sidebar!');
    }

  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
