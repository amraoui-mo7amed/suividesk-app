const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/Users/Mohamed/github/suividesk/node_modules/puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_DIR = 'C:\\Users\\Mohamed\\github\\suividesk-app';

async function generate() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  const cnasLogoB64 = fs.readFileSync(path.join(APP_DIR, 'assets', 'CNAS_logo.png')).toString('base64');
  const logoDataUri = `data:image/png;base64,${cnasLogoB64}`;

  await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });

  // 1. icon.png (1024x1024) - standard full app icon with CNAS brand deep navy background
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      body, html {
        margin: 0; padding: 0;
        width: 1024px; height: 1024px;
        background: #003A6B;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      img {
        width: 860px;
        height: 860px;
        object-fit: contain;
      }
    </style>
    </head>
    <body>
      <img src="${logoDataUri}" />
    </body>
    </html>
  `);
  await new Promise((r) => setTimeout(r, 400));
  const iconPath = path.join(APP_DIR, 'assets', 'icon.png');
  await page.screenshot({ path: iconPath, omitBackground: false });
  console.log(`✅ Generated: ${iconPath}`);

  // 2. adaptive-icon.png (1024x1024) - Android Adaptive Icon foreground
  // Kept within the 720px safe zone (inner 66.6% circle/squircle)
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      body, html {
        margin: 0; padding: 0;
        width: 1024px; height: 1024px;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      img {
        width: 700px;
        height: 700px;
        object-fit: contain;
      }
    </style>
    </head>
    <body>
      <img src="${logoDataUri}" />
    </body>
    </html>
  `);
  await new Promise((r) => setTimeout(r, 400));
  const adaptiveIconPath = path.join(APP_DIR, 'assets', 'adaptive-icon.png');
  await page.screenshot({ path: adaptiveIconPath, omitBackground: true });
  console.log(`✅ Generated: ${adaptiveIconPath}`);

  // 3. splash-icon.png
  const splashPath = path.join(APP_DIR, 'assets', 'splash-icon.png');
  await page.screenshot({ path: splashPath, omitBackground: true });
  console.log(`✅ Generated: ${splashPath}`);

  await browser.close();
}

generate().catch(console.error);
