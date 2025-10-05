import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import sharp from 'sharp';
import { Extractor } from '../../common/interface/extractor.interface';
import { createWorker } from 'tesseract.js';

@Injectable()
export class TesseractExtractor implements Extractor {
  private worker: any;

  constructor() {
    this.initializeWorker();
  }

  private async initializeWorker() {
    try {
      this.worker = await createWorker('eng');
      console.log('Tesseract OCR initialized');
    } catch (error) {
      console.warn('Tesseract OCR initialization failed:', error.message);
    }
  }

  async extractFromImage(imagePath: string, mimetype: string): Promise<string> {
    try {
      if (!this.worker) {
        throw new Error('Tesseract worker not initialized');
      }

      // Enhance image before processing
      const enhancedBuffer = await this.enhanceImage(imagePath);

      console.log('Extracting text from image using Tesseract OCR...');

      // Perform OCR
      const { data: { text } } = await this.worker.recognize(enhancedBuffer);

      if (!text || text.trim().length === 0) {
        throw new Error('No text extracted from image');
      }

      console.log(`Successfully extracted ${text.length} characters using Tesseract OCR`);
      return text;
    } catch (error) {
      console.error('Error extracting from image with Tesseract:', error);
      throw new Error(`Tesseract OCR extraction failed: ${error.message}`);
    }
  }

  async extractFromPdf(pdfPath: string, mimetype: string): Promise<string> {
    try {
      if (!this.worker) {
        throw new Error('Tesseract worker not initialized');
      }

      console.log('Tesseract: PDF processing requires PDF-to-image conversion');
      
      // For now, return an error indicating PDF support needs enhancement
      throw new Error(
        'Tesseract PDF support requires PDF-to-image conversion. ' +
        'Please use a different extractor for PDF files.'
      );
    } catch (error) {
      console.error('Error extracting from PDF with Tesseract:', error);
      throw error;
    }
  }

  private async enhanceImage(imagePath: string): Promise<Buffer> {
    try {
      const imageBuffer = await fs.readFile(imagePath);

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      
      // Enhance image for better OCR
      let pipeline = sharp(imageBuffer);

      // Resize if too large or too small
      const maxWidth = parseInt(process.env.IMAGE_MAX_WIDTH || '2000', 10);
      const maxHeight = parseInt(process.env.IMAGE_MAX_HEIGHT || '2000', 10);
      
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        pipeline = pipeline.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: false,
        });
      } else if (Math.min(metadata.width, metadata.height) < 800) {
        pipeline = pipeline.resize(1600, 1600, {
          fit: 'inside',
          withoutEnlargement: false,
        });
      }

      // Apply enhancements for better OCR
      const enhanced = await pipeline
        .normalize()
        .sharpen()
        .greyscale()
        .png() // Tesseract works better with PNG
        .toBuffer();

      return enhanced;
    } catch (error) {
      console.error('Error enhancing image:', error);
      // Return original if enhancement fails
      return await fs.readFile(imagePath);
    }
  }

  isConfigured(): boolean {
    return !!this.worker;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
