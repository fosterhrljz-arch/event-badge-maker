# Version 2 design and visual verification

Historical notes for the original collection. See `UPDATE_NOTES.md` for version 3 editing and landing-page changes.

The research in `../RESEARCH.md` preceded three generated concept boards: `portrait-concept.png`, `landscape-concept.png`, and `editor-concept.png`. The two collection boards define the badge styles. The editor concept defines the workspace structure; its incidental, inconsistent thumbnail artwork was not used as the template specification.

## Concept compared with the actual implementation

Reviewed against `../evidence/desktop-editor.png` and `../evidence/template-gallery.png`:

1. **Structure:** the white header, left template library, central light-gray canvas, and right properties panel are retained. The header carries local Open/Save and the primary blue export action.
2. **Typography:** serif interface headings contrast with compact sans-serif controls. Badge names use either large serif or bold sans-serif type; mono metadata distinguishes the technical templates. Production uses local system font stacks rather than rasterized lettering.
3. **Palette:** ivory/orange, navy/cobalt, lime/lilac, sand/olive, and dark/rainbow portrait palettes match the collection concept direction. Horizontal templates retain their separate white/navy, forest/sage, ivory/orange, cobalt/mint, and gray/orange identities.
4. **Graphic placement:** corner block, cropped arcs, vertical measurement rail, branching curves, crossed ellipses, side band, split panel, corner sun, diagonal plane, and ruled grid are separately implemented as native canvas artwork.
5. **Hierarchy:** names remain the principal personal-information element. Company/event labels stay secondary. Role placement varies deliberately: footer, colored label, capsule, or grid cell.
6. **Spacing and proportions:** all portrait badges share a 600 × 900 design space and landscape badges a 900 × 600 space. Margins and text boxes are explicitly defined; the gallery displays actual exports without perspective distortion.
7. **Controls and responsiveness:** selection outlines, corner handles, image controls, undo, and attendee navigation are functional. At small widths, the library becomes a swipeable row and the inspector moves below the canvas. Desktop sidebars scroll independently.

## Intentional differences from the concepts

- Production shapes are crisp vector drawing instructions, without the concept images' simulated paper texture or lighting. This keeps the app small and gives clean high-resolution exports.
- Exact name sizes and line breaks accommodate system fonts and attendee variation. The application fits actual glyph bounds, including accents and italic overhangs, rather than using a fixed raster name treatment.
- Spectrum uses intersecting gradient ellipses instead of reproducing the concept's ribbon shading. Each ellipse remains sharp at every export scale.
- Editable event and organization fields are separate boxes, including in Vector and Spectrum. This avoids losing one field when another gets longer.
- The real inspector adds element selection, content bindings, auto-fit, and layer controls. Its greater height is handled with scrolling rather than shrinking controls to fit the illustrative mockup.
- Concept-only numbering and arbitrary credential details were omitted where they added no user value. Year labels in Split, Spectrum, and Index are explicit editable custom text.

## Visual review outcome

All ten production exports were inspected together in the actual-output gallery. Portrait and landscape names, labels, artwork, margins, and hierarchy were visible without unintended overlaps in the demo. Desktop and phone screenshots were inspected. Testing found and fixed a 320 px header overflow; no document-width overflow remained at 320, 390, 768, or 1024 px. Selection handles appear only in the editor.

The templates are deliberately different compositions, not palette swaps. Logos/backgrounds are user-supplied raster images; text and the template artwork render at export resolution. Highly compressed or small uploaded images cannot gain detail merely by exporting more pixels.
