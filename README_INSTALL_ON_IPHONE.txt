STORYLOOM v0.4.0 — DEDICATED ROSE LAUNCHER 🌹

WHAT CHANGED
- A separate floating rose button opens Storyloom anywhere in SillyTavern.
- Settings are built directly into the extension script. No settings.html fetch or template renderer.
- No need to navigate Extensions settings to launch it.
- Same romance-book cover, moods, word-length choices and OC protection rules.
- No changes to your RP chats or presets.

UPDATE THE SAME GITHUB REPOSITORY
1. Open the ZIP in iPhone Files and extract it.
2. On GitHub, open YOUR EXISTING Storyloom-v2 repository.
3. Replace three files in its repository root: index.js, style.css, and manifest.json.
   The existing settings.html can remain; this new version does not read it.
   Do not upload the ZIP itself.
4. Return to SillyTavern -> Extensions -> Manage extensions -> Storyloom -> Update.
5. Reload SillyTavern. The floating rose should appear near the lower-right edge. Tap it to open.

IF 'ERROR RENDERING TEMPLATE' STILL APPEARS
Temporarily disable only Storyloom and refresh. If the error stays, it comes from another extension or the host. If it disappears, Storyloom needs additional debugging on that host.

TROUBLESHOOTING
- The extension has not been verified in your hosted SillyTavern instance.
- Do not delete your chat data, presets or all extensions.
- The Prompt API and styling are based on official SillyTavern extension documentation.
