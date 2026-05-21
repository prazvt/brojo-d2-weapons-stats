import { chromium } from 'playwright';

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[ERROR] ${err.toString()}`);
  });

  try {
    console.log('Navigating to http://localhost:5173/...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    console.log('Page loaded.');
    
    // Get active weapon title
    const activeTitle = await page.locator('h2.font-display').textContent();
    console.log(`Showcase Weapon Title: "${activeTitle.trim()}"`);

    // Let's count visible stats in the showcase list
    const statsList = page.locator('span.font-semibold.text-slate-300.flex.items-center.gap-1\\.5');
    const statsCount = await statsList.count();
    console.log(`Stats rendered in list for Midnight Coup: ${statsCount}`);
    for (let i = 0; i < statsCount; i++) {
      const statName = await statsList.nth(i).textContent();
      console.log(`  - Stat #${i + 1}: "${statName.trim()}"`);
    }

    // Let's see if we can find any errors or other issues
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
