# Enterprise System Quick Access / 企业内部业务系统快速访问插件

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/chrome-v88%2B-brightgreen.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg)

A powerful Chrome extension that helps you quickly access and manage various enterprise internal systems. Supports fast system search, bookmark management, tab switching, and history query.

English | [简体中文](./README.md)

</div>

## 📸 Screenshots

> 💡 Tip: Please add project screenshots or demo GIFs before the first open-source release

![Main Interface](./screenshots/main-interface.png)
![Search Demo](./screenshots/search-demo.gif)

<!-- Place screenshots in the screenshots/ directory -->

## ✨ Key Features

- 🚀 **Quick Access**: Open search interface with hotkey (Ctrl+Shift+F)
- 🔍 **Smart Search**: Support system name and pinyin abbreviation search
- 📑 **Multi-Source Search**: Search systems, bookmarks, tabs, and history
- ➕ **Quick Add**: Add current website to system list with one click (Ctrl+Shift+S)
- 🗑️ **Easy Management**: Intuitive system deletion with confirmation
- 💡 **Smart Hints**: Clear operation feedback for smooth experience
- 🎯 **Precise Navigation**: Full keyboard navigation and quick jump support
- 🔐 **Password Convenience**: Optional password field, auto-copy to clipboard when opening
- 🤖 **AI Naming**: Integrated LLM for smart optimization of system names and pinyin
- 🔢 **Number Shortcuts**: Use number keys 1-5 to quickly open corresponding results
- 📊 **Smart Learning**: Auto-switch search type based on search habits

## 🚀 Installation

### Chrome Web Store (Coming Soon)

<!-- Update link after listing -->
> 🔜 Coming soon to Chrome Web Store!

### Manual Installation (Developer Mode)

For development testing or during store review:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/sys-go.git
cd sys-go

# 2. Load in Chrome
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked extension"
# - Select the project directory
```

## 📖 Usage Guide

### Basic Operations

1. **Quick Access**
   - Access the plugin by:
     - Click the plugin icon in the browser toolbar
     - Press Ctrl+Shift+F (Windows) or Command+Shift+F (Mac)
   - Enter system name or pinyin abbreviation to search
   - Use arrow keys to select results, press Enter to open

2. **Add System**
   - Visit the website you want to add
   - Press the hotkey or click the "+" button in the popup
   - The system will automatically get the website title and URL, and generate pinyin abbreviation

3. **Delete System**
   - Find the system you want to delete in the search results
   - Click the "×" icon on the right
   - Confirm deletion in the confirmation dialog

### Search Modes

The plugin supports four search modes, switchable via dropdown menu or Tab key:

- **Systems**: Search added business systems
- **Bookmarks**: Search browser bookmarks
- **Tabs**: Search currently open tabs
- **History**: Search browsing history

### Keyboard Shortcuts

- Ctrl+Shift+F / Command+Shift+F: Open search interface
- Ctrl+Shift+S / Command+Shift+S: Add current website
- ↑/↓: Navigate through search results
- ←/→: Previous/Next page
- Enter: Open selected item
- Tab: Switch search mode
- Esc: Close search interface
- 1-5: Quick open corresponding result

## 🏗️ Project Structure

```
sys-go/
├── manifest.json        # Extension configuration
├── popup.html          # Popup window UI
├── popup.js           # Popup window logic
├── content.js         # Content script
├── background.js      # Background script
├── systemsManager.js  # System manager
├── searchStats.js     # Search statistics
├── llm.js            # LLM integration
├── settings.html     # Settings page
├── settings.js       # Settings logic
├── styles.css        # Stylesheet
└── images/          # Icon resources
```

## ⚙️ Advanced Configuration

### LLM Smart Naming

The plugin supports integrating large language models to optimize system names:

1. Open the settings page
2. Enable "LLM optimization naming" option
3. Configure the following parameters:
   - **Model Name**: e.g., `GLM-4.5-Flash`, `gpt-4o-mini`, etc.
   - **API URL**: OpenAI-compatible Chat Completions interface
   - **API Key**: Your API Key (stored locally only)
4. Click "Test Naming" to verify configuration

**Supported LLM Providers**:
- Zhipu AI (GLM series)
- OpenAI (GPT series)
- Other OpenAI protocol-compatible services

## ⚠️ Notes

1. **Permissions**: First-time use requires granting the following permissions
   - Tab access (for switching and adding tabs)
   - Bookmark access (for searching bookmarks)
   - History access (for searching history)
   - Clipboard write (for copying passwords)

2. **Data Storage**: System data is stored locally (localStorage + chrome.storage), clearing browser data may affect saved system list

3. **Performance**: Search results display 5 items per page by default, use left/right arrow keys to paginate

4. **Privacy**: All data is saved locally only, not uploaded to any server (except LLM feature, which requires configured API)

## ❓ FAQ

<details>
<summary><b>Q: Why don't hotkeys work?</b></summary>

A: Please check:
1. Visit `chrome://extensions/shortcuts` to confirm hotkeys are not occupied by other extensions
2. Some Chrome special pages (like chrome://, edge://) don't support content script injection
3. Try reloading the extension
</details>

<details>
<summary><b>Q: How to backup my system list?</b></summary>

A: Open the settings page and click the "Export" button to save the system list as a JSON file. To restore, click "Import" and select the file.
</details>

<details>
<summary><b>Q: Is the LLM feature paid?</b></summary>

A: The LLM feature is optional and requires you to apply for an API key yourself. Different providers have different pricing policies, most offer free quotas. Without LLM, the plugin uses local pinyin rules to generate abbreviations.
</details>

<details>
<summary><b>Q: Does it support sync to other devices?</b></summary>

A: The current version doesn't support cloud sync, but you can manually sync data via "Export/Import" feature. Future versions may add cloud sync.
</details>

<details>
<summary><b>Q: How to modify added system information?</b></summary>

A: Open the settings page, directly modify the information in the system list row, changes are auto-saved.
</details>

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to help improve this project!

### How to Contribute

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Keep code style consistent
- Add necessary comments (JSDoc format)
- Update related documentation
- Ensure functionality works properly

### Report Issues

If you find bugs or have feature suggestions, please [submit an Issue](https://github.com/your-username/sys-go/issues) with:
- Detailed problem description
- Reproduction steps
- Browser version and extension version
- Screenshots or error messages (if any)

## 🔒 Privacy Policy

- ✅ All data is stored locally in the browser only
- ✅ No user information collected
- ✅ No data sent to third parties (except LLM feature, which requires user configuration)
- ✅ Open source and transparent, code is auditable

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

## 🙏 Acknowledgments

Thanks to all developers who contributed to this project!

## 📮 Contact

- Issues: [GitHub Issues](https://github.com/your-username/sys-go/issues)
- Email: your-email@example.com

---

<div align="center">

If this project helps you, please give it a ⭐️ Star!

Made with ❤️ by sys-go Contributors

</div>
