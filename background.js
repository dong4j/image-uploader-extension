// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed, creating context menu...');
  chrome.contextMenus.create({
    id: "uploadImage",
    title: "Upload Image",
    contexts: ["image"]
  });
  console.log('Context menu created successfully');
});

// Generate random string
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get file name from URL
function getFileName(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    let fileName = pathname.split('/').pop();
    
    // Remove query parameters if any
    fileName = fileName.split('?')[0];
    
    // If no extension or invalid filename, generate new name
    if (!fileName || fileName.indexOf('.') === -1) {
      const now = new Date();
      const dateStr = now.getFullYear() +
        ('0' + (now.getMonth() + 1)).slice(-2) +
        ('0' + now.getDate()).slice(-2) +
        ('0' + now.getHours()).slice(-2) +
        ('0' + now.getMinutes()).slice(-2) +
        ('0' + now.getSeconds()).slice(-2);
      const randomStr = generateRandomString(6);
      fileName = `${dateStr}_${randomStr}.jpg`;
    }
    
    return fileName;
  } catch (e) {
    console.error('Error parsing URL:', e);
    const now = new Date();
    const dateStr = now.getFullYear() +
      ('0' + (now.getMonth() + 1)).slice(-2) +
      ('0' + now.getDate()).slice(-2) +
      ('0' + now.getHours()).slice(-2) +
      ('0' + now.getMinutes()).slice(-2) +
      ('0' + now.getSeconds()).slice(-2);
    const randomStr = generateRandomString(6);
    return `${dateStr}_${randomStr}.jpg`;
  }
}

// Handle image processing
async function processImage(blob, originalFileName, settings) {
  console.log('Processing image with settings:', settings);
  
  try {
    // Create ImageBitmap from blob
    let currentBitmap = await createImageBitmap(blob);
    console.log('Image loaded, dimensions:', currentBitmap.width, 'x', currentBitmap.height);

    // Create canvas with initial dimensions
    const canvas = new OffscreenCanvas(currentBitmap.width, currentBitmap.height);
    const ctx = canvas.getContext('2d');

    let processedBlob;
    let finalFileName = originalFileName;

    // First handle compression if enabled
    if (settings.enableCompression) {
      console.log('Applying compression with quality:', settings.compressionQuality);
      ctx.drawImage(currentBitmap, 0, 0);
      processedBlob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: settings.compressionQuality / 100
      });
      
      // Update filename to indicate compression
      if (!finalFileName.toLowerCase().endsWith('.jpg')) {
        finalFileName = finalFileName.replace(/\.[^/.]+$/, '') + '.jpg';
      }
      
      // Create new ImageBitmap from compressed blob for potential WebP conversion
      currentBitmap = await createImageBitmap(processedBlob);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(currentBitmap, 0, 0);
    } else {
      ctx.drawImage(currentBitmap, 0, 0);
    }
    // Then handle WebP conversion if enabled
    if (settings.convertToWebp) {
      console.log('Converting to WebP format');
      processedBlob = await canvas.convertToBlob({
        type: 'image/webp',
        quality: settings.enableCompression ? settings.compressionQuality / 100 : 0.92
      });
      
      // Update filename for WebP
      finalFileName = finalFileName.replace(/\.[^/.]+$/, '') + '.webp';
    } else if (!processedBlob) {
      // If no compression or WebP, just save as JPG
      processedBlob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: 0.92
      });
      
      if (!finalFileName.toLowerCase().endsWith('.jpg')) {
        finalFileName = finalFileName.replace(/\.[^/.]+$/, '') + '.jpg';
      }
    }

    console.log('Image processed successfully, new size:', processedBlob.size, 'bytes');
    return {
      blob: processedBlob,
      fileName: finalFileName
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);
  if (info.menuItemId === "uploadImage") {
    // Get settings
    chrome.storage.sync.get({
      apiUrl: '',
      enableCompression: false,
      compressionQuality: 80,
      convertToWebp: false
    }, async (settings) => {
      console.log('Retrieved settings:', settings);
      if (!settings.apiUrl) {
        console.error('API URL not configured');
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Upload Error',
          message: 'Please configure the upload API URL in extension settings first.'
        });
        return;
      }

      try {
        console.log('Fetching image from:', info.srcUrl);
        // Get original file name
        const originalFileName = getFileName(info.srcUrl);
        console.log('Original file name:', originalFileName);

        // Fetch the image
        const response = await fetch(info.srcUrl);
        const blob = await response.blob();
        console.log('Image fetched, size:', blob.size, 'bytes');

        // Process image if needed
        const processedImage = await processImage(blob, originalFileName, settings);
        console.log('Image processing completed');

        // Create FormData and append the image with filename
        const formData = new FormData();
        formData.append('image', processedImage.blob, processedImage.fileName);
        console.log('Uploading to:', settings.apiUrl);

        // Upload the image
        const uploadResponse = await fetch(settings.apiUrl, {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed with status: ' + uploadResponse.status);
        }

        const result = await uploadResponse.json();
        console.log('Upload successful, response:', result);

        // Show success notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Upload Success',
          message: 'Image has been uploaded successfully!'
        });

      } catch (error) {
        console.error('Upload failed:', error);
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Upload Error',
          message: 'Failed to upload image: ' + error.message
        });
      }
    });
  }
});
