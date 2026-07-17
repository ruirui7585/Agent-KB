# Delivery Checklist

## Static Package

- [x] `index.html` exists as the GitHub Pages entry.
- [ ] `index.html` is self-contained for GitHub Pages sharing. Axhub test integration currently requires the sibling `axhub/` directory.
- [x] `prototype.html` keeps the same prototype function entry.
- [x] CSS is split into `css/prototype.css`.
- [x] JS is split into `js/prototype.js`.
- [x] IM Chat screenshot is packaged in `assets/images/im-chat-reference.png`.
- [x] User Profile screenshot is packaged in `assets/images/user-profile-reference.png`.
- [x] `prototype.html` uses only relative resource paths within this requirement folder.
- [ ] `index.html` has no external CSS / JS / image dependency. The prototype remains image/CSS self-contained but loads Axhub scripts from `axhub/`.

## Preview

- [x] Local HTTP preview opens `index.html`.
- [x] Main UI renders without a blank screen.
- [x] Axhub annotation markers, directory, and state controls remain available.
- [x] IM Chat defaults to Configured without the invalid comparison tab.
- [x] Chat and User Profile preview switching remains available.
- [x] Call sheet and locked-state prompts remain driven by existing JS.

## GitHub Sharing

- [x] Upload the whole requirement folder, not only the HTML file.
- [x] Use GitHub Pages for the share link.
- [x] Share the GitHub Pages URL that loads `index.html`.
- [ ] After GitHub upload, verify the public Pages URL renders the same page.
