import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

async function run() {
  console.log('Starting preview server...');
  const preview = spawn('cmd', ['/c', 'npm', 'run', 'preview'], { cwd: 'c:\\development\\vitenest' });
  
  // Wait a couple of seconds for server to start
  await new Promise(r => setTimeout(r, 2000));

  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' }).catch(e => console.log('GOTO ERROR', e));

  await browser.close();
  preview.kill();
  console.log('Done.');
}

run();
