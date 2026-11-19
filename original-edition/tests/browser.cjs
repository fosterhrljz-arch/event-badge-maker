// Optional development QA. The app itself needs no Node.js, server, or packages.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { DEMO_CSV } = require('../core.js');
const project = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const output = path.resolve(process.argv[3] || path.join(project, 'evidence'));
fs.mkdirSync(output, { recursive: true });
const results = [], errors = [], requests = [];
const url = pathToFileURL(path.join(project, 'index.html')).href;
const row = (n, name = `Person ${n}`) => `${name},Studio ${n},Attendee`;
const csv = count => 'name,organization,role\n' + Array.from({ length: count }, (_, i) => row(i + 1)).join('\n');
const record = async (name, fn) => {
  const start = Date.now();
  try { const detail = await fn(); results.push({ name, status: 'PASS', ms: Date.now() - start, ...(detail ? { detail } : {}) }); console.log(`PASS: ${name}`); }
  catch (error) { results.push({ name, status: 'FAIL', message: error.message }); throw error; }
};

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const context = await browser.newContext({ offline: true, viewport: { width: 1536, height: 1024 } });
  const page = await context.newPage();
  const savePDF = async options => {
    // Explicit media avoids carrying a previous screen-layout check into PDF export.
    await page.emulateMedia({ media: 'print' });
    await page.pdf(options);
    await page.emulateMedia({ media: 'screen' });
  };
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
  page.on('request', request => { if (/^https?:/i.test(request.url())) requests.push(request.url()); });
  const ready = async count => {
    await page.waitForFunction(expected => document.querySelectorAll('.badge').length === expected && document.body.dataset.printReady === (expected ? 'true' : 'false'), count);
  };
  const setCSV = async value => { await page.locator('#attendee-csv').fill(value); await page.waitForTimeout(220); };
  const demo = async () => { await page.locator('#demo-button').click(); await ready(12); };
  const noOverflow = async () => {
    const failures = await page.locator('[data-max]').evaluateAll(nodes => nodes.flatMap(node => {
      const slot = node.parentElement, style = getComputedStyle(slot);
      const height = slot.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      return node.scrollHeight > height + 1 || node.scrollWidth > node.clientWidth + 1 ? [node.textContent] : [];
    }));
    assert.deepEqual(failures, []);
  };
  try {
    await record('Offline file launch: correct title, meaningful UI and 12 demo badges', async () => {
      await page.goto(url); await ready(12);
      assert.equal(page.url(), url); assert.equal(await page.title(), 'Event Badge Maker');
      assert.equal(await page.locator('h1').innerText(), 'Good names. Great first impressions.');
      assert.equal(await page.locator('.sheet').count(), 2);
      assert.equal(await page.locator('.sheet.is-active .badge').count(), 6);
      assert.ok(await page.locator('#print-button').isEnabled());
      assert.equal(await page.locator('vite-error-overlay, nextjs-portal').count(), 0);
    });
    await record('Event name updates every sheet live', async () => {
      await page.locator('#event-name').fill('Design Assembly 2026');
      await page.waitForFunction(() => [...document.querySelectorAll('.event-text')].every(node => node.textContent === 'Design Assembly 2026'));
      await page.locator('#event-name').fill('Gathering of Good Ideas'); await ready(12);
    });
    await record('Pagination exposes the second six attendees and disables end controls', async () => {
      assert.ok(await page.locator('#previous-page').isDisabled());
      await page.locator('#next-page').click();
      assert.equal(await page.locator('#page-label').innerText(), 'Page 2 of 2');
      assert.equal(await page.locator('.sheet.is-active .badge-name').first().innerText(), 'Amara Okafor');
      assert.ok(await page.locator('#next-page').isDisabled());
      await page.locator('#previous-page').click();
    });
    await record('Three distinct designs render correctly and generate A4 demo PDFs', async () => {
      for (const design of ['minimal', 'conference', 'creative']) {
        await page.locator(`input[value=${design}]`).check(); await noOverflow();
        assert.equal(await page.locator(`.badge--${design}`).count(), 12);
        await page.screenshot({ path: path.join(output, `${design}-desktop.png`), fullPage: true });
        await page.locator('.sheet.is-active').screenshot({ path: path.join(output, `${design}-sheet.png`) });
        await savePDF({ path: path.join(output, `${design}-demo.pdf`), preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
      }
      await page.locator('input[value=conference]').check();
    });
    await record('Print geometry: 90 × 80 mm, 6 mm gaps and all pages visible', async () => {
      await page.emulateMedia({ media: 'print' });
      const geometry = await page.evaluate(() => {
        const sheets = [...document.querySelectorAll('.sheet')], badges = [...document.querySelectorAll('.badge')];
        const first = badges[0].getBoundingClientRect(), second = badges[1].getBoundingClientRect(), third = badges[2].getBoundingClientRect();
        return { width: first.width * 25.4 / 96, height: first.height * 25.4 / 96, gapX: (second.left - first.right) * 25.4 / 96, gapY: (third.top - first.bottom) * 25.4 / 96, sheets: sheets.map(s => ({ visibility: getComputedStyle(s).visibility, width: s.getBoundingClientRect().width * 25.4 / 96, height: s.getBoundingClientRect().height * 25.4 / 96, breakAfter: getComputedStyle(s).breakAfter })), editorDisplay: getComputedStyle(document.querySelector('.editor')).display };
      });
      for (const [key, expected] of Object.entries({ width: 90, height: 80, gapX: 6, gapY: 6 })) assert.ok(Math.abs(geometry[key] - expected) < .05, `${key}: ${geometry[key]}`);
      assert.equal(geometry.editorDisplay, 'none');
      assert.ok(geometry.sheets.every(s => s.visibility === 'visible' && Math.abs(s.width - 186) < .05 && Math.abs(s.height - 273) < .05));
      assert.equal(geometry.sheets[0].breakAfter, 'page'); assert.equal(geometry.sheets[1].breakAfter, 'auto');
      await noOverflow(); await page.emulateMedia({ media: 'screen' });
      return geometry;
    });
    await record('Paste quoted CSV, Unicode, empty organization and default role', async () => {
      await setCSV('role,name,organization\nSpeaker,"Morgan, Avery","North, Studio"\n,Zoë García,\nGuest,李明,未来\nGuest,أمينة حسن,مثال'); await ready(4);
      assert.equal(await page.locator('.badge-name').first().textContent(), 'Morgan, Avery');
      assert.equal(await page.locator('.badge-org').first().textContent(), 'North, Studio');
      assert.equal(await page.locator('.badge-role').nth(1).textContent(), 'Attendee'); await noOverflow();
    });
    await record('Import a CSV file and import the same file again', async () => {
      const file = { name: 'attendees.csv', mimeType: 'text/csv', buffer: Buffer.from('\uFEFF' + csv(7).replace(/\n/g, '\r\n')) };
      for (let i = 0; i < 2; i++) { await page.locator('#csv-file').setInputFiles(file); await ready(7); }
      assert.equal(await page.locator('.sheet').count(), 2);
      assert.equal(await page.locator('.sheet').nth(1).locator('.badge').count(), 1);
      await savePDF({ path: path.join(output, 'seven-attendees.pdf'), preferCSSPageSize: true, printBackground: true });
    });
    await record('Import button opens a native file chooser', async () => {
      const chooser = page.waitForEvent('filechooser'); await page.locator('#import-button').click();
      await (await chooser).setFiles({ name: 'demo.csv', mimeType: 'text/csv', buffer: Buffer.from(DEMO_CSV) }); await ready(12);
    });
    await record('Malformed data clears stale badges and disables print', async () => {
      await setCSV('name,organization,role\n"Unclosed,Studio,Speaker');
      assert.equal(await page.locator('.badge').count(), 0);
      assert.ok(await page.locator('#print-button').isDisabled());
      assert.match(await page.locator('#csv-status').innerText(), /closing quote/);
      assert.ok(await page.locator('#empty-state').isVisible());
      await page.screenshot({ path: path.join(output, 'invalid-csv.png'), fullPage: true });
      await savePDF({ path: path.join(output, 'invalid-input.pdf'), preferCSSPageSize: true });
    });
    await record('Empty and header-only lists show an empty state', async () => {
      for (const value of ['', 'name,organization,role\n']) { await setCSV(value); await ready(0); assert.ok(await page.locator('#empty-state').isVisible()); }
    });
    await record('Missing event name blocks printing and recovers on edit', async () => {
      await demo(); await page.locator('#event-name').fill('   '); await page.waitForTimeout(220);
      assert.ok(await page.locator('#print-button').isDisabled()); assert.ok(await page.locator('#event-error').isVisible());
      await page.locator('#event-name').fill('Gathering of Good Ideas'); await ready(12);
    });
    await record('HTML and script-like data are rendered as literal text', async () => {
      await setCSV('name,organization,role\n<img src=x onerror=alert(1)>,<script>alert(1)</script>,Guest'); await ready(1);
      assert.equal(await page.locator('.badge img,.badge script').count(), 0);
      assert.equal(await page.locator('.badge-name').textContent(), '<img src=x onerror=alert(1)>');
    });
    await record('Maximum-length names, event, organization and role fit in all designs', async () => {
      await page.locator('#event-name').fill('E'.repeat(100));
      await setCSV('name,organization,role\n' + 'N'.repeat(120) + ',' + 'O'.repeat(160) + ',' + 'R'.repeat(80)); await ready(1);
      for (const design of ['minimal', 'conference', 'creative']) {
        await page.locator(`input[value=${design}]`).check(); assert.ok(await page.locator('#print-button').isEnabled()); await noOverflow();
        await savePDF({ path: path.join(output, `long-${design}.pdf`), preferCSSPageSize: true, printBackground: true });
      }
      await page.locator('#event-name').fill('Gathering of Good Ideas'); await page.locator('input[value=conference]').check();
    });
    await record('Over-limit fields produce errors instead of truncated names', async () => {
      await setCSV('name,organization,role\n' + 'N'.repeat(121) + ',Studio,Guest');
      assert.ok(await page.locator('#print-button').isDisabled()); assert.match(await page.locator('#csv-status').innerText(), /exceeds 120/);
    });
    await record('Oversized file preserves the current attendee list and explains the failure', async () => {
      await demo(); await page.locator('#csv-file').setInputFiles({ name: 'large.csv', mimeType: 'text/csv', buffer: Buffer.alloc(1000001, 65) });
      await page.waitForFunction(() => !document.querySelector('#import-error').hidden);
      assert.equal(await page.locator('.badge').count(), 12); assert.match(await page.locator('#import-error').innerText(), /current list has been kept/);
    });
    await record('1, 6, 7, 12 and 13 attendees paginate without extra sheets', async () => {
      for (const count of [1, 6, 7, 12, 13]) {
        await setCSV(csv(count)); await ready(count); assert.equal(await page.locator('.sheet').count(), Math.ceil(count / 6));
        await savePDF({ path: path.join(output, `pagination-${count}.pdf`), preferCSSPageSize: true, printBackground: true });
      }
    });
    await record('1000-attendee limit renders 167 pages and rejects attendee 1001', async () => {
      await setCSV(csv(1000)); await ready(1000); assert.equal(await page.locator('.sheet').count(), 167);
      await setCSV(csv(1001)); assert.match(await page.locator('#csv-status').innerText(), /1,000/); assert.ok(await page.locator('#print-button').isDisabled());
    });
    await record('Print button invokes browser printing with valid data', async () => {
      await demo(); await page.evaluate(() => { window.__printCalls = 0; window.print = () => window.__printCalls++; });
      await page.locator('#print-button').click(); assert.equal(await page.evaluate(() => window.__printCalls), 1);
    });
    await record('Browser print command flushes a pending edit before printing', async () => {
      await page.evaluate(() => {
        const input = document.querySelector('#attendee-csv'); input.value = 'name,organization,role\nPending Edit,Studio,Speaker';
        input.dispatchEvent(new Event('input', { bubbles: true })); window.dispatchEvent(new Event('beforeprint'));
      });
      assert.equal(await page.locator('.badge-name').textContent(), 'Pending Edit');
      assert.ok(await page.locator('#print-button').isEnabled());
    });
    await record('Mobile and tablet layouts have no horizontal overflow', async () => {
      await demo();
      for (const [width, height] of [[320, 740], [390, 844], [768, 1024]]) {
        await page.setViewportSize({ width, height }); await page.waitForTimeout(100);
        const sizes = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
        assert.ok(sizes.document <= sizes.viewport, JSON.stringify(sizes));
        await noOverflow();
        await page.screenshot({ path: path.join(output, `responsive-${width}.png`), fullPage: true });
      }
      await page.setViewportSize({ width: 1536, height: 1024 });
    });
    await record('Keyboard radio navigation selects a design and shows focus', async () => {
      await page.locator('input[value=conference]').focus(); await page.keyboard.press('ArrowRight');
      assert.ok(await page.locator('input[value=creative]').isChecked());
      assert.equal(await page.locator('.badge--creative').count(), 12);
      await page.locator('input[value=conference]').check();
    });
    await record('Reload restores demo and no attendee data is stored', async () => {
      await setCSV(csv(1)); await page.reload(); await ready(12);
      assert.equal(await page.evaluate(() => localStorage.length), 0);
    });
    await record('No network requests, runtime errors, warnings or framework overlays', async () => {
      assert.deepEqual(requests, []); assert.deepEqual(errors, []);
      assert.equal(await page.locator('vite-error-overlay, nextjs-portal').count(), 0);
    });
    await page.screenshot({ path: path.join(output, 'desktop-final.png'), fullPage: true });
  } finally {
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify({ timestamp: new Date().toISOString(), browser: browser.version(), playwright: require(path.join(process.env.PLAYWRIGHT_MODULE || 'playwright', 'package.json')).version, url, mode: 'file://, network offline', viewports: ['1536x1024', '320x740', '390x844', '768x1024'], errors, networkRequests: requests, passed: results.filter(r => r.status === 'PASS').length, failed: results.filter(r => r.status === 'FAIL').length, results }, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
