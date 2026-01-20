/**
 * Fast BMP to PNG converter using Sharp library
 * Converts BMP Buffer to PNG base64 data URL with transparency
 */

import path from 'path';

// Load sharp from unpacked directory in production
let sharp: any;
try {
  // @ts-ignore - Electron's process has resourcesPath in production
  if (process.env.NODE_ENV === 'production' && process.resourcesPath) {
    // In production, load from app.asar.unpacked
    const unpackedPath = path.join(
      // @ts-ignore
      process.resourcesPath,
      'app.asar.unpacked',
      'node_modules',
      'sharp'
    );
    sharp = require(unpackedPath);
  } else {
    // In development, load normally
    sharp = require('sharp');
  }
} catch (error) {
  console.error('Failed to load sharp from unpacked directory, trying normal require:', error);
  sharp = require('sharp');
}

export class BMPConverter {
  /**
   * Convert BMP buffer to PNG data URL with black pixels made transparent
   */
  static async convertToDataURL(bmpBuffer: Buffer): Promise<string | null> {
    try {
      // Use Sharp to decode BMP and get raw pixel data
      const image = sharp(bmpBuffer);
      const metadata = await image.metadata();
      const { width, height } = metadata;
      
      // Get raw RGBA pixel data
      const rawPixels = await image
        .ensureAlpha()
        .raw()
        .toBuffer();
      
      // Make black pixels (RGB 0,0,0) transparent
      for (let i = 0; i < rawPixels.length; i += 4) {
        const r = rawPixels[i];
        const g = rawPixels[i + 1];
        const b = rawPixels[i + 2];
        
        if (r === 0 && g === 0 && b === 0) {
          rawPixels[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }
      
      // Encode back to PNG
      const pngBuffer = await sharp(rawPixels, {
        raw: {
          width,
          height,
          channels: 4
        }
      })
        .png()
        .toBuffer();
      
      // Convert to base64 data URL
      return `data:image/png;base64,${pngBuffer.toString('base64')}`;
    } catch (error) {
      console.error('BMP conversion error:', error);
      return null;
    }
  }
}
