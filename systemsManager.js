const SystemsManager = {
  systems: [],

  // 从 localStorage 中加载系统列表
  loadSystems() {
    const storedSystems = localStorage.getItem('systems');
    if (storedSystems) {
      this.systems = JSON.parse(storedSystems);
    } else {
      // 如果 localStorage 中没有数据，使用默认系统列表
      this.systems = [
        { name: '新官网', address: 'https://www.groupama-sdig.com', pinyin: 'xgw' },
        { name: '新OA', address: 'http://oa.groupama-sdig.com', pinyin: 'xoa' },
        { name: 'IT小盟', address: 'http://it.groupama-sdig.com', pinyin: 'itxm' },
        { name: 'Fastgpt', address: 'http://10.28.8.72:3020/app/list', pinyin: 'fastgpt' },
        { name: 'OneAPI', address: 'http://10.28.8.72:3000/', pinyin: 'oneapi' },
        { name: 'ELK-生产', address: 'http://10.28.9.170:5601/app/home', pinyin: 'elksc' },
        { name: 'ELK-测试', address: 'http://10.28.3.66:5601/app/home', pinyin: 'elkcs' },
        { name: 'AI智能化平台', address: '	http://10.28.8.203:8080/', pinyin: 'aiplatform' },
        { name: 'SQL平台', address: 'http://archery.groupama-avic.com.cn/sqlquery/', pinyin: 'sqlpt' }
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
    this.systems.push(system);
    return this.saveSystems();
  },

  // 编辑系统
  editSystem(index, updatedSystem) {
    this.systems[index] = updatedSystem;
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
      system.name.toLowerCase().includes(query.toLowerCase()) || 
      system.pinyin.toLowerCase().includes(query.toLowerCase())
    );
  },

  // 添加新方法
  importSystems(importedSystems) {
    this.systems = importedSystems;
    return this.saveSystems();
  }
};
