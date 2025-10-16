# Changelog

All notable changes to this project will be documented in this file.

This project adheres to Keep a Changelog conventions and uses Semantic Versioning when possible.

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

