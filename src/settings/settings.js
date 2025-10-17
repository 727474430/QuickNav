document.addEventListener('DOMContentLoaded', function() {
  const systemsTable = document.getElementById('systems-table').getElementsByTagName('tbody')[0];
  const addSystemButton = document.getElementById('add-system');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');

  let currentPage = 1;
  const itemsPerPage = 10;
  let totalPages = 1;

  // 渲染系统列表
  function renderSystems() {
    const systems = SystemsManager.getAllSystems();
    totalPages = Math.ceil(systems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = systems.slice(startIndex, endIndex);

    systemsTable.innerHTML = '';
    pageItems.forEach((system, index) => {
      const row = createSystemRow(system, startIndex + index);
      systemsTable.appendChild(row);
    });

    updatePagination();
  }

  // 更新分页信息
  function updatePagination() {
    pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
  }

  // 创建系统行
  function maskPassword(pwd) {
    if (!pwd) return '';
    return '•'.repeat(Math.min(pwd.length, 8));
  }

  function createSystemRow(system, index) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${system.name}</td>
      <td>${system.address}</td>
      <td>${system.pinyin}</td>
      <td>${maskPassword(system.password)}</td>
      <td class="action-buttons">
        <button class="edit-button" data-index="${index}">编辑</button>
        <button class="delete-button" data-index="${index}">删除</button>
      </td>
    `;
    return row;
  }

  // 创建可编辑行
  function createEditableRow(system, index) {
    const row = document.createElement('tr');
    row.classList.add('editable-row');
    row.innerHTML = `
      <td><input type="text" name="name" value="${system.name}" required></td>
      <td><input type="text" name="address" value="${system.address}" required></td>
      <td><input type="text" name="pinyin" value="${system.pinyin}" required></td>
      <td><input type="password" name="password" value="${system.password || ''}" placeholder="可留空"></td>
      <td>
        <button class="save-button" data-index="${index}">保存</button>
        <button class="cancel-button" data-index="${index}">取消</button>
      </td>
    `;
    return row;
  }

  // 添加新系统
  function addSystem() {
    const newSystem = { name: '', address: '', pinyin: '', password: '' };
    const systems = SystemsManager.getAllSystems();
    const newIndex = systems.length;
    currentPage = Math.ceil((newIndex + 1) / itemsPerPage);
    renderSystems();
    const newRow = createEditableRow(newSystem, newIndex);
    systemsTable.appendChild(newRow);
  }

  // 编辑系统
  function editSystem(index) {
    const systems = SystemsManager.getAllSystems();
    const system = systems[index];
    const rowIndex = index % itemsPerPage;
    const editableRow = createEditableRow(system, index);
    const currentRow = systemsTable.children[rowIndex];
    if (currentRow) {
      systemsTable.replaceChild(editableRow, currentRow);
    } else {
      console.error('Row not found:', rowIndex);
    }
  }

  // 保存系统
  function saveSystem(index) {
    const systems = SystemsManager.getAllSystems();
    const rowIndex = index % itemsPerPage;
    const row = systemsTable.children[rowIndex];
    
    if (!row) {
      console.error('Row not found:', rowIndex);
      return;
    }

    const inputs = row.querySelectorAll('input');
    if (inputs.length !== 4) {
      console.error('Expected 4 input fields, found:', inputs.length);
      return;
    }

    const [nameInput, addressInput, pinyinInput, passwordInput] = inputs;

    const updatedSystem = {
      name: nameInput.value,
      address: addressInput.value,
      pinyin: pinyinInput.value,
      password: passwordInput.value || ''
    };

    if (updatedSystem.name && updatedSystem.address && updatedSystem.pinyin) {
      if (index < systems.length) {
        SystemsManager.editSystem(index, updatedSystem).then(() => {
          renderSystems();
          currentPage = Math.floor(index / itemsPerPage) + 1;
        });
      } else {
        SystemsManager.addSystem(updatedSystem).then(() => {
          renderSystems();
          currentPage = Math.ceil(systems.length / itemsPerPage);
        });
      }
    } else {
      alert('请填写所有字段');
    }
  }

  // 删除系统
  function deleteSystem(index) {
    if (confirm('确定要删除这个系统吗？')) {
      SystemsManager.deleteSystem(index).then(renderSystems);
    }
  }

  // 事件监听
  addSystemButton.addEventListener('click', addSystem);

  systemsTable.addEventListener('click', function(event) {
    const target = event.target;
    const index = parseInt(target.getAttribute('data-index'));

    if (target.classList.contains('edit-button')) {
      editSystem(index);
    } else if (target.classList.contains('delete-button')) {
      deleteSystem(index);
    } else if (target.classList.contains('save-button')) {
      saveSystem(index);
    } else if (target.classList.contains('cancel-button')) {
      renderSystems();
    }
  });

  prevPageButton.addEventListener('click', function() {
    if (currentPage > 1) {
      currentPage--;
      renderSystems();
    }
  });

  nextPageButton.addEventListener('click', function() {
    if (currentPage < totalPages) {
      currentPage++;
      renderSystems();
    }
  });

  // 添加导入功能
  const importButton = document.getElementById('import-button');
  const fileInput = document.getElementById('file-input');

  importButton.addEventListener('click', function() {
    fileInput.click();
  });

  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const importedSystems = JSON.parse(e.target.result);
          SystemsManager.importSystems(importedSystems).then(() => {
            renderSystems();
            alert('系统链接导入成功');
          });
        } catch (error) {
          alert('导入失败,请确保文件格式正确');
        }
      };
      reader.readAsText(file);
    }
  });

  // 添加导出功能
  const exportButton = document.getElementById('export-button');

  exportButton.addEventListener('click', function() {
    const systems = SystemsManager.getAllSystems();
    const jsonContent = JSON.stringify(systems, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'systems_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // LLM 设置：初始化
  (function initLLMSettings(){
    const elEnabled = document.getElementById('llm-enabled');
    const elKey = document.getElementById('zhipu-api-key');
    const elModel = document.getElementById('zhipu-model');
    const elBase = document.getElementById('zhipu-base-url');
    const btnSave = document.getElementById('save-llm-settings');

    function syncFromStorage() {
      try {
        chrome.storage.local.get(['llm_enabled','zhipu_api_key','zhipu_model','zhipu_base_url'], (items) => {
          const enabled = (items && items.llm_enabled) ? items.llm_enabled === '1' : ((localStorage.getItem('llm_enabled') || '') === '1');
          const key = (items && items.zhipu_api_key) || localStorage.getItem('zhipu_api_key') || '';
          const model = (items && items.zhipu_model) || localStorage.getItem('zhipu_model') || 'GLM-4.5-Flash';
          const base = (items && items.zhipu_base_url) || localStorage.getItem('zhipu_base_url') || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
          if (elEnabled) elEnabled.checked = enabled;
          if (elKey) elKey.value = key;
          if (elModel) elModel.value = model;
          if (elBase) elBase.value = base;
        });
      } catch (_) {
        const enabled = (localStorage.getItem('llm_enabled') || '') === '1';
        const key = localStorage.getItem('zhipu_api_key') || '';
        const model = localStorage.getItem('zhipu_model') || 'GLM-4.5-Flash';
        const base = localStorage.getItem('zhipu_base_url') || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        if (elEnabled) elEnabled.checked = enabled;
        if (elKey) elKey.value = key;
        if (elModel) elModel.value = model;
        if (elBase) elBase.value = base;
      }
    }

    function showSavedToast(text) {
      const tip = document.createElement('div');
      tip.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#4CAF50;color:#fff;padding:8px 12px;border-radius:4px;z-index:9999;font-size:13px;';
      tip.textContent = text || '已保存';
      document.body.appendChild(tip);
      setTimeout(()=>tip.remove(), 1500);
    }

    function persistSettings() {
      const enabledVal = elEnabled && elEnabled.checked ? '1' : '';
      const keyVal = (elKey && elKey.value) || '';
      const modelVal = (elModel && elModel.value) || 'GLM-4.5-Flash';
      const baseVal = (elBase && elBase.value) || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      try { chrome.storage.local.set({ llm_enabled: enabledVal, zhipu_api_key: keyVal, zhipu_model: modelVal, zhipu_base_url: baseVal }); } catch (_) {}
      localStorage.setItem('llm_enabled', enabledVal);
      localStorage.setItem('zhipu_api_key', keyVal);
      localStorage.setItem('zhipu_model', modelVal);
      localStorage.setItem('zhipu_base_url', baseVal);
    }

    if (btnSave) {
      btnSave.addEventListener('click', function(){
        persistSettings();
        showSavedToast('LLM 设置已保存');
      });
    }

    // 自动保存：复选框 change、输入框 blur/Enter
    if (elEnabled) {
      elEnabled.addEventListener('change', function(){
        persistSettings();
        showSavedToast('LLM 设置已保存');
      });
    }
    [elModel, elBase, elKey].forEach(function(el){
      if (!el) return;
      el.addEventListener('blur', function(){
        persistSettings();
        showSavedToast('LLM 设置已保存');
      });
      el.addEventListener('keydown', function(e){
        if (e.key === 'Enter') {
          persistSettings();
          showSavedToast('LLM 设置已保存');
        }
      });
    });

    // 测试命名按钮
    const btnTest = document.getElementById('test-llm');
    const out = document.getElementById('llm-test-output');
    if (btnTest && out) {
      btnTest.addEventListener('click', function(){
        persistSettings();
        out.textContent = '测试中… 请稍候';
        btnTest.disabled = true;
        btnTest.textContent = '测试中…';

        // 选取一个合适的活动标签页（尽量非扩展页面）
        try {
          chrome.windows.getAll({ populate: true }, (wins) => {
            let candidate = null;
            const isHttp = (u) => /^https?:\/\//i.test(u || '');
            const isExtension = (u) => /^chrome(-extension)?:\/\//i.test(u || '') || /^edge:\/\//i.test(u || '') || /^about:/i.test(u || '');

            for (const w of wins) {
              if (!w || !Array.isArray(w.tabs)) continue;
              const activeTab = w.tabs.find(t => t.active);
              if (activeTab && !isExtension(activeTab.url)) { candidate = activeTab; break; }
            }
            if (!candidate) {
              for (const w of wins) {
                for (const t of (w.tabs || [])) {
                  if (isHttp(t.url)) { candidate = t; break; }
                }
                if (candidate) break;
              }
            }
            if (!candidate) candidate = wins?.[0]?.tabs?.[0];

            const title = (candidate && candidate.title) || document.title;
            const url = (candidate && candidate.url) || location.href;

            chrome.runtime.sendMessage({ action: 'llmOptimizeSystemInfo', title, url }, (res) => {
              btnTest.disabled = false;
              btnTest.textContent = '测试命名';
              if (chrome.runtime.lastError) {
                out.textContent = `调用失败: ${chrome.runtime.lastError.message || '未知错误'}`;
                return;
              }
              if (res && res.ok && res.data) {
                out.textContent = JSON.stringify(res.data, null, 2);
              } else {
                out.textContent = '调用失败或未启用/未配置 API Key。';
              }
            });
          });
        } catch (e) {
          btnTest.disabled = false;
          btnTest.textContent = '测试命名';
          out.textContent = `调用失败: ${e && e.message ? e.message : e}`;
        }
      });
    }

    syncFromStorage();
  })();

  // 单一快捷键模式：加载/保存
  (function singleHotkeyModeSetting(){
    const el = document.getElementById('single-hotkey-mode');
    if (!el) return;
    const key = 'single_hotkey_mode';
    function sync(){
      try {
        chrome.storage.local.get([key], (items) => {
          const enabled = (items && items[key]) === '1' || localStorage.getItem(key) === '1';
          el.checked = !!enabled;
        });
      } catch (_) {
        el.checked = (localStorage.getItem(key) === '1');
      }
    }
    function persist(val){
      const v = val ? '1' : '';
      try { chrome.storage.local.set({ [key]: v }); } catch (_) {}
      localStorage.setItem(key, v);
    }
    el.addEventListener('change', ()=> persist(el.checked));
    sync();
  })();

  // 单一快捷键双击判定延迟：加载/保存
  (function singleHotkeyDelaySetting(){
    const slider = document.getElementById('single-hotkey-delay');
    const readout = document.getElementById('single-hotkey-delay-text');
    if (!slider || !readout) return;
    const key = 'single_hotkey_delay_ms';
    const clamp = (n) => Math.min(800, Math.max(200, Math.round(Number(n) || 380)));
    function sync(){
      try {
        chrome.storage.local.get([key], (items) => {
          const raw = (items && items[key]) ?? localStorage.getItem(key);
          const v = clamp(raw);
          slider.value = String(v);
          readout.textContent = `${v} ms`;
        });
      } catch (_) {
        const v = clamp(localStorage.getItem(key));
        slider.value = String(v);
        readout.textContent = `${v} ms`;
      }
    }
    function persist(v){
      const val = clamp(v);
      try { chrome.storage.local.set({ [key]: String(val) }); } catch (_) {}
      localStorage.setItem(key, String(val));
    }
    slider.addEventListener('input', () => {
      const v = clamp(slider.value);
      readout.textContent = `${v} ms`;
    });
    slider.addEventListener('change', () => {
      const v = clamp(slider.value);
      persist(v);
    });
    // 默认值 380
    if (!localStorage.getItem(key)) {
      persist(380);
    }
    sync();
  })();

  // 快捷键状态渲染
  (function renderShortcutStatus(){
    const container = document.getElementById('shortcuts-status');
    const btnOpen = document.getElementById('open-shortcuts');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
      });
    }
    if (!container || !chrome.commands || !chrome.commands.getAll) return;
    try {
      chrome.commands.getAll((cmds) => {
        const map = (cmds || []).reduce((acc, c) => { acc[c.name] = c; return acc; }, {});
        const open = map['toggle-search'];
        const add = map['add-current-site'];
        function fmt(c){ return (c && c.shortcut) ? c.shortcut : '未分配/冲突'; }
        const warn = (txt) => `<span style=\"color:#d93025;\">${txt}</span>`;
        const openTxt = fmt(open);
        const addTxt = fmt(add);
        const openRow = (openTxt.includes('未分配')) ? warn(openTxt) : openTxt;
        const addRow = (addTxt.includes('未分配')) ? warn(addTxt) : addTxt;
        container.innerHTML = `
          <div>打开搜索面板（toggle-search）：<b>${openRow}</b></div>
          <div>添加当前网站（add-current-site）：<b>${addRow}</b></div>
        `;
      });
    } catch (_) { /* ignore */ }
  })();

  // 初始加载系统列表
  SystemsManager.loadSystems().then(renderSystems);
});
