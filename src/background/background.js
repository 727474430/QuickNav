chrome.runtime.onInstalled.addListener(async () => {
  console.log("插件已安装");
});

// 封装：向活动标签发送消息；若无接收端则尝试按需注入内容脚本并重试
function ensureContentAndSend(tab, message) {
  try {
    if (!tab || !tab.id) return;
    const url = tab.url || '';
    // 跳过受限页面，避免报错：chrome://, edge://, about:, chrome-extension:// 等
    if (/^(chrome|edge):\/\//i.test(url) || /^about:/i.test(url) || /^chrome-extension:\/\//i.test(url)) {
      return;
    }

    const trySend = () => {
      try {
        chrome.tabs.sendMessage(tab.id, message, () => {
          const err = chrome.runtime.lastError;
          if (err && /Receiving end does not exist/i.test(err.message || '')) {
            // 按需注入内容脚本后重试（在可注入页面上有效）
            try {
              chrome.scripting.executeScript(
                { target: { tabId: tab.id }, files: ['src/content/content.js'] },
                () => {
                  setTimeout(() => {
                    try { chrome.tabs.sendMessage(tab.id, message); } catch (_) {}
                  }, 60);
                }
              );
            } catch (_) { /* ignore */ }
          }
        });
      } catch (_) { /* ignore */ }
    };

    trySend();
  } catch (_) { /* ignore */ }
}

function injectIframe() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || !tabs[0]) return;
    ensureContentAndSend(tabs[0], { action: 'toggleIframe' });
  });
}

let singleHotkeyModeCache = false;
let singleHotkeyDelayMs = 380; // 默认 380ms，可在设置页调整
try {
  chrome.storage.local.get(['single_hotkey_mode', 'single_hotkey_delay_ms'], (items) => {
    singleHotkeyModeCache = (items && items.single_hotkey_mode) === '1';
    const raw = items && items.single_hotkey_delay_ms;
    const v = Number(raw);
    if (Number.isFinite(v)) {
      singleHotkeyDelayMs = Math.min(800, Math.max(200, Math.round(v)));
    }
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.single_hotkey_mode) {
        singleHotkeyModeCache = (changes.single_hotkey_mode.newValue === '1');
      }
      if (changes.single_hotkey_delay_ms) {
        const v = Number(changes.single_hotkey_delay_ms.newValue);
        if (Number.isFinite(v)) {
          singleHotkeyDelayMs = Math.min(800, Math.max(200, Math.round(v)));
        }
      }
    }
  });
} catch (_) {}

let singleHotkeyTimer = null;
chrome.commands.onCommand.addListener(function(command) {
  console.log(`收到命令: ${command}`);
  if (command === 'toggle-search') {
    if (singleHotkeyModeCache) {
      // 单一快捷键模式：第一次按下不立刻弹窗，设置延迟；
      // 若延迟内再次按下，则转为“添加当前网站”，并取消弹窗。
      if (singleHotkeyTimer) {
        try { clearTimeout(singleHotkeyTimer); } catch (_) {}
        singleHotkeyTimer = null;
        addCurrentSite();
      } else {
        singleHotkeyTimer = setTimeout(() => {
          singleHotkeyTimer = null;
          injectIframe();
        }, singleHotkeyDelayMs);
      }
      return;
    }
    // 非单一模式：立即切换弹窗
    injectIframe();
  } else if (command === 'add-current-site') {
    addCurrentSite();
  }
});

function addCurrentSite() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || !tabs[0]) return;
    ensureContentAndSend(tabs[0], { action: 'addCurrentSite' });
  });
}

chrome.action.onClicked.addListener(function(tab) {
  injectIframe();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "closePopup") {
    chrome.action.setPopup({popup: ""});
    setTimeout(() => {
      chrome.action.setPopup({popup: "src/popup/popup.html"});
    }, 100);
  } else if (request.action === 'llmOptimizeSystemInfo') {
    optimizeSystemInfoInBg(request.title, request.url)
      .then((data) => sendResponse({ ok: !!data, data }))
      .catch(() => sendResponse({ ok: false }))
    ;
    return true; // keep the channel open for async response
  }
});

function getStorage(keys) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(keys, (items) => resolve(items || {}));
    } catch (_) {
      resolve({});
    }
  });
}

function buildLLMMessages(title, url) {
  const sys = '你是一个用于清洗网页标题并生成系统名称与拼音缩写的助手。输出严格为 JSON，键为 name 与 pinyin。';
  const user = `请基于以下网页信息生成：\n- 更简洁、可读的系统名称（避免冗余、站点后缀、重复品牌）。\n- 拼音缩写：仅小写字母；最多10字符；中文取拼音首字母；英文取首字母；移除空格与符号。\n\n输入：\nTITLE: ${title || ''}\nURL: ${url || ''}\n\n只输出 JSON：{\n  "name": "...",\n  "pinyin": "..."\n}`;
  return [
    { role: 'system', content: sys },
    { role: 'user', content: user }
  ];
}

function extractJsonFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const fenced = text.match(/```(?:json)?\n([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  try { return JSON.parse(raw); } catch(_) {}
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const maybe = raw.slice(start, end + 1);
    try { return JSON.parse(maybe); } catch(_) {}
  }
  return null;
}

function stripParentheses(text) {
  if (!text) return '';
  // 去除半角( )与全角（ ）中的内容及其周边空格
  return text
    .replace(/[\s\u00A0]*[\(\（][^\(\)\（\）]*[\)\）][\s\u00A0]*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function optimizeSystemInfoInBg(title, url) {
  const { llm_enabled, zhipu_api_key, zhipu_model, zhipu_base_url } = await getStorage(['llm_enabled', 'zhipu_api_key', 'zhipu_model', 'zhipu_base_url']);
  const enabled = llm_enabled === '1';
  const apiKey = zhipu_api_key || '';
  const model = zhipu_model || 'GLM-4.5-Flash';
  const endpoint = (typeof zhipu_base_url === 'string' && zhipu_base_url.trim()) ? zhipu_base_url.trim() : 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

  if (!enabled || !apiKey) return null;

  const messages = buildLLMMessages(title, url);
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    credentials: 'omit',
    body: JSON.stringify({ model, messages, temperature: 0.6 })
  });

  if (!resp.ok) return null;
  const json = await resp.json();
  const content = json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
  const parsed = extractJsonFromText(content || '');
  if (parsed && typeof parsed.name === 'string' && typeof parsed.pinyin === 'string') {
    let name = stripParentheses(parsed.name.trim());
    const pinyin = parsed.pinyin.trim().toLowerCase().replace(/[^a-z]/g, '').slice(0, 10);
    if (!name) name = (parsed.name || '').trim();
    if (name && pinyin) return { name, pinyin };
  }
  return null;
}