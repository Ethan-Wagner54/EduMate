/**
 * Image Utility Functions
 * 
 * Handles image upload, compression, validation, and storage for profile pictures
 */

/**
 * Validate image file
 */
export const validateImage = (file) => {
  const errors = [];
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Please upload a valid image file (JPEG, PNG, or WebP)');
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.push('Image size must be less than 5MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Compress image to reduce file size
 */
export const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(resolve, file.type, quality);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert image file to base64 data URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Save profile picture to localStorage
 */
export const saveProfilePicture = (userId, base64Image, userType = 'student') => {
  try {
    const key = `profile_picture_${userType}_${userId}`;
    localStorage.setItem(key, base64Image);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save image. Storage might be full.' };
  }
};

/**
 * Load profile picture from localStorage
 */
export const loadProfilePicture = (userId, userType = 'student') => {
  try {
    const key = `profile_picture_${userType}_${userId}`;
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

/**
 * Remove profile picture from localStorage
 */
export const removeProfilePicture = (userId, userType = 'student') => {
  try {
    const key = `profile_picture_${userType}_${userId}`;
    localStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to remove image' };
  }
};

/**
 * Create avatar placeholder with initials
 */
export const createAvatarPlaceholder = (name, size = 80) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = size;
  canvas.height = size;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(1, '#8b5cf6');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Text
  const initials = name?.split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase() || '?';
  
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size / 2.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);
  
  return canvas.toDataURL();
};

/**
 * Process uploaded image file
 */
export const processImageUpload = async (file, userId, userType = 'student') => {
  try {
    // Validate image
    const validation = validateImage(file);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    
    // Compress image
    const compressedFile = await compressImage(file);
    
    // Convert to base64
    const base64Image = await fileToBase64(compressedFile);
    
    // Save to localStorage
    const saveResult = saveProfilePicture(userId, base64Image, userType);
    
    if (saveResult.success) {
      return { 
        success: true, 
        imageUrl: base64Image,
        message: 'Profile picture uploaded successfully!'
      };
    } else {
      return { success: false, errors: [saveResult.error] };
    }
    
  } catch (error) {
    return { 
      success: false, 
      errors: ['Failed to process image. Please try again.'] 
    };
  }
};