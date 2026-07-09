import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('./dist/index.html', 'utf-8');

const virtualConsole = new JSDOM('').window.console;
virtualConsole.on('error', (err) => {
  console.error('JSDOM Error:', err);
});
virtualConsole.on('log', (log) => {
  console.log('JSDOM Log:', log);
});
virtualConsole.on('jsdomError', (err) => {
  console.error('JSDOM Uncaught:', err.message, err.detail);
});

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "http://localhost/",
  virtualConsole
});

dom.window.addEventListener('error', (event) => {
  console.error('Window Error:', event.error);
});
dom.window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

setTimeout(() => {
  console.log('DOM Content after 3s:', dom.window.document.body.innerHTML);
  process.exit(0);
}, 3000);
