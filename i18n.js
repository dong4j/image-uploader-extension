// i18n.js
const messages = {
  'en': {
    // Settings page
    settings_title: 'Image Uploader Settings',
    api_url_label: 'Upload API URL *',
    api_url_help: 'Enter the full URL of your image upload API endpoint. The API should accept POST requests with multipart/form-data and expect an \'image\' field containing the file.',
    image_processing_title: 'Image Processing',
    enable_compression: 'Enable Image Compression',
    compression_help: 'Compress images before uploading to reduce file size. Recommended for large images or slow networks.',
    quality_label: 'Compression Quality (1-100)',
    quality_help: 'Higher values mean better quality but larger file size. 80-90 is recommended for most cases.',
    convert_webp: 'Convert to WebP format',
    webp_help: 'WebP offers better compression than JPEG while maintaining similar quality. Make sure your server and target platform support WebP.',
    save_settings: 'Save Settings',
    settings_saved: 'Settings saved successfully!',
    settings_error: 'Error saving settings:',

    // Popup
    popup_title: 'Image Uploader',
    popup_description: 'Right-click on any image and select "Upload Image" to upload it to your configured service.',
    open_settings: 'Open Settings',
    
    // Notifications
    upload_success: 'Image uploaded successfully!',
    upload_error: 'Failed to upload image:',
    api_not_configured: 'Please configure the upload API URL in extension settings first.'
  },
  'zh': {
    // Settings page
    settings_title: '图片上传器设置',
    api_url_label: '上传 API 地址 *',
    api_url_help: '输入完整的图片上传 API 地址。API 应接受 POST 请求，使用 multipart/form-data 格式，并期望接收名为 \'image\' 的文件字段。',
    image_processing_title: '图片处理',
    enable_compression: '启用图片压缩',
    compression_help: '上传前压缩图片以减小文件大小。推荐用于大图片或网络较慢的情况。',
    quality_label: '压缩质量 (1-100)',
    quality_help: '数值越高图片质量越好但文件更大。推荐使用 80-90。',
    convert_webp: '转换为 WebP 格式',
    webp_help: 'WebP 格式在保持相似质量的同时提供更好的压缩率。请确保您的服务器和目标平台支持 WebP。',
    save_settings: '保存设置',
    settings_saved: '设置保存成功！',
    settings_error: '保存设置时出错：',

    // Popup
    popup_title: '图片上传器',
    popup_description: '在图片上右键点击并选择"上传图片"即可上传到配置的服务。',
    open_settings: '打开设置',
    
    // Notifications
    upload_success: '图片上传成功！',
    upload_error: '上传图片失败：',
    api_not_configured: '请先在扩展设置中配置上传 API 地址。'
  }
};

// Get browser language or fallback to English
const language = navigator.language.split('-')[0];
const currentMessages = messages[language] || messages['en'];

// Translate all elements with data-i18n attribute
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (currentMessages[key]) {
      if (element.tagName === 'INPUT' && element.type === 'submit') {
        element.value = currentMessages[key];
      } else {
        element.textContent = currentMessages[key];
      }
    }
  });
});
