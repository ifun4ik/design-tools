import { AsciiSettings, GenerationResult } from '../types';

/**
 * Loads an image from a URL (blob or data URI) into an HTMLImageElement
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

/**
 * Converts an RGBA pixel to a grayscale value (0-255)
 */
const getLuminance = (r: number, g: number, b: number): number => {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Main function to generate the ASCII SVG
 */
export const generateAsciiSvg = async (
  source: string,
  settings: AsciiSettings,
  isSvgCode: boolean
): Promise<GenerationResult> => {
  // 1. Prepare Source Image
  let finalSrc = source;
  if (isSvgCode) {
    // Convert SVG string to base64 data URI
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    finalSrc = URL.createObjectURL(svgBlob);
  }

  const img = await loadImage(finalSrc);
  
  // 2. Setup Canvas for analysis
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) throw new Error('Could not get canvas context');

  // Use natural dimensions
  const width = img.width;
  const height = img.height;
  
  canvas.width = width;
  canvas.height = height;

  // Clear and draw
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // 3. Grid Traversal
  // gridSpacing determines density (distance between characters)
  const step = Math.max(1, settings.gridSpacing);
  const chars = settings.characters.split('');
  
  let svgContentInternal = '';

  // Center the grid slightly if dimensions aren't perfect multiples
  // but simple iteration is usually fine.
  
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      // Get pixel data from center of the cell or top-left? Top-left is simpler.
      const index = (Math.floor(y) * width + Math.floor(x)) * 4;
      
      // Boundary check
      if (index >= data.length) continue;

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      // Determine "value" of the pixel based on strategy
      let value = 0;
      
      if (settings.mapStrategy === 'opacity') {
        value = a;
      } else {
        // Luminance
        // If the pixel is fully transparent, it should effectively have 0 value for drawing
        // unless we are looking at a black background image. 
        // Let's assume transparency means nothingness.
        if (a === 0) value = 0;
        else value = getLuminance(r, g, b);
      }

      // Handle inversion
      if (settings.invert) {
        value = 255 - value;
      }

      // Threshold check
      if (value < settings.threshold) continue;

      // Calculate Font Size
      // If variable size: scale based on value (0-255 mapped to 0-1)
      let fontSize = settings.fontSize;
      if (settings.variableSize) {
        const ratio = value / 255;
        // You might want a minimum perceptible size, e.g. 10% of base
        fontSize = settings.fontSize * ratio;
        if (fontSize < 0.5) continue; // Skip if too small
      }

      const fontSizeStr = fontSize.toFixed(2);

      // Pick a random character
      const charIndex = Math.floor(Math.random() * chars.length);
      const char = chars[charIndex];
      
      // Escape XML characters
      const escapedChar = char
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Add text element
      svgContentInternal += `<text x="${x}" y="${y}" font-size="${fontSizeStr}" fill="${settings.color}" text-anchor="middle" dominant-baseline="middle">${escapedChar}</text>`;
    }
  }

  // Cleanup
  if (isSvgCode) {
    URL.revokeObjectURL(finalSrc);
  }

  const svgBody = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: ${settings.backgroundColor}">
      ${svgContentInternal}
    </svg>
  `;

  return {
    svgContent: svgBody,
    width,
    height
  };
};
