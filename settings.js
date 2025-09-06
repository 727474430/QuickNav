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
  function createSystemRow(system, index) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${system.name}</td>
      <td>${system.address}</td>
      <td>${system.pinyin}</td>
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
      <td>
        <button class="save-button" data-index="${index}">保存</button>
        <button class="cancel-button" data-index="${index}">取消</button>
      </td>
    `;
    return row;
  }

  // 添加新系统
  function addSystem() {
    const newSystem = { name: '', address: '', pinyin: '' };
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
    if (inputs.length !== 3) {
      console.error('Expected 3 input fields, found:', inputs.length);
      return;
    }

    const [nameInput, addressInput, pinyinInput] = inputs;

    const updatedSystem = {
      name: nameInput.value,
      address: addressInput.value,
      pinyin: pinyinInput.value
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

  // 初始加载系统列表
  SystemsManager.loadSystems().then(renderSystems);
});
