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
  }
});

// 添加消息监听器来处理来自 iframe 的消息
window.addEventListener('message', function(event) {
  if (event.data.action === "hideIframe") {
    hideIframe();
  }
});
