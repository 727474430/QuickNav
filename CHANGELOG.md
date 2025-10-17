# Changelog

All notable changes to this project will be documented in this file.

This project adheres to Keep a Changelog conventions and uses Semantic Versioning when possible.

## [1.0.2] - 2025-10-17

### Added
- Single Hotkey Mode: double-press the main hotkey to "Add current website"; single press opens the search after a delay.
- Adjustable double-press detection delay (200–800ms, default 380ms) via Settings slider.
- Shortcuts Status panel in Settings to show current bindings and open Chrome’s shortcuts page.

### Fixed/Improved
- Hardened messaging between background/content/popup to avoid `Receiving end does not exist` and `message port closed` warnings; added safe responses and removed unnecessary callbacks.

### Removed
- Context menu fallback to keep the extension focused on hotkeys and UI workflow.

## [1.0.1] - 2025-10-16

### Highlights
- New default shortcut for opening the search popup: `Alt+Shift+K` across platforms (macOS shows as `Option+Shift+K`). This avoids common conflicts and ensures a visible default on Chrome's shortcuts page.

### Changed
- Set `toggle-search` default key to `Alt+Shift+K` on Windows/Linux/macOS via `manifest.json` (`suggested_key` for `default/windows/linux/mac`).

### Fixed
- "Add current site" hotkey works on first use without opening the search UI. Hidden iframe now loads from `src/popup/popup.html` ensuring the message channel is available.
- Prevent empty default display on the Chrome shortcuts page by explicitly declaring platform-specific keys for both commands.

### Documentation & Assets
- Updated shortcut references in `README.md`, `README_EN.md`, and `INTRODUCTION.md`.
- Refreshed screenshot `screenshots/setting-keyword.png` to reflect new key mappings.

## [1.0.0] - 2025-10-14
- Initial public version.
