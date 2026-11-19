# Version 3 visual and workflow review

The user confirmed version 2 as the starting point, then explicitly requested a separate Apple-inspired landing page. The editor retains its white header, light-gray canvas, serif headings, blue controls, three-column structure, and ten original templates. My Assets, editable Text, image properties, and removal of coordinate fields support the requested fixes.

## Landing concept and implementation

The built-in image generation tool produced `landing-concept.png` before coding. The prompt requested two sections: a premium hero headed “A great introduction. Designed by you.” with Start Designing / Explore templates actions and three badge previews, followed by all ten template previews and a small footer. It specified native HTML controls, existing badge designs, white/cool-gray backgrounds, large sans-serif typography, blue rounded buttons, no Apple logos, no fake metrics, and no unrelated features.

Tokens: white header/collection; `#f3f5fb` hero; `#111217` type; `#0758f7` actions; Arial/Helvetica stack; 64 px desktop hero title; 36 px collection title; restrained shadows; 28 px primary-button radius.

The saved concept and latest Playwright screenshots were opened with the image viewer. Compared directly:

1. Header: badge mark and name left, Templates and primary action right.
2. Hierarchy: centered two-line title, supporting copy, actions, three-badge composition.
3. Palette: white/cool-gray surfaces, dark type, blue actions.
4. Typography: bold sans-serif landing title; existing serif editor headings retained.
5. Media: actual canvas previews, restrained rotations/shadows, open collection spacing.
6. Section order: hero → collection → footer; no additional marketing sections.
7. Mobile: two-column collection and existing stacked editor, without document overflow.

Above-the-fold copy matches the brief. One intentional deviation is required by the user's preservation instruction: the generator invented altered miniature badge artwork and slots. Production instead renders the unchanged version 2 templates at their real 2:3 / 3:2 proportions. This makes the hero and collection taller than the mockup. The previews and controls are real code-native content, not a flattened screenshot.

The implementation was checked against the concept's structure, palette, typography, spacing, actions, and preview treatment, with the original-template preservation taking priority. No material unintended visual mismatch remained in the reviewed screenshots.

## Workflow architecture

A canvas remains the rendering source for preview and PNG. An overlaid textarea supplies native keyboard input and selection while the shared renderer displays the draft. Commit writes through the original binding to one attendee record, shared event data, or template-local custom text.

Library assets and image placements have separate identities. Placements carry explicit template/attendee scope. Broad operations use browser-native confirmations and support Undo. Saved projects embed the library and placement references; version 2 files migrate existing logos/backgrounds.

The blue label provides a drag handle during typing; corners resize. Numerical position/size inputs are absent from the DOM. Detailed functional evidence is in `../TEST_RESULTS.md`.
