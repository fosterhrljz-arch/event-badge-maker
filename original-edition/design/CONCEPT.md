# Design reference and verification

`reference.png` was generated with the built-in Image Gen tool as a design aid, using fictional event and attendee data. It is not a runtime asset or a screenshot of the finished app. No external API is needed by the delivered app.

## Design system

- True white editor and paper; pale lavender `#eeedfc` preview canvas.
- Near-black `#141725` text, muted slate labels, thin gray borders.
- Cobalt `#2545ed` primary action and selected controls.
- Conference navy `#15234f` header and mint `#cef2d9` role band.
- Arial/Helvetica system UI typography; Georgia italic for Creative names.
- Compact outline icons, 6–8 px control corner radii, clear focus outlines.
- A single editor rail beside a document canvas. On narrow screens, the editor precedes the scaled paper preview.

## Fidelity ledger

| Comparison | Reference → implementation | Result |
| --- | --- | --- |
| Primary copy | App name, main heading, subtitle, Print / Save PDF, section labels, style names, demo event | Preserved |
| Layout | Header, task heading, left editor, right paper preview, pagination below paper | Preserved |
| Palette | White surfaces, lavender canvas, cobalt action, navy/mint Conference badge | Preserved |
| Typography | Bold sans-serif names and headings, quiet secondary labels | Preserved using local system fonts |
| Controls and icons | Outline print/import/arrow icons; radio tiles; simple inputs | Preserved as native HTML/SVG |
| Paper geometry | Concept paper and cards are schematic rather than physically accurate | Corrected to real A4 and 90 × 80 mm badges; user print requirements take precedence |
| Density and spacing | Concept gives most space to paper and primary task | Implemented with a 400 px desktop editor and a scaled A4 sheet; extra text space supports long labels |
| Badge variants | Minimal and Creative appear only as tiny concept samples | Expanded to full typography/layout variants using the same system: Minimal rules and sparse type; Creative centered italic serif and geometric color |
| Responsive behavior | Concept is desktop-only | Same controls stack cleanly at 320/390 px; paper keeps its aspect ratio |

Above-the-fold copy review: primary reference copy is preserved. Required functional additions are the quote-formatting help, validation messages, print settings/tips, and a small sheet footer. These directly support the requested CSV and printing workflows. There are no unrelated navigation items or extra product features.

The concept and latest desktop implementation were both opened with image inspection. Full-page screenshots, all three PDF designs, long-text output, and a partially filled final page were reviewed. The implementation faithfully follows the reference's visual direction with the intentional geometry and functional adjustments listed above. No material visual defects remained in the inspected output.

## Generation brief

Use case: ui-mockup. Create one polished high-fidelity desktop UI concept screenshot for an offline static web app called Event Badge Maker, full primary tool screen, landscape 1536x1024. Editorial, professional, exceptionally legible, clean white app, soft very pale lavender preview canvas, near-black ink, cobalt blue primary action. No illustrations, no stock images, no marketing hero. Top bar small simple badge outline icon plus Event Badge Maker at left, small text 'Offline. On your device.' at right. Main heading 'Good names. Great first impressions.' and short subtitle 'Turn your guest list into print-ready badges.' Header right primary cobalt button 'Print / Save PDF'. Below a two-column tool: left white settings rail around 380px wide, right pale lavender canvas around 800px. Left sections separated by subtle thin lines: '01 Event details', Event name labeled field containing 'Gathering of Good Ideas'; '02 Attendees' with CSV textarea showing header name,organization,role and fictional lines Avery Morgan,Northstar Studio,Speaker and Jordan Lee,Fieldwork,Attendee; compact outlined 'Import CSV' and small 'Load demo' buttons, help text about CSV headers, muted count '12 attendees ready'; '03 Badge design' with three horizontally arranged radio tile previews and labels Minimal, Conference, Creative, Conference selected with cobalt border. Bottom left simple text print note 'A4 portrait / 6 badges per page / 90 × 80 mm'. Right top toolbar 'Print preview' on left and '12 badges · 2 pages' right. White A4 paper preview centered with soft shadow, showing six 90x80 mm badges in 2 columns by 3 rows, dotted fine cut boundaries, generous white margin. Each Conference badge has dark navy header showing event title, large left aligned attendee name on white body, small organization, pale mint bottom strip with role text. Six fictional attendees: Avery Morgan / Northstar Studio / SPEAKER; Jordan Lee / Fieldwork / ATTENDEE; Priya Shah / Brightside Labs / ORGANIZER; Mateo Rivera / Common Ground / SPEAKER; Camille Laurent / Atelier Nine / ATTENDEE; Noah Park / Open Field / VOLUNTEER. Preview should use consistent dimensions, understated typography and clear hierarchy. Footer below page 'Page 1 of 2' with previous/next outlined icon buttons. All UI controls and text must be practical code-native HTML/CSS, crisp readable system sans, no logos or external fonts needed. Complete main editor not a landing page. No extra navigation, search, avatars, dashboards, fake metrics or unrelated features.
