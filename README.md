# Lumiverse Avatar Zoom & Inspector (JanitorAI Style)

A lightweight frontend extension for [Lumiverse](https://github.com/Archkr/Lumiverse) that allows you to click on any character profile picture or avatar and open an interactive floating lightbox with pan, zoom, and inspection capabilities—just like JanitorAI.

---

## ✨ Features

- **Persistent Size & Position Memory:** Remembers your exact zoom scale and screen coordinates across sessions in `localStorage`. Reopening an avatar immediately restores where you placed it and how large it was.
- **Organic Fluid Drag Momentum:** The floating window softly follows your dragging cursor with subtle lag/damping, giving it tactile weight and fluid physics.
- **Transparent Overlay & Chat Passthrough:** The container overlay uses `pointer-events: none` across the entire backdrop. You can interact, type, scroll, and send chat messages simultaneously while having the avatar floating on screen.
- **Floating Draggable Picture Frame:** Click and drag the floating picture to place it anywhere on your screen.
- **Zero Button Clutter:** No bulky buttons or HUD bars. Clean, borderless floating image frame with subtle glass styling.
- **Minimal Corner Close Icon:** A tiny, unobtrusive `✕` button neatly placed directly on the top-right corner of the image that appears smoothly on hover.
- **Pinch-In / Pinch-Out & Trackpad Zoom:**
  - Full two-finger pinch-to-zoom on touch devices.
  - Trackpad pinch gesture support (via wheel `ctrlKey` delta scaling).
  - Smooth mouse wheel zoom anchored to the cursor.
- **Double-Click Quick Toggle:** Double-click on the image to quickly toggle between default scale and 2x zoom.
- **Auto Full-Resolution Extraction:** Strips thumbnail parameters to display the highest fidelity artwork.
- **Keyboard Shortcuts:** `Esc` key immediately dismisses the floating picture.

---

## 🚀 Installation in Lumiverse

1. Open **Lumiverse**.
2. Go to the **Extensions** menu / tab.
3. In the repository URL input field, enter:
   ```text
   https://github.com/Unfrom/lumiverse-avatar-zoom
   ```
4. Click **Install**.

---

## 🛠️ Building from Source

If you want to modify or compile the extension locally:

```bash
# Clone the repository
git clone https://github.com/Unfrom/lumiverse-avatar-zoom.git
cd lumiverse-avatar-zoom

# Install dependencies
npm install

# Build the bundled distribution
npm run build
```

The output will be bundled into `dist/frontend.js`.

---

## 📄 License

MIT
