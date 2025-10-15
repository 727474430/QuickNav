let iframe = null;
let isLoading = false;
let eventListenersAttached = false;

function createAndShowIframe() {
  if (isLoading) return;
  isLoading = true;

  function setupIframe() {
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        height: 380px;
        border: none;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        z-index: 2147483647;
        display: none;
      `;
      document.body.appendChild(iframe);
    }

    // 先隐藏iframe，等加载完成后再显示
    iframe.style.display = 'none';
    
    // 使用Promise处理加载
    return new Promise((resolve, reject) => {
      iframe.onload = () => {
        isLoading = false;
        resolve();
      };
      iframe.onerror = () => {
        isLoading = false;
        reject(new Error('iframe加载失败'));
      };
      iframe.src = chrome.runtime.getURL('popup.html') + '?t=' + new Date().getTime();
    });
  }

  function attachEventListeners() {
    if (eventListenersAttached) return;
    
    const clickHandler = function(e) {
      if (iframe && !iframe.contains(e.target)) {
        iframe.focus();
        focusSearchInput();
      }
    };

    document.addEventListener('click', clickHandler);
    eventListenersAttached = true;
  }

  setupIframe()
    .then(() => {
      iframe.style.display = 'block';
      iframe.focus();
      focusSearchInput();
      
      // 确保UI完全渲染
      setTimeout(() => {
        if (iframe && iframe.style.display === 'block') {
          iframe.focus();
          focusSearchInput();
        }
      }, 100);
      
      attachEventListeners();
    })
    .catch(error => {
      console.error('iframe加载错误:', error);
      isLoading = false;
      if (iframe) {
        iframe.remove();
        iframe = null;
      }
    });
}

function focusSearchInput() {
  if (iframe && iframe.contentWindow) {
    try {
      iframe.contentWindow.postMessage({action: "focusSearch"}, "*");
    } catch (e) {
      console.error('聚焦搜索框失败:', e);
    }
  }
}

function hideIframe() {
  if (iframe) {
    try {
      iframe.contentWindow.postMessage({action: "clearSearch"}, "*");
      iframe.style.display = 'none';
    } catch (e) {
      console.error('隐藏iframe失败:', e);
      // 如果出现错误，强制移除并重置
      iframe.remove();
      iframe = null;
      isLoading = false;
      eventListenersAttached = false;
    }
  }
}

function toggleIframe() {
  if (isLoading) return;
  
  if (iframe && iframe.style.display === 'block') {
    hideIframe();
  } else {
    createAndShowIframe();
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleIframe") {
    toggleIframe();
  } else if (request.action === "addCurrentSite") {
    ensureIframeLoadedThen('addCurrentSite');
  }
});

function ensureIframeLoadedThen(action) {
  if (isLoading) return;

  const postToIframe = () => {
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage({ action }, "*");
      } catch (e) {
        console.error('向iframe发送消息失败:', e);
      }
    }
  };

  if (iframe && iframe.contentWindow) {
    postToIframe();
    return;
  }

  // 创建隐藏的 iframe，仅用于触发内部逻辑（不显示UI）
  isLoading = true;
  try {
    iframe = document.createElement('iframe');
    iframe.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 380px;
      border: none;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      z-index: 2147483647;
      display: none;
    `;
    iframe.onload = () => {
      isLoading = false;
      postToIframe();
    };
    iframe.onerror = () => {
      isLoading = false;
      try { iframe.remove(); } catch (e) {}
      iframe = null;
    };
    iframe.src = chrome.runtime.getURL('popup.html') + '?t=' + new Date().getTime();
    document.body.appendChild(iframe);
  } catch (e) {
    isLoading = false;
    console.error('创建隐藏iframe失败:', e);
    try { if (iframe) iframe.remove(); } catch (_) {}
    iframe = null;
  }
}

// 顶层页面提示
function showPageToast(message) {
  try {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(66,133,244,0.95);
      color: #fff;
      padding: 8px 14px;
      border-radius: 4px;
      z-index: 2147483647;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    toast.textContent = message || '已完成';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1600);
  } catch(e) { /* ignore */ }
}

// 添加消息监听器来处理来自 iframe 的消息
window.addEventListener('message', function(event) {
  if (event.data.action === "hideIframe") {
    hideIframe();
  } else if (event.data.action === 'addCurrentSiteResult') {
    if (event.data.success) {
      const msg = event.data.status === 'updated' ? '已更新现有系统' : '系统添加成功';
      showPageToast(msg);
    }
    // 若此时 iframe 为隐藏状态（快捷键隐式加载），完成后移除
    try {
      if (iframe && iframe.style && iframe.style.display === 'none') {
        iframe.remove();
        iframe = null;
        isLoading = false;
        eventListenersAttached = false;
      }
    } catch (e) { /* ignore */ }
  }
});
