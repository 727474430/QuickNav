const SystemsManager = {
  systems: [],

  // 从 localStorage 中加载系统列表
  loadSystems() {
    const storedSystems = localStorage.getItem('systems');
    if (storedSystems) {
      try {
        const parsed = JSON.parse(storedSystems);
        // 兼容历史数据：补齐缺失字段
        this.systems = Array.isArray(parsed)
          ? parsed.map((s) => ({
              name: s.name || '',
              address: s.address || '',
              pinyin: s.pinyin || '',
              password: s.password || ''
            }))
          : [];
      } catch (e) {
        this.systems = [];
      }
    } else {
      // 如果 localStorage 中没有数据，使用默认系统列表（示例）
      this.systems = [
        { name: 'GitHub', address: 'https://github.com', pinyin: 'gh', password: '' },
        { name: 'Google', address: 'https://www.google.com', pinyin: 'gg', password: '' },
        { name: '示例系统', address: 'https://example.com', pinyin: 'slxt', password: '' }
      ];
      this.saveSystems();
    }
    return Promise.resolve(this.systems);
  },

  // 保存系统列表到 localStorage
  saveSystems() {
    localStorage.setItem('systems', JSON.stringify(this.systems));
    return Promise.resolve();
  },

  // 归一化地址（用于去重）
  _normalizeAddress(address) {
    try {
      const u = new URL(address);
      const pathname = (u.pathname || '/').replace(/\/+$/, '');
      return `${u.protocol}//${u.host}${pathname}`;
    } catch (e) {
      return (address || '').replace(/\/+$/, '');
    }
  },

  // 添加新系统（按URL去重，存在则更新）
  addSystem(system) {
    const normalized = {
      name: system.name || '',
      address: system.address || '',
      pinyin: system.pinyin || '',
      password: system.password || ''
    };

    const targetAddr = this._normalizeAddress(normalized.address);
    const idx = this.systems.findIndex(s => this._normalizeAddress(s.address) === targetAddr);

    if (idx >= 0) {
      // 已存在：更新记录，若新密码为空则保留旧密码
      const keepPassword = normalized.password ? normalized.password : (this.systems[idx].password || '');
      this.systems[idx] = { ...normalized, password: keepPassword };
      return this.saveSystems().then(() => ({ status: 'updated' }));
    }

    this.systems.push(normalized);
    return this.saveSystems().then(() => ({ status: 'added' }));
  },

  // 编辑系统
  editSystem(index, updatedSystem) {
    const normalized = {
      name: updatedSystem.name || '',
      address: updatedSystem.address || '',
      pinyin: updatedSystem.pinyin || '',
      password: updatedSystem.password || ''
    };
    this.systems[index] = normalized;
    return this.saveSystems();
  },

  // 删除系统
  deleteSystem(index) {
    this.systems.splice(index, 1);
    return this.saveSystems();
  },

  // 获取所有系统
  getAllSystems() {
    return this.systems;
  },

  // 搜索系统
  searchSystems(query) {
    return this.systems.filter(system =>
      (system.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (system.pinyin || '').toLowerCase().includes(query.toLowerCase()) ||
      (system.address || '').toLowerCase().includes(query.toLowerCase())
    );
  },

  // 导入系统列表
  importSystems(importedSystems) {
    this.systems = (Array.isArray(importedSystems) ? importedSystems : []).map((s) => ({
      name: s.name || '',
      address: s.address || '',
      pinyin: s.pinyin || '',
      password: s.password || ''
    }));
    return this.saveSystems();
  }
};

