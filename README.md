# Event Badge Maker — Offline Studio 3

Create event badges with ten original templates, direct text editing, a reusable local asset library, CSV attendees, and high-resolution PNG export. Plain HTML/CSS/JavaScript: no installation, server, account, API, or internet connection is needed.

## Open the app

1. Extract the complete ZIP into a folder.
2. Open `index.html` in a recent browser.
3. Click **Start Designing**, or select a template preview on the landing page.

**Success:** the editor opens with twelve fictional attendees and the selected template. Click the app name to return home without losing the current session. The landing page shows actual previews of the same ten original designs.

## Version 3 changes

- Click existing text once to edit on the canvas. Attendee name, organization, and role edits update only that person's CSV record and keep their bindings.
- **My Assets** stores uploaded logos, images, and backgrounds. Uploading inserts nothing automatically.
- Place each asset on the active template for all attendees, or only the current attendee's badge on that template.
- Replace one image, replace a shared library file, remove placements from one design, or remove every placement at once. Broad operations ask for confirmation.
- Coordinate fields were removed. Drag elements and use corner handles. Duplicate, Delete, Bring forward, and Send backward remain.
- A separate landing page adds a premium hero, template previews, and working entry buttons. The editor's visual system and all ten template definitions are preserved.

## Edit existing text

1. Click once inside a text box. Its text is selected and ready to replace.
2. Type your wording; the preview updates immediately.
3. Press **Enter** or click outside to commit. **Shift+Enter** adds a line break to custom text. **Escape** discards the draft.
4. Switch attendees below the canvas.

**Success:** changing Avery's name leaves Jordan's name independent. Switching templates shows Avery's edited name through the original binding.

You can also edit the properties panel's **Text** field without switching to Custom Text.

| Content source | What changes |
| --- | --- |
| Attendee name, organization, role | Only the selected person's record, reflected across templates |
| Company name, event name | Shared event information across templates |
| Custom text | That element on the current template, shared across its attendees |

The scope hint identifies the effect. Additional CSV columns and quoted values are preserved. Invalid names, overlong fields, and control characters are rejected; the previous valid value remains. Font, color, alignment, and box geometry are layout properties shared by the template.

## Move and resize

1. Press and drag an element to move it. A click without dragging starts text editing instead.
2. Drag a corner handle to resize the box.
3. While typing, drag the blue label above the box to move it; the interior remains available for normal text selection.
4. Use **Duplicate**, **Delete**, **Bring forward**, and **Send backward** as needed.

**Success:** position and size change directly on the canvas without coordinate inputs. Resizing text changes its wrapping; the font-size control changes type size. Image fit preserves source proportions.

With the canvas focused, arrow keys move one design pixel, or ten with Shift. Enter edits selected text; Delete removes the selected element. Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z undo/redo outside text fields. Inside a text field, native text undo remains available. A committed text edit is one project undo step.

Auto-fit wraps and reduces text within its box. Unbroken words wrap by grapheme cluster. Export stops if text still cannot fit at the minimum size. Review long names and small type at the intended viewing size.

## Upload and place assets

1. Open **My Assets** and click **Upload images**. Choose one or more PNG, JPEG, or WebP files.
2. Select an uploaded asset.
3. Under **Place on**, choose **This template · all attendees** or **This badge only**.
4. Click **Place image** or **As background**.

**Success:** uploading alone leaves all designs unchanged. Placement affects only the chosen template or badge. Other templates can use different images, positions, and sizes.

A background starts as a full-badge image behind template artwork and text. It can be moved, resized, and adjusted for fit/opacity. Turn off **Show template artwork** if desired. Bringing a background forward makes it an ordinary image layer. The original decorative template artwork remains fixed.

My Assets is a **project-local library**, embedded in saved project files and reusable across that project's templates. There is no autosave or browser-wide asset database. Save before closing or reloading.

## Replace or remove images

| Action | Effect |
| --- | --- |
| Select an image; choose another **Image** in properties | Replaces only that placement, retaining position and size |
| **Replace library file** | Updates all placements referencing the asset; confirms when used |
| Select an image; **Delete** | Removes only the selected placement; retains the library file |
| **Remove from this design** | Removes the asset's placements on the current template, including badge-only placements there |
| **Remove all placements** | Confirms, then removes every placement from all templates and badges; retains the library file |
| **Delete from library** | Confirms, then deletes the file and its placements |

**Success:** Remove all placements leaves a count of zero and keeps the asset in My Assets. One Undo restores the placements. Cancelling a confirmation changes nothing.

## Import attendees

Open **Attendees**, enter company/event names, and paste or import UTF-8 CSV:

```csv
name,organization,role
Avery Morgan,Northstar Studio,Speaker
"Lee, Jordan","A ""Better"" Studio",Guest
```

**Success:** preview and count update. **Demo** restores twelve fictional attendees. Invalid CSV displays a line-specific error and disables export.

Headers may be reordered and are case-insensitive; `organisation` is accepted. All three headers are required. Organization may be empty; an empty role becomes `Attendee`. Additional named columns survive direct text edits. Duplicate names remain distinct records. Quoted commas, escaped quotes, BOM, CRLF, and multiline quoted fields are supported; attendee-field whitespace is normalized.

