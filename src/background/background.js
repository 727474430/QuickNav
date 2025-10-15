chrome.runtime.onInstalled.addListener(() => {
  console.log("插件已安装");
});

function injectIframe() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "toggleIframe"});
  });
}

chrome.commands.onCommand.addListener(function(command) {
  console.log(`收到命令: ${command}`);
  if (command === "toggle-search") {
    injectIframe();
  } else if (command === "add-current-site") {
    addCurrentSite();
  }
});

function addCurrentSite() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || !tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: "addCurrentSite" });
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