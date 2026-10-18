# 🌹 Storyloom v0.5 · Romance Library

This is a **SillyTavern Chat UI extension** with an independent draggable launcher, romance style presets, AO3-focused prompt steering, and a backup **Open Storyloom** button in the Extensions settings.

## Update an existing install

1. Upload **index.js**, **style.css**, and **manifest.json** from this ZIP into the **root** of your existing GitHub repository, replacing the older versions. Keep the filenames exactly as written.
2. Verify that your GitHub `manifest.json` contains `"version": "0.5.0"`. Safari refresh alone **does not update the GitHub repo**.
3. In SillyTavern, open **Extensions → Manage Extensions**. Update Storyloom and make sure its checkbox is checked. If your host doesn't provide an Update option, ask your host how user-installed extensions refresh; reinstall from the repo only if appropriate.
4. Reload SillyTavern. Look for the floating 🌹 rose, or scroll to the **Open Storyloom** button at the bottom of Extensions.
5. Drag the rose with one finger. Let go to save its position. Tap it to open the book. Advanced → Reset rose position restores the default.

**Troubleshooting:** If you see `Storyloom | Romance Library · Rose Launcher` in Manage Extensions, you're still on v0.4. If you see `Draggable Rose`, v0.5 manifest loaded. If neither rose nor menu button is visible on v0.5, send a screenshot of Manage Extensions and any JavaScript console error to the developer.

The host must permit third-party UI extensions. The extension doesn't store or access API keys. Do not upload API keys to a public repository.
