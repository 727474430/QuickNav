# QuickNav 1.0.1

发布日期：2025-10-16

## 亮点
- 统一默认快捷键为 `Alt+Shift+K`（macOS 显示为 `Option+Shift+K`）用于“打开搜索弹窗”，避免常见冲突，并确保在 Chrome 快捷键页面能看到默认值。

## 变更
- `manifest.json` 中为 `toggle-search` 显式设置 `default/windows/linux/mac` 键位为 `Alt+Shift+K`。

## 修复
- “添加当前网站”首次使用无需先打开搜索框：隐藏 iframe 加载路径修正为 `src/popup/popup.html`，保证消息通道可用。
- Chrome “快捷键”页默认显示为空的问题：为 `toggle-search` 与 `add-current-site` 都显式声明平台键位，避免默认值丢失。

## 文档与资源
- 更新 `README.md`、`README_EN.md`、`INTRODUCTION.md` 中的快捷键说明。
- 更新截图：`screenshots/setting-keyword.png`。

## 升级与提示
- 更新扩展后：访问 `chrome://extensions/` 点击“重新加载”。
- 在 `chrome://extensions/shortcuts` 核对并按需自定义快捷键；如某些环境仍冲突，可自行改为其它组合。

---

## English Summary
- Default hotkey to open search is now `Alt+Shift+K` across platforms (shows as `Option+Shift+K` on macOS).
- Fix: "Add current site" works on first use by loading hidden iframe from `src/popup/popup.html`.
- Fix: Avoid blank defaults on Chrome shortcuts page by explicitly setting platform-specific key mappings.
- Docs & assets updated accordingly.
