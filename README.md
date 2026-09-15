# My Journal

Open `index.html` in a modern browser. No installation, build step, external fonts, or internet connection is required.

The heart tunnel starts automatically and softly fades into a pastel journal. Use Previous / Next or the left / right arrow keys to turn pages. Clicking the closed cover also opens it. The inner pages are intentionally blank except for their page numbers; this version does not include a text editor or saving.

## Customization

- `styles.css`: color tokens, page dimensions, and turn duration are at the top. The pen color uses `--pen`.
- `script.js`: `SETTINGS` controls the number of leaves, intro duration, fade duration, and heart ring count. Four leaves provide seven blank numbered pages plus the front and back covers.
- `index.html`: the minimal page shell and navigation.

Based on the supplied notebook project's hinged 3D page approach and hearts project's canvas heart curves and perspective rings. Portfolio, anniversary text, images, sound, forms, sharing, and unused decorations were removed. Animation uses elapsed time for consistent speed across display refresh rates, and respects reduced-motion preferences.