Badge-only images follow stable identities during direct text edits. Reimporting unchanged records in a new order keeps their assignments. Replacing or removing a record through CSV removes its badge-only placements. Template-wide placements and library files remain. CSV replacement is undoable.

## Save and reopen

Click **Save project** to download `event-badge-project.json`. Use **Open project** to reopen it.

**Success:** attendee edits, selected attendee, event data, all layouts, My Assets, placement scopes, and resolution return. Embedded images work offline. Invalid files leave the current project intact.

Version 2 projects are supported. Their global logos become reusable library assets with explicit placements preserving the existing designs; backgrounds migrate too. A legacy logo's ten placements can then be removed in one action. New saves use version 3. Imported files are not overwritten.

Project files contain attendee information and uploaded images; store/share them like the source CSV. Resetting a template removes its edits and placements, retains library assets, and is undoable. Save before closing: there is no autosave.

## Export PNGs

Choose a resolution under **PNG export**. Click **Export PNG** for the selected attendee, or **Export all (ZIP)** for all attendees using the active template. An active text draft is committed before export/save; invalid edits must be corrected first.

| Scale | Portrait | Landscape |
| --- | --- | --- |
| 1× | 600 × 900 px | 900 × 600 px |
| 2× | 1200 × 1800 px | 1800 × 1200 px |
| 3× — default | 1800 × 2700 px | 2700 × 1800 px |
| 4× | 2400 × 3600 px | 3600 × 2400 px |

**Success:** the PNG contains only the badge, without handles, editing fields, or controls. Row-numbered filenames keep duplicate names separate. Badge-only images appear for their assigned attendee.

Preview and export share one renderer. PNGs have an opaque badge background. Pixel dimensions define output, not a physical print size or DPI promise. Local system fonts may differ by OS. Small uploaded images cannot gain detail merely by exporting more pixels.

Batch export runs one badge at a time. Cancel takes effect after the current image. If any attendee cannot fit, no partial ZIP is downloaded. Use smaller batches/lower resolution on memory-constrained devices. A4/PDF printing is outside this version's scope.

## Templates and research

Portrait: **Editorial, Signal, Modular, Contour, Spectrum**. Landscape: **Executive, Split, Studio, Vector, Index**. Their artwork, colors, dimensions, and typography definitions are unchanged from version 2.

Open `evidence/template-gallery.html` for actual exported previews. [RESEARCH.md](RESEARCH.md) records public references, attribution evidence, and limitations. These are original designs with fictional branding, not official credentials. Public reference photos and official logos are not bundled.

## Limits and offline behavior

- CSV: up to 1,000 attendees; imported file up to 1 MB. Name 120 characters, organization 160, role 80; pasted CSV 1,000,000 characters.
- Assets: up to 60 files; PNG/JPEG/WebP, 12 MB and 32 megapixels per upload. Images normalize locally to PNG with a maximum long edge of 4096 px. Very large decoded images are rejected. SVG and remote image URLs are unsupported.
- Layout: up to 60 elements per template; type size 10–200 design pixels; custom text up to 1,000 characters. Fonts: Arial, Georgia, Trebuchet MS, Verdana, Courier New, with local fallbacks.
- Projects: up to 35 MB. Batch: up to 128 MB of encoded PNG data. Browser memory can impose a lower practical limit. Undo retains up to 30 states with a memory budget.

All editing is local: no remote fonts, analytics, account services, API calls, or runtime packages. Content security policy blocks network connections. Research links are documentation only and are not fetched by the app.

## Source and tests

Runtime: `index.html`, `styles.css`, `app.js`, `core.js`, `model.js`, `renderer.js`, `zip.js`, `icon.svg`. No build step. The ZIP also includes research, documentation, concepts, actual screenshots/exports, test scripts, historical template fixtures, and measured results.

1. With Node installed, run `npm test`. **Success:** 62 unit tests pass.
2. Make Playwright 1.62.1 available: `npm install --no-save --package-lock=false playwright@1.62.1`. Install Chromium with `npx playwright install chromium`, or set `CHROME_PATH` to an installed Chrome executable.
3. Run `npm run test:browser`. **Success:** 56 checks pass; `evidence/browser-results.json` records zero JavaScript errors and external requests. The browser uses the real `file://` app with networking disabled.
4. With Python 3, run `python tests/verify_exports.py`. **Success:** 22 independent PNG/ZIP checks pass.
5. Optional: `node tests/visuals.cjs` regenerates the gallery. `python tests/build_package.py` builds and verifies the ZIP against its SHA-256 manifest and CRCs.

Installing developer tools may use the internet; normal app use does not. Tests write downloads and replace evidence files locally. Chrome needs permission to write test downloads. Node/Python/Playwright are unnecessary for normal use.

[TEST_RESULTS.md](TEST_RESULTS.md) describes measured coverage and limits. Tests cover Chrome on Windows and emulated touch/mobile layouts. Firefox, Safari, physical mobile devices, and low-memory stress behavior were not tested. No AgentGit upload or publication was performed.
