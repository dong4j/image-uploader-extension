// 更新滑动条颜色
function updateRangeColor(value) {
  const slider = document.getElementById('compressionQuality');
  const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
}

// 更新压缩质量显示
function updateQualityValue(value) {
  document.getElementById('qualityValue').textContent = value + '%';
}

// 初始化设置页面
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  const qualitySlider = document.getElementById('compressionQuality');

  // 从存储中加载设置
  chrome.storage.sync.get({
    apiUrl: '',
    enableCompression: false,
    compressionQuality: 80,
    convertToWebp: false
  }, (items) => {
    document.getElementById('apiUrl').value = items.apiUrl;
    document.getElementById('enableCompression').checked = items.enableCompression;
    qualitySlider.value = items.compressionQuality;
    document.getElementById('convertToWebp').checked = items.convertToWebp;
    
    // 更新初始显示
    updateQualityValue(items.compressionQuality);
    updateRangeColor(items.compressionQuality);
  });

  // 监听滑块变化
  qualitySlider.addEventListener('input', (e) => {
    const value = e.target.value;
    updateQualityValue(value);
    updateRangeColor(value);
  });

  // 监听表单提交
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const settings = {
      apiUrl: document.getElementById('apiUrl').value,
      enableCompression: document.getElementById('enableCompression').checked,
      compressionQuality: parseInt(qualitySlider.value),
      convertToWebp: document.getElementById('convertToWebp').checked
    };
    
    chrome.storage.sync.set(settings, () => {
      const status = document.getElementById('status');
      status.textContent = chrome.i18n.getMessage('settings_saved') || 'Settings saved successfully!';
      status.classList.remove('hidden', 'error');
      status.classList.add('success');
      
      setTimeout(() => {
        status.classList.add('hidden');
      }, 3000);
    });
  });
});
