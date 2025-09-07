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
      // 如果 localStorage 中没有数据，使用默认系统列表
      this.systems = [
        { name: '新官网', address: 'https://www.groupama-sdig.com', pinyin: 'xgw', password: '' },
        { name: '新OA', address: 'http://oa.groupama-sdig.com', pinyin: 'xoa', password: '' },
        { name: 'IT小盟', address: 'http://it.groupama-sdig.com', pinyin: 'itxm', password: '' },
        { name: 'Fastgpt', address: 'http://10.28.8.72:3020/app/list', pinyin: 'fastgpt', password: '' },
        { name: 'OneAPI', address: 'http://10.28.8.72:3000/', pinyin: 'oneapi', password: '' },
        { name: 'ELK-生产', address: 'http://10.28.9.170:5601/app/home', pinyin: 'elksc', password: '' },
        { name: 'ELK-测试', address: 'http://10.28.3.66:5601/app/home', pinyin: 'elkcs', password: '' },
        { name: 'AI智能化平台', address: 'http://10.28.8.203:8080/', pinyin: 'aiplatform', password: '' },
        { name: 'SQL平台', address: 'http://archery.groupama-avic.com.cn/sqlquery/', pinyin: 'sqlpt', password: '' }
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

  // 添加新系统
  addSystem(system) {
    const normalized = {
      name: system.name || '',
      address: system.address || '',
      pinyin: system.pinyin || '',
      password: system.password || ''
    };
    this.systems.push(normalized);
    return this.saveSystems();
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
      (system.pinyin || '').toLowerCase().includes(query.toLowerCase())
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

