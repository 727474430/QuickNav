(function(){
  async function callZhipuAPI(messages, model, apiKey) {
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'GLM-4.5-Flash',
        messages: messages,
        temperature: 0.6
      })
    });

    if (!response.ok) {
      throw new Error(`API 调用失败: ${response.status}`);
    }

    return await response.json();
  }

  function extractJsonFromText(text) {
    if (!text || typeof text !== 'string') return null;
    // 处理 ```json ... ``` 或 ``` ... ``` 包裹
    const fenced = text.match(/```(?:json)?\n([\s\S]*?)```/i);
    const raw = fenced ? fenced[1] : text;
    // 尝试直接解析
    try { return JSON.parse(raw); } catch(_) {}
    // 尝试截取第一个 { 到 最后一个 }
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const maybe = raw.slice(start, end + 1);
      try { return JSON.parse(maybe); } catch(_) {}
    }
    return null;
  }

  function buildPrompt(title, url) {
    const sys = '你是一个用于清洗网页标题并生成系统名称与拼音缩写的助手。输出严格为 JSON，键为 name 与 pinyin。';
    const user = `请基于以下网页信息生成：\n- 更简洁、可读的系统名称（避免冗余、站点后缀、重复品牌）。\n- 拼音缩写：仅小写字母；最多10字符；中文取拼音首字母；英文取首字母；移除空格与符号。\n\n输入：\nTITLE: ${title || ''}\nURL: ${url || ''}\n\n只输出 JSON：{\n  "name": "...",\n  "pinyin": "..."\n}`;
    return [
      { role: 'system', content: sys },
      { role: 'user', content: user }
    ];
  }

  async function optimizeSystemInfo(title, url, apiKey, model) {
    try {
      if (!apiKey) return null;
      const messages = buildPrompt(title, url);
      const res = await callZhipuAPI(messages, model || 'GLM-4.5-Flash', apiKey);
      const content = res && res.choices && res.choices[0] && res.choices[0].message && res.choices[0].message.content;
      const parsed = extractJsonFromText(content || '');
      if (parsed && typeof parsed.name === 'string' && typeof parsed.pinyin === 'string') {
        const name = parsed.name.trim();
        const pinyin = parsed.pinyin.trim().toLowerCase().replace(/[^a-z]/g, '').slice(0, 10);
        if (name && pinyin) return { name, pinyin };
      }
      return null;
    } catch (e) {
      console.warn('optimizeSystemInfo 调用失败:', e);
      return null;
    }
  }

  window.LLM = {
    optimizeSystemInfo
  };
})();
