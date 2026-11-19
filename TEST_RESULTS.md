# Actual test results — version 3

Executed November 6, 2026 against the delivered plain HTML/CSS/JavaScript app.

| Group | Passed | Failed | Evidence |
| --- | ---: | ---: | --- |
| CSV, editing, assets, migration, validation, ZIP units | 62 | 0 | `evidence/unit-results.tap` |
| Real browser workflows | 56 | 0 | `evidence/browser-results.json` |
| Independent PNG/ZIP integrity checks | 22 | 0 | `evidence/export-verification.json` |
| **Total** | **140** | **0** | |

Environment: Windows, Node 24.16.0, Playwright 1.62.1, Chrome 156.0.8078.80, Python 3.12.8. Browser plugin not available; the project's local Playwright workflow was used. The actual app opened with `file://` and browser networking disabled. No server or external account was needed.

## Requested scenarios

| Scenario | Observed result |
| --- | --- |
| Edit an existing name and switch attendees | Names remained independent; `name` binding was preserved |
| Upload into My Assets | One stored file, zero placements; all ten layouts unchanged |
| Place an image on one template | Only that template changed; the others remained equal |
| Remove all placements | Cancel preserved them; confirmation removed ordinary images, backgrounds, and badge-only placements; asset stayed in library; one Undo restored placements |
| Drag and resize without coordinates | Text/images moved and resized through pointer events and handles; X/Y/W/H fields were absent |

## Editing and assets

- Direct name, organization, role, event, company, and custom-text edits; inspector edits without changing bindings; Enter commit; Escape cancel.
- Invalid empty names retained the previous value. Extra CSV columns, quoted values, and stable person identities survived edits.
- Typing did not move text. The blue label could drag text during editing. Duplicate, Delete, layer order, Undo, and Redo were exercised.
- Independent template placements; attendee-only images hidden from other attendees; fit/opacity; explicit backgrounds.
- Replace one placement; confirmed shared-file replacement retaining geometry; deletion/cancellation and Undo restoration.
- Save/open round-trip preserved the asset library, placements/scopes, edits, and selected attendee.
- Version 2 migration retained ten logo placements and one background; remove-all worked on the migrated logo.
- Invalid uploads and remote-image projects left current data intact.
- CSV import, quoted fields, malformed/empty data, demo restore, HTML-like literal values, overflow blocking, and batch cancellation.

## Export and visual preservation

At 2×, exported PNGs were decoded and compared with canvas pixels after save/open, template switching, attendee switching, scoped images, and an active text edit. The final browser run passed exact per-channel equality for these comparisons. Handles and editing controls are DOM overlays outside the exported canvas.

All ten default template definitions are deeply equal to version 2. Each was exported at 3× and compared with the previous ZIP's actual PNG. Historical image comparison permits at most 8/255 difference per channel and fewer than 0.1% changed channels, accommodating minute antialiasing differences between browser runs. This tolerance is separate from the exact same-run canvas/export checks. Original layout definitions remain identical.

All twelve demo attendees and maximum-length attendee fields fit every template. Dimensions were checked at 1×, 3×, and 4×; landscape 4× was 3600 × 2400 px. A batch contained twelve unique filenames and twelve distinct PNGs. Python independently verified extraction, ZIP CRCs, PNG chunk CRCs, dimensions, and pixel-stream decompression.

A later attendee that could not fit stopped the batch without a partial ZIP. Cancelling a 100-attendee batch restored controls without a partial download.

## Landing and responsive QA

The title, hero, ten real previews, Start Designing controls, and template entry points worked. Returning home and reopening the editor retained the session.

| Check | Result |
| --- | --- |
| Page identity, title, meaningful content | Pass |
| Framework error overlay | None |
| Console health | Zero JavaScript errors |
| Network behavior | Zero external requests; offline mode enabled |
| Interaction loop | Landing → edit/place → switch → save/open → export passed |
| Desktop | 1536 × 1024 screenshot |
| Responsive widths | 320, 390, 768, 1024 px; no document overflow |
| Touch and keyboard | Emulated touch dragging and three-tab keyboard navigation passed |

Evidence: `landing-desktop.png`, `landing-mobile.png`, `desktop-editor.png`, `mobile-editor.png`, `assets-editor.png`, and the exported-image gallery under `evidence/`. Design comparison is in `design/UPDATE_NOTES.md`.

## Delivery and limitations

The extracted ZIP passed a separate rerun of all 56 browser checks with networking disabled. All eight runtime file hashes matched the final delivered files. Its results are in `evidence/package-browser-results.json`; repeat checks are not added to the total above. `evidence/package-runtime-verification.json` compares the tested runtime with the final delivery. The final ZIP is verified against its SHA-256 manifest and ZIP CRCs.

Chrome/Windows is the tested environment. Touch is emulated. Physical devices, Safari, Firefox, screen-reader software, and low-memory stress behavior remain untested. The 1,000-attendee ceiling is parser-tested; a 1,000-image export was not stress-tested. Batch integrity used twelve attendees and cancellation used one hundred. System fonts can vary across platforms.
