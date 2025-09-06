const SearchStats = {
  // 存储搜索统计数据
  stats: {},

  // 从 localStorage 加载统计数据
  loadStats() {
    const storedStats = localStorage.getItem('searchStats');
    if (storedStats) {
      this.stats = JSON.parse(storedStats);
    }
    return this.stats;
  },

  // 保存统计数据到 localStorage
  saveStats() {
    localStorage.setItem('searchStats', JSON.stringify(this.stats));
  },

  // 记录搜索词在特定类型中被选中的次数
  recordSelection(keyword, type) {
    if (!keyword) return;
    
    // 先加载现有数据
    this.loadStats();
    
    keyword = keyword.toLowerCase();
    if (!this.stats[keyword]) {
      this.stats[keyword] = {};
    }
    if (!this.stats[keyword][type]) {
      this.stats[keyword][type] = 0;
    }
    this.stats[keyword][type]++;
    this.saveStats();
  },

  // 获取特定关键词的统计数据
  getStats(keyword) {
    if (!keyword) return null;
    // 每次获取统计数据时也先加载最新数据
    this.loadStats();
    return this.stats[keyword.toLowerCase()] || null;
  },

  // 获取所有统计数据
  getAllStats() {
    // 获取所有统计数据时也先加载最新数据
    this.loadStats();
    return this.stats;
  }
}; 