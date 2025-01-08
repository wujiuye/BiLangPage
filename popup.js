/*
 * BiLangPage - Bilingual Web Experience
 * https://github.com/wujiuye/bilangpage
 *
 * Copyright (C) 2024 BiLangPage
 * Author: wujiuye <wujiuye99@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/agpl-3.0.html>.
 */

// 创建一个函数来同时处理存储和消息发送
async function updateSetting(key, value) {
  try {
    // 1. 更新存储
    await chrome.storage.sync.set({ [key]: value });
    
    // 2. 尝试发送消息（作为备用方案）
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { 
          type: key === 'enabled' ? 'toggleTranslation' : 
                key === 'selectionEnabled' ? 'toggleSelection' :
                key === 'targetLang' ? 'updateTargetLang' :
                key === 'theme' ? 'updateTheme' : 'updateSetting',
          [key]: value 
        }).catch(() => {
          // 忽略消息发送失败
        });
      }
    } catch (e) {
      // 忽略消息发送错误
      console.log('Message sending failed, falling back to polling:', e);
    }
  } catch (error) {
    console.error('Failed to update setting:', error);
  }
}

// 修改事件监听器
document.getElementById('enableTranslation').addEventListener('change', (event) => {
  updateSetting('enabled', event.target.checked);
});

document.getElementById('enableSelection').addEventListener('change', (event) => {
  updateSetting('selectionEnabled', event.target.checked);
});

document.getElementById('targetLang').addEventListener('change', (event) => {
  updateSetting('targetLang', event.target.value);
  updateUILanguage(event.target.value);
});

document.getElementById('theme').addEventListener('change', (event) => {
  updateSetting('theme', event.target.value);
});

// 更新界面文本语言
function updateUILanguage(targetLang) {
  const labels = {
    'enableTranslationLabel': {
      'zh-CN': '启用翻译',
      'en': 'Enable Translation',
      'ja': '翻訳を有効にする',
      'ko': '번역 활성화',
      'ar': 'تفعيل الترجمة'
    },
    'enableSelectionLabel': {
      'zh-CN': '启用划词翻译',
      'en': 'Enable Selection Translation',
      'ja': '選択翻訳を有効にする',
      'ko': '선택 번역 활성화',
      'ar': 'تفعيل ترجمة النص المحدد'
    },
    'targetLanguageLabel': {
      'zh-CN': '目标语言',
      'en': 'Target Language',
      'ja': '対象言語',
      'ko': '대상 언어',
      'ar': 'اللغة المستهدفة'
    },
    'themeStyleLabel': {
      'zh-CN': '主题样式',
      'en': 'Theme Style',
      'ja': 'テーマスタイル',
      'ko': '테마 스타일',
      'ar': 'نمط المظهر'
    }
  };

  // 更新每个标签的文本
  for (const [id, translations] of Object.entries(labels)) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = translations[targetLang] || translations['en'];
    }
  }
}

// 初始化界面状态
document.addEventListener('DOMContentLoaded', async () => {
  const { enabled, selectionEnabled, targetLang, theme } = await chrome.storage.sync.get(['enabled', 'selectionEnabled', 'targetLang', 'theme']);
  
  document.getElementById('enableTranslation').checked = enabled !== false;
  document.getElementById('enableSelection').checked = selectionEnabled === true;
  
  if (targetLang) {
    document.getElementById('targetLang').value = targetLang;
  }
  
  if (theme) {
    document.getElementById('theme').value = theme;
  }
  
  updateUILanguage(targetLang || 'zh-CN');
}); 