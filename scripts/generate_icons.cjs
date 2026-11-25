const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/Users/Mohamed/github/suividesk/node_modules/puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_DIR = 'C:\\Users\\Mohamed\\github\\suividesk-app';

// Square 1024x1024 icon with the exact CNAS emblem shield and gradient
const ICON_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body, html {
    margin: 0;
    padding: 0;
    width: 1024px;
    height: 1024px;
    background: #003A6B;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .wrapper {
    width: 1024px;
    height: 1024px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  svg {
    width: 780px;
    height: 780px;
  }
</style>
</head>
<body>
  <div class="wrapper">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cnasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0072CE" />
          <stop offset="50%" stop-color="#0055A5" />
          <stop offset="100%" stop-color="#002D62" />
        </linearGradient>
        <linearGradient id="cyanAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00d2ff" />
          <stop offset="100%" stop-color="#00A3E0" />
        </linearGradient>
      </defs>

      <!-- Protective Outer Crest (Centered in 100x100) -->
      <path d="M 50,7 L 88,27 L 88,68 L 50,93 L 12,68 L 12,27 Z" 
            fill="url(#cnasGrad)" 
            stroke="url(#cyanAccent)" 
            stroke-width="2.8" 
            stroke-linejoin="round" />
      
      <!-- Inner Stylized Protective Hands & Family / Worker Emblem -->
      <path d="M 28,62 C 33,47 40,39 50,39 C 60,39 67,47 72,62 C 64,55 58,54 50,58 C 42,54 36,55 28,62 Z" 
            fill="#FFFFFF" />
      <circle cx="50" cy="31" r="7.5" fill="#00d2ff" />
      <circle cx="40" cy="45" r="5" fill="#FFFFFF" />
      <circle cx="60" cy="45" r="5" fill="#FFFFFF" />
      
      <!-- Olive Wreath / Gear Accent Curve -->
      <path d="M 22,41 C 18,55 21,71 32,80" fill="none" stroke="#00d2ff" stroke-width="2.8" stroke-linecap="round" />
      <path d="M 78,41 C 82,55 79,71 68,80" fill="none" stroke="#00d2ff" stroke-width="2.8" stroke-linecap="round" />

      <!-- CNAS Text Under Emblem inside Shield -->
      <text x="50" y="87" font-family="'Segoe UI', 'Montserrat', Arial, sans-serif" font-weight="900" font-size="9" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
        CNAS
      </text>
    </svg>
  </div>
</body>
</html>
`;

async function generateIcons() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--window-size=1024,1024']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });
  await page.setContent(ICON_HTML);
  await new Promise((r) => setTimeout(r, 600));

  const iconPath = path.join(APP_DIR, 'assets', 'icon.png');
  const adaptiveIconPath = path.join(APP_DIR, 'assets', 'adaptive-icon.png');
  const splashPath = path.join(APP_DIR, 'assets', 'splash-icon.png');

  await page.screenshot({ path: iconPath, omitBackground: false });
  await page.screenshot({ path: adaptiveIconPath, omitBackground: false });
  await page.screenshot({ path: splashPath, omitBackground: false });

  console.log(`✅ Generated: ${iconPath}`);
  console.log(`✅ Generated: ${adaptiveIconPath}`);
  console.log(`✅ Generated: ${splashPath}`);

  await browser.close();
}

generateIcons().catch(console.error);
