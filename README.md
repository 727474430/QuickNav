# QuickNav - 快捷导航

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/chrome-v88%2B-brightgreen.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg)

**Your Universal Web Navigator**

一键直达任何网页 - 强大的Chrome扩展，支持自定义网站、书签、标签页和历史记录的智能搜索与快速访问。

[English](./README_EN.md) | 简体中文

</div>

## 📸 预览截图

> 💡 提示：首次开源发布前，建议在此添加项目截图或演示GIF

![插件主界面](./screenshots/main-interface.png)
![搜索演示](./screenshots/search-demo.gif)

<!-- 请将截图放在 screenshots/ 目录下 -->

## 主要特性

- 🚀 快速访问：通过快捷键（Ctrl+Shift+F）快速唤起搜索界面
- 🔍 智能搜索：支持系统名称和拼音缩写搜索
- 📑 多源搜索：支持搜索系统、书签、标签页和历史记录
- ➕ 快速添加：一键将当前网站添加到系统列表
- 🗑️ 便捷管理：直观的系统删除和确认机制
- 💡 智能提示：操作反馈清晰，使用体验流畅
- 🎯 精准定位：支持键盘导航和快速跳转
- 🔐 密码便捷：为系统可选配置密码，打开系统时自动复制到剪贴板

## 安装说明

1. 下载项目代码
2. 打开Chrome浏览器，进入扩展管理页面（chrome://extensions/）
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目目录即可完成安装

## 使用指南

### 基本操作

1. 快速访问
   - 通过以下方式唤起插件：  
      - 在浏览器右上角点击插件图标唤起搜索界面
      - 按下 Ctrl+Shift+F（Windows）或 Command+Shift+F（Mac）唤起搜索界面
   - 输入系统名称或拼音缩写进行搜索
   - 使用方向键选择结果，Enter键打开选中项

2. 添加系统
   - 访问想要添加的网站
   - 按快捷键打开插件
   - 点击左下角"+"按钮即可添加当前网站
   - 系统会自动获取网站标题和URL，并生成拼音缩写

3. 删除系统
   - 在搜索结果中找到要删除的系统
   - 点击右侧"×"图标
   - 在确认对话框中确认删除

### 搜索模式

插件支持四种搜索模式，可以通过下拉菜单或Tab键切换：

- 系统：搜索已添加的业务系统
- 书签：搜索浏览器书签
- 标签：搜索当前打开的标签页
- 历史：搜索浏览历史记录

### 键盘快捷键

- Ctrl+Shift+F / Command+Shift+F：打开搜索界面
- ↑/↓：在搜索结果中导航
- Enter：打开选中的项目
- Tab：切换搜索模式
- Esc：关闭搜索界面

## 项目结构

```
my-chrome-extension/
├── manifest.json        # 扩展配置文件
├── popup.html          # 弹出窗口界面
├── popup.js           # 弹出窗口逻辑
├── content.js         # 内容脚本
├── background.js      # 后台脚本
├── systemsManager.js  # 系统管理器
├── searchStats.js     # 搜索统计
├── styles.css         # 样式文件
└── images/           # 图标资源
    ├── add.png
    ├── keyboard.png
    ├── search.png
    └── setting.png
```

## 技术特性

- 原生JavaScript实现，无需额外依赖
- 支持中文拼音搜索
- 本地存储系统数据
- 实时搜索和过滤
- 优化的UI渲染性能
- 完善的错误处理机制

## ⚙️ 高级配置

### LLM智能命名

插件支持集成大语言模型来优化系统名称：

1. 打开设置页面
2. 启用"LLM优化命名"选项
3. 配置以下参数：
   - **模型名称**：如 `GLM-4.5-Flash`、`gpt-4o-mini` 等
   - **API地址**：OpenAI兼容的Chat Completions接口
   - **API密钥**：你的API Key（仅存储在本地）
4. 点击"测试命名"验证配置

**支持的LLM提供商**：
- 智谱AI（GLM系列）
- OpenAI（GPT系列）
- 其他兼容OpenAI协议的服务

## ⚠️ 注意事项

1. **权限说明**：首次使用需要授予以下权限
   - 标签页访问权限（切换和添加标签）
   - 书签访问权限（搜索书签）
   - 历史记录访问权限（搜索历史）
   - 剪贴板写入权限（复制密码）

2. **数据存储**：系统数据存储在本地（localStorage + chrome.storage），清除浏览器数据可能会影响已保存的系统列表

3. **性能优化**：搜索结果默认每页显示5条，使用左右箭头键翻页

4. **隐私保护**：所有数据仅保存在本地，不会上传到任何服务器（LLM功能除外，需要调用配置的API）

## ❓ 常见问题 (FAQ)

<details>
<summary><b>Q: 为什么快捷键不生效？</b></summary>

A: 请检查：
1. 访问 `chrome://extensions/shortcuts` 确认快捷键是否被其他扩展占用
2. 某些Chrome特殊页面（如chrome://、edge://）不支持内容脚本注入
3. 尝试重新加载扩展程序
</details>

<details>
<summary><b>Q: 如何备份我的系统列表？</b></summary>

A: 打开设置页面，点击"导出"按钮即可将系统列表保存为JSON文件。恢复时点击"导入"选择该文件即可。
</details>

<details>
<summary><b>Q: LLM功能需要付费吗？</b></summary>

A: LLM功能是可选的，需要你自己申请API密钥。不同提供商有不同的定价策略，大多数提供免费额度。不启用LLM时，插件会使用本地拼音规则生成缩写。
</details>

<details>
<summary><b>Q: 支持同步到其他设备吗？</b></summary>

A: 当前版本暂不支持云端同步，但你可以通过"导出/导入"功能手动同步数据。未来版本可能会添加云同步功能。
</details>

<details>
<summary><b>Q: 如何修改已添加的系统信息？</b></summary>

A: 打开设置页面，在系统列表中直接修改对应行的信息，修改后会自动保存。
</details>

## 🚀 发布和安装

### Chrome Web Store（即将上线）

<!-- 待上架后更新链接 -->
> 🔜 即将在Chrome Web Store上架，敬请期待！

### 手动安装（开发者模式）

适用于开发测试或商店审核期间：

```bash
# 1. 克隆项目
git clone https://github.com/your-username/sys-go.git
cd sys-go

# 2. 在Chrome中加载
# - 打开 chrome://extensions/
# - 启用"开发者模式"
# - 点击"加载已解压的扩展程序"
# - 选择项目目录
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request来帮助改进这个项目！

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 代码规范

- 保持代码风格一致
- 添加必要的注释（JSDoc格式）
- 更新相关文档
- 确保功能正常运行

### 报告问题

如果发现Bug或有功能建议，请[提交Issue](https://github.com/your-username/sys-go/issues)，并提供：
- 详细的问题描述
- 复现步骤
- 浏览器版本和扩展版本
- 截图或错误信息（如有）

## 🔒 隐私政策

- ✅ 所有数据仅存储在本地浏览器中
- ✅ 不收集任何用户信息
- ✅ 不向第三方发送数据（LLM功能除外，且需用户主动配置）
- ✅ 开源透明，代码可审计

## 📄 许可证

本项目采用 [MIT License](./LICENSE) 开源许可证。

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

## 📮 联系方式

- Issues: [GitHub Issues](https://github.com/your-username/quicknav/issues)
- Email: your-email@example.com

---

<div align="center">

如果这个项目对你有帮助，请给它一个 ⭐️ Star！

Made with ❤️ by QuickNav Contributors

</div> 
