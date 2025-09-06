document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search');
  const searchType = document.getElementById('search-type');
  const resultsDiv = document.getElementById('results');
  let selectedIndex = -1;
  let filteredResults = [];
  let iframe = null;
  let isIframeLoading = false;
  let currentPage = 0;
  const itemsPerPage = 5;

  // 添加一个新的 div 用于显示搜索结果计数
  const countDiv = document.createElement('div');
  countDiv.id = 'result-count';
  countDiv.style.cssText = `
    position: absolute;
    left: 10px;
    bottom: 10px;
    font-size: 12px;
    color: #666;
  `;
  document.getElementById('container').appendChild(countDiv);

  function focusSearchInput() {
    searchInput.focus();
    // 将光标移动到输入框末尾
    const length = searchInput.value.length;
    searchInput.setSelectionRange(length, length);
  }

  // 截断长文本并添加省略号
  function truncateText(text, maxLength = 30) {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  // 自动聚焦到搜索框
  focusSearchInput();

  // 监听来自父窗口的消息
  window.addEventListener('message', function(event) {
    if (event.data.action === "clearSearch") {
      searchInput.value = '';
      initializePopup();
    } else if (event.data.action === "focusSearch") {
      setTimeout(focusSearchInput, 0);
    }
  });

  // 确保窗口获得焦点时也聚焦到搜索框
  window.addEventListener('focus', focusSearchInput);

  // 初始化时加载系统列表
  SystemsManager.loadSystems().then(() => {
    displayResults('');
  });

  function displayResults(query) {
    resetPagination(); // 重置分页状态

    if (searchType.value === 'system') {
      filteredResults = SystemsManager.searchSystems(query);
      renderResults();
      updateResultCount();
    } else if (searchType.value === 'bookmark') {
      // 搜索书签
      chrome.bookmarks.search(query, (bookmarks) => {
        filteredResults = bookmarks;
        renderResults();
        updateResultCount();
      });
    } else if (searchType.value === 'tab') {
      // 搜索标签页
      chrome.tabs.query({}, async (tabs) => {
        try {
          // 在V3中，我们简化搜索逻辑，只搜索标题和URL
          filteredResults = tabs.filter(tab =>
            tab.title.toLowerCase().includes(query.toLowerCase()) ||
            tab.url.toLowerCase().includes(query.toLowerCase())
          );
          renderResults();
          updateResultCount();
        } catch (error) {
          console.error('搜索标签页时出错:', error);
          filteredResults = tabs.filter(tab =>
            tab.title.toLowerCase().includes(query.toLowerCase()) ||
            tab.url.toLowerCase().includes(query.toLowerCase())
          );
          renderResults();
          updateResultCount();
        }
      });
    } else if (searchType.value === 'history') {
      // 搜索历史记录
      chrome.history.search({
        text: query,
        maxResults: 100
      }, (historyItems) => {
        filteredResults = historyItems;
        renderResults();
        updateResultCount();
      });
    } 
  }

  function renderResults() {
    // 计算当前页的结果范围
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedResults = filteredResults.slice(startIndex, endIndex);
    resultsDiv.innerHTML = displayedResults.map((result, index) => {
      const numberKey = index + 1;
      const circledNumber = ['①', '②', '③', '④', '⑤'][index] || numberKey;
      if (searchType.value === 'system') {
        return `<div class="result-item ${index === selectedIndex ? 'selected' : ''}" data-url="${result.address}" data-index="${index}">
          <div style="color: black;">系统名称：${truncateText(result.name)}
            <span class="enter-hint" style="color: #007acc; font-weight: bold;">${circledNumber}</span>
            <span class="delete-icon" data-index="${index}" title="删除">×</span>
          </div>
          <div style="color: gray; font-size: 0.9em;">系统地址：${truncateText(result.address, 50)}</div>
        </div>`;
      } else if (searchType.value === 'bookmark') {
        return `<div class="result-item ${index === selectedIndex ? 'selected' : ''}" data-url="${result.url}" data-index="${index}">
          <div style="color: black;">书签名称：${truncateText(result.title)} <span class="enter-hint" style="color: #007acc; font-weight: bold;">${circledNumber}</span></div>
          <div style="color: gray; font-size: 0.9em;">书签地址：${truncateText(result.url, 50)}</div>
        </div>`;
      } else if (searchType.value === 'tab') {
        return `<div class="result-item ${index === selectedIndex ? 'selected' : ''}" data-tab-id="${result.id}" data-index="${index}">
          <div style="color: black;">标签名称：${truncateText(result.title)} <span class="enter-hint" style="color: #007acc; font-weight: bold;">${circledNumber}</span></div>
          <div style="color: gray; font-size: 0.9em;">标签地址：${truncateText(result.url, 50)}</div>
        </div>`;
      } else if (searchType.value === 'history') {
        return `<div class="result-item ${index === selectedIndex ? 'selected' : ''}" data-url="${result.url}" data-index="${index}">
          <div style="color: black;">历史记录：${truncateText(result.title)} <span class="enter-hint" style="color: #007acc; font-weight: bold;">${circledNumber}</span></div>
          <div style="color: gray; font-size: 0.9em;">历史地址：${truncateText(result.url, 50)}</div>
        </div>`;
      }
    }).join('');

    // 确保选中的项目可见
    const selectedItem = resultsDiv.querySelector('.selected');
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // 为系统类型的结果添加删除事件监听
    if (searchType.value === 'system') {
      document.querySelectorAll('.delete-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
          e.stopPropagation(); // 阻止事件冒泡
          const index = parseInt(this.getAttribute('data-index'));
          showDeleteConfirm(index);
        });
      });
    }
  }

  // 添加新函数来更新结果计数
  function updateResultCount() {
    const totalCount = filteredResults.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    if (totalCount === 0) {
      countDiv.textContent = '无结果';
    } else {
      countDiv.textContent = `第${currentPage + 1}/${totalPages}页 共${totalPages}页`;
    }
  }

  function selectResult(index) {
    selectedIndex = index;
    renderResults();
  }

  function goToNextPage() {
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    if (currentPage < totalPages - 1) {
      currentPage++;
      selectedIndex = 0; // 重置选中项到第一个
      renderResults();
      updateResultCount();
    }
  }

  function goToPreviousPage() {
    if (currentPage > 0) {
      currentPage--;
      selectedIndex = 0; // 重置选中项到第一个
      renderResults();
      updateResultCount();
    }
  }

  function resetPagination() {
    currentPage = 0;
    selectedIndex = -1;
  }

  function openResultByNumber(number) {
    const resultIndex = number - 1; // 数字键1对应索引0
    const currentPageResults = Math.min(itemsPerPage, filteredResults.length - currentPage * itemsPerPage);

    if (resultIndex >= 0 && resultIndex < currentPageResults) {
      const actualIndex = currentPage * itemsPerPage + resultIndex;
      const result = filteredResults[actualIndex];
      const currentQuery = searchInput.value;

      // 记录搜索统计
      SearchStats.recordSelection(currentQuery, searchType.value);

      if (searchType.value === 'system' || searchType.value === 'bookmark') {
        const url = searchType.value === 'system' ? result.address : result.url;
        if (url) {
          window.open(url, '_blank');
          window.parent.postMessage({action: "hideIframe"}, "*");
        }
      } else if (searchType.value === 'tab') {
        chrome.tabs.update(result.id, {active: true});
        chrome.windows.update(result.windowId, {focused: true});
        window.parent.postMessage({action: "hideIframe"}, "*");
      } else if (searchType.value === 'history') {
        window.open(result.url, '_blank');
        window.parent.postMessage({action: "hideIframe"}, "*");
      }
    }
  }

  function openSelectedResult() {
    const actualIndex = currentPage * itemsPerPage + selectedIndex;
    if (selectedIndex >= 0 && actualIndex < filteredResults.length) {
      const result = filteredResults[actualIndex];
      const currentQuery = searchInput.value;
      
      // 记录搜索统计
      SearchStats.recordSelection(currentQuery, searchType.value);
      
      if (searchType.value === 'system' || searchType.value === 'bookmark') {
        const url = searchType.value === 'system' ? result.address : result.url;
        if (url) {
          window.open(url, '_blank');
          window.parent.postMessage({action: "hideIframe"}, "*");
        }
      } else if (searchType.value === 'tab') {
        chrome.tabs.update(result.id, {active: true});
        chrome.windows.update(result.windowId, {focused: true});
        window.parent.postMessage({action: "hideIframe"}, "*");
      } else if (searchType.value === 'history') {
        window.open(result.url, '_blank');
        window.parent.postMessage({action: "hideIframe"}, "*");
      }
    }
  }

  function clearSearchAndHideIframe() {
    searchInput.value = '';
    displayResults('');
    window.parent.postMessage({action: "hideIframe"}, "*");
  }

  // 添加新函：获取关键词最常用的搜索类型
  function getMostUsedType(keyword) {
    const stats = SearchStats.getStats(keyword);
    if (!stats) return null;

    let maxCount = 0;
    let mostUsedType = null;

    Object.entries(stats).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedType = type;
      }
    });

    return mostUsedType;
  }

  // 修改搜索输入事件监听器
  searchInput.addEventListener('input', function() {
    const query = searchInput.value.toLowerCase();
    
    // 获取当前关键词最常用的搜索类型
    const mostUsedType = getMostUsedType(query);
    
    // 如果找到最常用类型且与当前类型不同，则切换到该类型
    if (mostUsedType && mostUsedType !== searchType.value) {
      searchType.value = mostUsedType;
      // 触发 change 事件以更新界面
      searchType.dispatchEvent(new Event('change'));
    } else {
      // 如果没有统计数据或当前已是最常用类型，直接显示结果
      displayResults(query);
      selectedIndex = -1;
    }
  });

  // 监听下拉框变化
  searchType.addEventListener('change', function() {
    const query = searchInput.value.toLowerCase();
    displayResults(query);
  });

  // 添加 Tab 键切换功能
  searchInput.addEventListener('keydown', function(event) {
    const currentPageResults = Math.min(itemsPerPage, filteredResults.length - currentPage * itemsPerPage);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectResult(Math.min(selectedIndex + 1, currentPageResults - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectResult(Math.max(selectedIndex - 1, 0));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        goToPreviousPage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNextPage();
        break;
      case 'Enter':
        event.preventDefault();
        openSelectedResult();
        break;
      case 'Escape':
        event.preventDefault();
        clearSearchAndHideIframe();
        break;
      case 'Tab':
        event.preventDefault();
        toggleSearchType();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        event.preventDefault();
        openResultByNumber(parseInt(event.key));
        break;
    }
  });

  // 切换搜索类型
  function toggleSearchType() {
    const currentQuery = searchInput.value;
    switch (searchType.value) {
      case 'system':
        searchType.value = 'bookmark';
        break;
      case 'bookmark':
        searchType.value = 'tab';
        break;
      case 'tab':
        searchType.value = 'history';
        break;
      case 'history':
        searchType.value = 'system';
        break;
    }
    displayResults(currentQuery);
    focusSearchInput();
  }

  function initializePopup() {
    resetPagination();
    filteredResults = [];
    displayResults(searchInput.value);
    focusSearchInput();
  }

  // 监听来自父窗口的消息
  window.addEventListener('message', function(event) {
    if (event.data.action === "clearSearch") {
      searchInput.value = '';
      initializePopup();
    } else if (event.data.action === "focusSearch") {
      setTimeout(focusSearchInput, 0);
    }
  });

  resultsDiv.addEventListener('click', function(event) {
    const target = event.target.closest('.result-item');
    if (target) {
      const index = parseInt(target.getAttribute('data-index'));
      const actualIndex = currentPage * itemsPerPage + index;
      const result = filteredResults[actualIndex];
      const currentQuery = searchInput.value;
      
      // 记录搜索统计
      SearchStats.recordSelection(currentQuery, searchType.value);
      
      if (searchType.value === 'system' || searchType.value === 'bookmark') {
        const url = searchType.value === 'system' ? result.address : result.url;
        if (url) {
          window.open(url, '_blank');
          window.parent.postMessage({action: "hideIframe"}, "*");
        }
      } else if (searchType.value === 'tab') {
        chrome.tabs.update(result.id, {active: true});
        chrome.windows.update(result.windowId, {focused: true});
        window.parent.postMessage({action: "hideIframe"}, "*");
      } else if (searchType.value === 'history') {
        window.open(result.url, '_blank');
        window.parent.postMessage({action: "hideIframe"}, "*");
      }
    }
  });

  resultsDiv.addEventListener('mousemove', function(event) {
    const target = event.target.closest('.result-item');
    if (target) {
      const index = parseInt(target.getAttribute('data-index'));
      if (index !== selectedIndex) {
        selectResult(index);
      }
    }
  });

  // 默认触发空值搜索,展示所有系统
  initializePopup();

  const settingsButton = document.getElementById('settings-button');
  const keyboardButton = document.getElementById('keyboard-button');

  settingsButton.addEventListener('click', function() {
    chrome.tabs.create({url: 'settings.html'});
  });

  keyboardButton.addEventListener('click', function() {
    chrome.tabs.create({url: 'chrome://extensions/shortcuts'});
  });

  function createAndShowIframe() {
    // 如果正在加载中,防止重复创建
    if(isIframeLoading) {
      return;
    }
    
    isIframeLoading = true;

    if (iframe) {
      // 确保先隐藏旧iframe
      iframe.style.display = 'none';
    }

    // 创建新iframe
    const newIframe = document.createElement('iframe'); 
    
    // 设置加载超时处理
    const loadTimeout = setTimeout(() => {
      isIframeLoading = false;
      if(newIframe) {
        newIframe.remove();
      }
      createAndShowIframe(); // 重试一次
    }, 3000);

    newIframe.onload = function() {
      clearTimeout(loadTimeout);
      isIframeLoading = false;
      
      // 移除旧iframe
      if(iframe) {
        iframe.remove();
      }
      
      iframe = newIframe;
      
      // 确保UI完全加载后再显示
      requestAnimationFrame(() => {
        iframe.style.display = 'block';
        focusSearchInput();
      });
    };

    newIframe.onerror = function() {
      clearTimeout(loadTimeout); 
      isIframeLoading = false;
      if(newIframe) {
        newIframe.remove();
      }
    };

    newIframe.src = chrome.runtime.getURL('popup.html') + '?t=' + new Date().getTime();
    newIframe.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 380px;
      border: none;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      z-index: 2147483647;
      display: none; // 初始隐藏
    `;
    
    document.body.appendChild(newIframe);
  }

  // 添加系统按钮点击事件
  document.getElementById('add-system-button').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      const newSystem = {
        name: currentTab.title,
        address: currentTab.url,
        pinyin: getPinyin(currentTab.title) // 这里需要实现getPinyin函数
      };
      
      SystemsManager.addSystem(newSystem).then(() => {
        // 显示添加成功提示
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          z-index: 9999;
        `;
        notification.textContent = '系统添加成功！';
        document.body.appendChild(notification);
        
        // 3秒后移除提示
        setTimeout(() => {
          notification.remove();
        }, 3000);
      });
    });
  });

  // 添加获取拼音缩写的函数
  function getPinyin(text) {
    // 常用汉字拼音映射表
    const pinyinMap = {
      '啊': 'a', '爱': 'ai', '安': 'an', '按': 'an', '暗': 'an',
      '把': 'ba', '百': 'bai', '版': 'ban', '办': 'ban', '半': 'ban',
      '包': 'bao', '报': 'bao', '备': 'bei', '本': 'ben', '必': 'bi',
      '表': 'biao', '别': 'bie', '并': 'bing', '步': 'bu', '部': 'bu',
      '才': 'cai', '采': 'cai', '藏': 'cang', '测': 'ce', '查': 'cha',
      '产': 'chan', '长': 'chang', '常': 'chang', '场': 'chang', '超': 'chao',
      '车': 'che', '成': 'cheng', '城': 'cheng', '程': 'cheng', '持': 'chi',
      '出': 'chu', '处': 'chu', '传': 'chuan', '创': 'chuang', '次': 'ci',
      '从': 'cong', '错': 'cuo', '答': 'da', '打': 'da', '大': 'da',
      '代': 'dai', '单': 'dan', '但': 'dan', '当': 'dang', '到': 'dao',
      '的': 'de', '等': 'deng', '地': 'di', '第': 'di', '点': 'dian',
      '电': 'dian', '度': 'du', '端': 'duan', '对': 'dui', '多': 'duo',
      '儿': 'er', '发': 'fa', '法': 'fa', '反': 'fan', '方': 'fang',
      '放': 'fang', '非': 'fei', '分': 'fen', '风': 'feng', '否': 'fou',
      '该': 'gai', '改': 'gai', '干': 'gan', '高': 'gao', '个': 'ge',
      '给': 'gei', '跟': 'gen', '更': 'geng', '工': 'gong', '公': 'gong',
      '共': 'gong', '够': 'gou', '关': 'guan', '管': 'guan', '光': 'guang',
      '国': 'guo', '过': 'guo', '还': 'hai', '行': 'hang', '好': 'hao',
      '和': 'he', '很': 'hen', '后': 'hou', '会': 'hui', '或': 'huo',
      '机': 'ji', '几': 'ji', '己': 'ji', '加': 'jia', '间': 'jian',
      '见': 'jian', '将': 'jiang', '交': 'jiao', '接': 'jie', '进': 'jin',
      '经': 'jing', '就': 'jiu', '据': 'ju', '开': 'kai', '看': 'kan',
      '可': 'ke', '空': 'kong', '快': 'kuai', '来': 'lai', '里': 'li',
      '理': 'li', '力': 'li', '连': 'lian', '两': 'liang', '料': 'liao',
      '列': 'lie', '林': 'lin', '另': 'ling', '流': 'liu', '六': 'liu',
      '论': 'lun', '吗': 'ma', '买': 'mai', '慢': 'man', '忙': 'mang',
      '么': 'me', '每': 'mei', '们': 'men', '密': 'mi', '免': 'mian',
      '面': 'mian', '名': 'ming', '明': 'ming', '目': 'mu', '那': 'na',
      '内': 'nei', '能': 'neng', '你': 'ni', '年': 'nian', '念': 'nian',
      '您': 'nin', '牛': 'niu', '农': 'nong', '努': 'nu', '女': 'nv',
      '欧': 'ou', '怕': 'pa', '排': 'pai', '盘': 'pan', '旁': 'pang',
      '跑': 'pao', '配': 'pei', '品': 'pin', '平': 'ping', '期': 'qi',
      '其': 'qi', '起': 'qi', '气': 'qi', '前': 'qian', '强': 'qiang',
      '请': 'qing', '区': 'qu', '全': 'quan', '然': 'ran', '让': 'rang',
      '热': 're', '人': 'ren', '认': 'ren', '日': 'ri', '容': 'rong',
      '如': 'ru', '入': 'ru', '软': 'ruan', '三': 'san', '商': 'shang',
      '上': 'shang', '少': 'shao', '设': 'she', '深': 'shen', '生': 'sheng',
      '时': 'shi', '��': 'shi', '始': 'shi', '世': 'shi', '是': 'shi',
      '手': 'shou', '受': 'shou', '数': 'shu', '水': 'shui', '说': 'shuo',
      '司': 'si', '思': 'si', '死': 'si', '算': 'suan', '虽': 'sui',
      '所': 'suo', '他': 'ta', '她': 'ta', '台': 'tai', '太': 'tai',
      '谈': 'tan', '特': 'te', '提': 'ti', '题': 'ti', '体': 'ti',
      '天': 'tian', '条': 'tiao', '通': 'tong', '同': 'tong', '头': 'tou',
      '图': 'tu', '外': 'wai', '完': 'wan', '王': 'wang', '为': 'wei',
      '位': 'wei', '文': 'wen', '我': 'wo', '无': 'wu', '系': 'xi',
      '下': 'xia', '先': 'xian', '现': 'xian', '想': 'xiang', '向': 'xiang',
      '小': 'xiao', '些': 'xie', '写': 'xie', '新': 'xin', '信': 'xin',
      '行': 'xing', '性': 'xing', '修': 'xiu', '需': 'xu', '选': 'xuan',
      '学': 'xue', '亚': 'ya', '言': 'yan', '样': 'yang', '要': 'yao',
      '也': 'ye', '一': 'yi', '以': 'yi', '意': 'yi', '因': 'yin',
      '应': 'ying', '用': 'yong', '由': 'you', '有': 'you', '与': 'yu',
      '于': 'yu', '语': 'yu', '原': 'yuan', '远': 'yuan', '院': 'yuan',
      '在': 'zai', '早': 'zao', '怎': 'zen', '增': 'zeng', '展': 'zhan',
      '张': 'zhang', '找': 'zhao', '这': 'zhe', '真': 'zhen', '正': 'zheng',
      '之': 'zhi', '知': 'zhi', '直': 'zhi', '质': 'zhi', '中': 'zhong',
      '种': 'zhong', '重': 'zhong', '主': 'zhu', '注': 'zhu', '转': 'zhuan',
      '准': 'zhun', '资': 'zi', '自': 'zi', '总': 'zong', '走': 'zou',
      '组': 'zu', '最': 'zui', '作': 'zuo'
    };

    // 将文本转换为拼音首字母
    return text
      .split('')
      .map(char => {
        // 如果在映射表中找到对应的拼音，返回拼音的首字母
        if (pinyinMap[char]) {
          return pinyinMap[char].charAt(0);
        }
        // 如果是英文字母，直接返回小写
        if (/[a-zA-Z]/.test(char)) {
          return char.toLowerCase();
        }
        // 其他字符（数字、标点等）忽略
        return '';
      })
      .join('')
      .substring(0, 10); // 限制长度为10个字符
  }

  // 添加删除确认对话框
  function showDeleteConfirm(index) {
    const system = filteredResults[index];
    
    // 创建确认对话框
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'delete-confirm';
    confirmDialog.innerHTML = `
      <div>确定要删除系统"${system.name}"吗？</div>
      <div class="buttons">
        <button class="cancel">取消</button>
        <button class="confirm">确定</button>
      </div>
    `;
    
    document.body.appendChild(confirmDialog);
    
    // 添加按钮事件
    confirmDialog.querySelector('.cancel').addEventListener('click', () => {
      confirmDialog.remove();
    });
    
    confirmDialog.querySelector('.confirm').addEventListener('click', () => {
      // 获取系统在完整列表中的索引
      const allSystems = SystemsManager.getAllSystems();
      const systemIndex = allSystems.findIndex(s => 
        s.name === system.name && s.address === system.address
      );
      
      if (systemIndex !== -1) {
        SystemsManager.deleteSystem(systemIndex).then(() => {
          // 显示删除成功提示
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 9999;
          `;
          notification.textContent = '系统删除成功！';
          document.body.appendChild(notification);
          
          // 3秒后移除提示
          setTimeout(() => {
            notification.remove();
          }, 3000);
          
          // 更新显示
          displayResults(searchInput.value);
        });
      }
      
      confirmDialog.remove();
    });
  }
});
