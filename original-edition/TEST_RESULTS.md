# Actual test results

Tested on **November 6, 2026**. These are recorded executions, not a proposed test plan.

| Test group | Passed | Failed | Evidence |
| --- | ---: | ---: | --- |
| CSV parsing, validation, demo data, pagination | 25 | 0 | `evidence/core-tests.txt` |
| Offline browser interaction and layout checks | 23 | 0 | `evidence/browser-results.json` |
| Generated PDF geometry, pagination, and content | 80 | 0 | `evidence/pdf-results.json` |

## Environment

- Windows, Node.js 24.16.0, Python 3.12.8.
- Google Chrome 156.0.8078.80, controlled by Playwright 1.62.1 in headless mode.
- App opened directly from `index.html` through a `file://` URL with browser networking disabled. No development server was used.
- Viewports: 1536 × 1024 desktop; 768 × 1024 tablet; 390 × 844 and 320 × 740 mobile layouts.
- Browser plugin classification: **Absent**. The Browser plugin and its browser skill were not available, so local Playwright was used.
- `pypdf` and PyMuPDF inspected the generated PDFs; Poppler rendered selected pages for visual review.

## Required browser checks

| Check | Result | Observed evidence |
| --- | --- | --- |
| Page identity | PASS | Correct file URL, title, and primary heading |
| Meaningful content | PASS | Editor, 12 attendees, two sheets, and six visible badges |
| Framework error overlay | PASS | None present; app has no framework runtime |
| Console health | PASS | Zero runtime errors and zero warning/error console messages |
| Offline behavior | PASS | Zero HTTP/HTTPS requests throughout the run |
| Interaction proof | PASS | Event updates, file imports, style changes, pagination, print invocation, and recovery from invalid data |
| Responsive overflow | PASS | No horizontal document overflow at 320, 390, or 768 px |
| Text fitting | PASS | No measured text overflow for the tested cases in all three designs |

## Interaction paths exercised

1. Open the local file offline → demo renders → edit the event name → all 12 badges update.
2. Navigate to page two → its six attendees appear → the next button disables → return to page one.
3. Select Minimal, Conference, Creative → each layout renders → save actual browser PDFs for each.
4. Paste quoted and Unicode CSV → values render correctly; blank organization is allowed and blank role becomes Attendee.
5. Import a BOM/CRLF CSV through the file input → seven badges appear on two sheets → import the same file again successfully.
6. Click Import CSV → native file chooser opens → load the demo through that chooser.
7. Enter malformed CSV → old badges disappear and print disables → restore valid input → preview recovers.
8. Clear the event name → print disables → enter a name → print enables.
9. Paste HTML-like data → it appears as literal text; no injected image or script element is created.
10. Use 100-character event, 120-character name, 160-character organization, and 80-character role test fields → every tested field fits in all three designs, and full text is preserved in the PDFs.
11. Exceed a field limit → an actionable error replaces the preview. Import an oversized file → current data is retained and the failure is explained.
12. Generate 1, 6, 7, 12, and 13 attendees → exact page counts and source order are preserved.
13. Render 1,000 attendees → 167 sheets; attendee 1,001 is rejected. The combined boundary check took approximately 4 seconds in the recorded run.
14. Click Print / Save PDF → `window.print()` is invoked. The test substitutes a counter so it cannot send a physical print job.
15. Trigger `beforeprint` immediately after an edit → pending changes are synchronously rendered.
16. Use keyboard arrow navigation on the style radio group → design selection and badges change.
17. Reload → demo returns; attendee data has not been written to local storage.

## Print and PDF evidence

The three `*-demo.pdf` files each contain exactly **two A4 pages**, with the correct six attendees on each page. Page dimensions are checked against **595.28 × 841.89 points** with a 1-point tolerance for browser rounding. DOM print geometry is checked with a **0.05 mm** tolerance:

- Badge: 90 × 80 mm.
- Horizontal and vertical gap: 6 mm.
- Printable sheet area: 186 × 273 mm, within the page's 12 mm margins.
- Explicit page breaks between sheets and no extra break after the last sheet.
- Editor controls are absent from printed output.
- A partial final sheet contains only the remaining badges.
- Invalid input produces one diagnostic page through browser printing, with no stale attendee names.

The PDF audit also checks text within page margins and verifies that maximum-length test fields are present in full. Text extraction alone cannot establish visual quality, so the rendered Conference, Creative, Minimal, long-text, and partial-final-page images were inspected as well.

## Fixes made during validation

- Long organization names and roles initially exceeded their allotted areas. The app correctly blocked printing. The areas were resized and the minimum-fitting cases rerun successfully.
- The Minimal event header needed slightly more height for a 100-character test event. Its height was adjusted and all three long-text PDF checks now pass.
- A PDF test initially inherited a previous screen-media override. The test now explicitly switches to print media for every PDF and back to screen media afterward. Regenerated PDFs passed the independent page-count and content audit.

## Visual review

The implementation was compared with `design/reference.png` using image inspection at the concept's 1536 × 1024 viewport. `evidence/desktop-final.png` is a full-page capture from that viewport. The comparison covered copy, layout, typography, color, spacing, icon treatment, and responsive behavior. The main visual direction is preserved; intentional differences required for correct print geometry are recorded in `design/CONCEPT.md`.

Final visual review found no clipped text, overlapping controls, missing local assets, or unintended horizontal scrolling in the inspected screenshots. The three PDF styles use distinct layouts and typography, not only different colors.

## Repeatable commands

```text
node --test tests/core.test.cjs
node --check app.js
node --check core.js
node --check tests/browser.cjs
node tests/browser.cjs
python tests/verify-pdfs.py
python tests/verify-package.py path/to/event-badge-maker.zip
```

The browser test uses `chromium.launch`, an offline browser context, `page.goto(fileURL)`, locator interactions, screenshots, explicit print-media emulation, and `page.pdf`. Local package and browser paths were supplied through `NODE_PATH` and `CHROME_PATH`; those development paths are not embedded in the application.

## ZIP delivery verification

The packaged project was extracted into a separate folder whose path contains spaces. The extracted `index.html` was opened offline and the **23 browser checks and 80 PDF checks passed again**. The repeated raw results are `evidence/packaged-browser-results.json` and `evidence/packaged-pdf-results.json`. Application files were unchanged after this run; only these results and this delivery note were added to the final archive.

The archive verification script checks CRC integrity, safe relative paths, duplicate entries, the complete source file list, and SHA-256 equality for every packaged file. A final archive-level verification record and SHA-256 file accompany the ZIP.

## Remaining limits

- No physical printer or print driver was tested. Use the documented settings and measure one test badge before a batch.
- Firefox, Safari, real mobile file-opening workflows, and screen-reader software were not exercised. Mobile results refer to responsive browser viewports, not physical devices.
- Unusual Unicode glyphs depend on installed system fonts. Very long labels can become small; the app warns or blocks printing if fitting is insufficient.
- The 1,000-attendee case was rendered and validated in the browser; a 167-page PDF was not generated. PDF pagination was verified with 1–13 attendees.
- The native Save as PDF dialog was not clicked manually. The print-button call and browser-generated PDF output were tested separately.
- No external account or AgentGit upload was performed. The generated visual reference is a design aid only and is not loaded by the app.

The optional Browser plugin can be installed for future in-app navigation and UI inspection; it is not needed to run this project.
