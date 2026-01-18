import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;
let genderModelLoaded = false;

/**
 * Load face detection models
 * Models are loaded from CDN for convenience
 */
export async function loadFaceDetectionModels(): Promise<void> {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
  } catch (error) {
    console.error('Failed to load face detection models:', error);
    throw error;
  }
}

/**
 * Load gender detection model (separate to keep face detection fast)
 */
export async function loadGenderDetectionModel(): Promise<void> {
  if (genderModelLoaded) return;

  try {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
    genderModelLoaded = true;
  } catch (error) {
    console.error('Failed to load gender detection model:', error);
    throw error;
  }
}

export interface FaceDetectionResult {
  croppedFace: string;
  gender: 'male' | 'female';
  genderProbability: number;
}

/**
 * Detect and crop face from an image, also detect gender
 * @param imageUrl - Base64 or URL of the image
 * @returns Object with cropped face image and detected gender, or null if no face detected
 */
export async function detectAndCropFace(imageUrl: string): Promise<string | null> {
  const result = await detectFaceWithGender(imageUrl);
  return result?.croppedFace || null;
}

/**
 * Detect face, crop it, and determine gender
 * @param imageUrl - Base64 or URL of the image
 * @returns Object with cropped face and gender info, or null if no face detected
 */
export async function detectFaceWithGender(imageUrl: string): Promise<FaceDetectionResult | null> {
  try {
    // Ensure models are loaded
    await loadFaceDetectionModels();
    await loadGenderDetectionModel();

    // Create image element
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Detect faces with landmarks and gender
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withAgeAndGender();

    if (!detections || detections.length === 0) {
      return null;
    }

    // Get the first (largest) face
    const detection = detections[0];
    const box = detection.detection.box;
    const landmarks = detection.landmarks;
    
    // Get gender info
    const detectedGender = detection.gender as 'male' | 'female';
    const genderProbability = detection.genderProbability;

    // Calculate face center using landmarks for better centering
    const noseTip = landmarks.getNose()[3]; // Tip of nose
    const faceCenterX = noseTip.x;
    const faceCenterY = noseTip.y;

    // Add generous padding around the face (80% on each side for portrait style)
    const paddingX = 0.8;
    const paddingY = 1.0; // More vertical padding for portrait

    // Calculate crop dimensions with face centered
    const cropWidth = box.width * (1 + paddingX * 2);
    const cropHeight = box.height * (1 + paddingY * 2.5);

    // Center the crop around the face center point
    const expandedBox = {
      x: Math.max(0, faceCenterX - cropWidth / 2),
      y: Math.max(0, faceCenterY - cropHeight / 2.2), // Offset up slightly for better framing
      width: cropWidth,
      height: cropHeight,
    };

    // Ensure box doesn't exceed image boundaries and adjust if needed
    if (expandedBox.x + expandedBox.width > img.width) {
      expandedBox.x = Math.max(0, img.width - expandedBox.width);
    }
    if (expandedBox.y + expandedBox.height > img.height) {
      expandedBox.y = Math.max(0, img.height - expandedBox.height);
    }
    
    expandedBox.width = Math.min(expandedBox.width, img.width - expandedBox.x);
    expandedBox.height = Math.min(expandedBox.height, img.height - expandedBox.y);

    // Create canvas and crop the face
    const canvas = document.createElement('canvas');
    canvas.width = expandedBox.width;
    canvas.height = expandedBox.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    ctx.drawImage(
      img,
      expandedBox.x,
      expandedBox.y,
      expandedBox.width,
      expandedBox.height,
      0,
      0,
      expandedBox.width,
      expandedBox.height
    );

    // Convert to base64
    const croppedFace = canvas.toDataURL('image/jpeg', 0.95);
    
    return {
      croppedFace,
      gender: detectedGender,
      genderProbability,
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
}
