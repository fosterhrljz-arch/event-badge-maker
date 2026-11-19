# Event Badge Maker

A small, fully offline app for turning an attendee CSV into polished, printable event badges. Built with plain HTML, CSS, and JavaScript. No installation, server, account, API, external font, or runtime dependency is needed.

## Open the app

1. Extract the complete ZIP into a folder. On Windows, right-click the ZIP and choose **Extract All**.
2. Open the extracted `event-badge-maker` folder.
3. Double-click **index.html**, or use your browser's **Open File** command to open it.
4. You should see **Event Badge Maker**, the event **Gathering of Good Ideas**, and **12 badges · 2 pages**.

**Success:** the Conference design is selected and the first six fictional attendees appear on the paper preview. You can disconnect from the internet before opening the file.

Keep `index.html`, `styles.css`, `core.js`, `app.js`, and `icon.svg` together. Opening just the HTML file from inside the ZIP may prevent its companion files from loading.

## Make your badges

1. Replace the **Event name**.
2. Paste your attendee CSV into the text box, or select **Import CSV** and choose a UTF-8 CSV file. Importing replaces the current list. Selecting **Load demo** restores the 12 demo attendees and keeps your event name.
3. Select **Minimal**, **Conference**, or **Creative**. Each changes the layout, typography, and visual treatment of every badge.
4. Use the arrow buttons below the sheet to review each page. The preview updates automatically as you type.

**Success:** the attendee count matches your list, the print button is enabled, and every badge shows the expected event, name, organization, and role.

### CSV format

```csv
name,organization,role
Avery Morgan,Northstar Studio,Speaker
Jordan Lee,Fieldwork,Attendee
"Rivera, Mateo","Common Ground, Inc.",Organizer
```

- The first nonblank row must include `name`, `organization`, and `role`. Header order and capitalization do not matter. `organisation` is also accepted.
- Additional columns are ignored. Duplicate column names are rejected.
- Each nonblank data row must have the same number of columns as the header.
- Every attendee needs a name. Organization may be blank; a blank role becomes **Attendee**. Keep the commas for empty fields: `Avery,,`.
- Put a value containing commas or line breaks inside double quotes. Escape a literal quote by doubling it: `"The ""Good Ideas"" Studio"`.
- Blank rows are ignored. Repeated attendee names produce separate badges. The app does not deduplicate or sort the list.
- UTF-8 BOMs, Windows line endings, accents, and Unicode names are supported. Multiline field content is normalized to spaces. Glyph appearance depends on fonts installed on the device.
- Use UTF-8 CSV with commas, not semicolons or tabs. For spreadsheet exports, choose the UTF-8 CSV format when available.

Limits: 1,000 attendees, a 1,000,000-byte imported file, or 1,000,000 characters pasted; 120 characters per attendee name, 160 per organization, 80 per role, and 100 per event name. Input errors explain what to fix. An invalid list clears the preview and disables printing, preventing accidental printing of an older list.

## Print or save a PDF

1. Review the badges, then select **Print / Save PDF**.
2. Choose your printer, or choose **Save as PDF** in the browser's destination menu.
3. Set **A4**, **Portrait**, **100% / Actual size**, and **1 page per sheet**. Keep all pages selected.
4. Keep the page's **default margins**. The stylesheet supplies **12 mm** margins. Do not add custom margins or select fit-to-page scaling.
5. Turn **Headers and footers off** and **Background graphics on**. Names of these settings vary by browser.
6. Check the print preview and print or save. Cut along each dotted outline.

**Success:** the demo creates exactly two A4 pages with six badges each. Each cut badge is **90 × 80 mm**, with **6 mm** gaps. A partially filled last page prints only the remaining badges, with no duplicate or blank extra sheet.

The screen preview fits the available screen width; its on-screen size is not a physical ruler. Printed dimensions are controlled in millimeters. For a physical printer, first print one test sheet and measure a badge before printing a large batch. Printer drivers may override scaling or margins.

Long text wraps and reduces in size without ellipses. A note appears when fitted text becomes small. Shorter names or labels are easier to read at a distance. If any field cannot fit, printing is blocked until it is shortened. The browser's own Print command also refreshes the data; invalid data produces a diagnostic page rather than stale badges.

Mobile layouts are supported. Access to local HTML files and PDF destinations depends on the mobile browser and operating system. Desktop Chrome or Edge is the most straightforward way to print at an exact physical size.

## Privacy and offline behavior

All attendee processing happens inside the open tab. The app has no network calls, analytics, cookies, backend, account connection, or cloud upload. It uses local scripts and system fonts. The content security policy blocks network connections.

Edits are intentionally not saved to local storage. Reloading or closing the page loses your edits; retain the source CSV. A saved PDF contains the attendee information you chose to print.

## Project files

```text
event-badge-maker/
  index.html                 Accessible editor and preview shell
  styles.css                 Responsive UI, badge designs, A4 print rules
  core.js                    CSV parsing, validation, demo data, pagination
  app.js                     Live updates, safe rendering, fitting, printing
  icon.svg                   Local app icon
  sample-attendees.csv       The 12 fictional demo attendees
  README.md                  This guide
  TEST_RESULTS.md            Actual test outcomes and limitations
  package.json               Optional test commands; no runtime dependencies
  tests/                     Repeatable core, browser, PDF, and ZIP checks
  evidence/                  Recorded results, screenshots, and test PDFs
  design/                    Visual reference and implementation notes
```

## Repeat the tests (optional, for developers)

The app itself needs none of the tools below. Running these commands only executes local test code and creates local evidence files. Installing development tools is separate from using the offline app.

1. Install Node.js 20 or newer if it is not already available. Open a terminal in the extracted project folder.
2. Run `node --test tests/core.test.cjs` (or `npm test`).

   **Success:** 25 tests pass and 0 fail.

3. To repeat browser QA, make the `playwright` package available in your development environment. The included run used Playwright 1.62.1. Set `NODE_PATH` to your existing package directory or `PLAYWRIGHT_MODULE` to its absolute module path. Set `CHROME_PATH` to a locally installed Chrome/Chromium executable if Playwright's own browser is not installed.
4. Run `node tests/browser.cjs`. Optional arguments are the project folder and evidence output folder. This opens a headless browser with networking disabled, exercises the UI using a `file://` URL, records results, and saves PDFs. It does not send a physical print job.

   **Success:** every check prints `PASS`, the exit code is zero, and `evidence/browser-results.json` reports 0 failures.

5. With Python 3 and the optional `pypdf` and `PyMuPDF` packages available, run `python tests/verify-pdfs.py`. This reads the generated PDFs and writes `evidence/pdf-results.json`.

   **Success:** all PDF checks pass, including A4 sizes, page counts, attendee order, and complete long-text content.

6. To verify an archive, run `python tests/verify-package.py path/to/event-badge-maker.zip`. This checks archive integrity and compares its files to the project. It does not extract or execute anything.

See `TEST_RESULTS.md` for the actual tested environment, evidence, and remaining limits. No AgentGit upload is part of this package.
