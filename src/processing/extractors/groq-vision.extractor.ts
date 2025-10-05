import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import * as fs from 'fs/promises';
import sharp from 'sharp';
import { Extractor } from '../../common/interface/extractor.interface';

@Injectable()
export class GroqVisionExtractor implements Extractor {
  private client: Groq;
  private model: string;

  constructor() {
    // Initialize Groq client
    const apiKey = process.env.GROQ_API_KEY;
    
    if (apiKey && apiKey !== 'your_groq_api_key_here') {
      this.client = new Groq({
        apiKey: apiKey,
      });
      this.model = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-maverick-17b-128e-instruct';
      console.log(`Groq Vision initialized with model: ${this.model}`);
    } else {
      console.warn('Groq API key not configured');
    }
  }

  async extractFromImage(imagePath: string, mimetype: string): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('Groq API key not configured. Please set GROQ_API_KEY in .env file');
      }

      // Enhance image before processing
      const enhancedBuffer = await this.enhanceImage(imagePath);

      // Convert to base64
      const base64Image = enhancedBuffer.toString('base64');
      const imageUrl = `data:${mimetype};base64,${base64Image}`;

      console.log('Extracting text from image using Groq Vision...');

      // Call Groq Vision API
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert OCR system. 
Extract ALL text from this image, maintaining the structure and layout as much as possible. 
You must use the entire image to extract the text.

Also, 
Read the school timetable image and explain the contents of the image in a detailed manner. 
Do a full comprehensive analysis of the school timetable image. explain all the common content in the table cells in detail. Each cell should be explained in detail.
Dont return table data in markdown formate but explain in a detailed wording manner.
                
- Preserve the day names (Monday, Tuesday, etc.)
- Preserve time slots
- Preserve subject/course names
- Preserve room numbers and locations
- Preserve teacher/instructor names
- Maintain the original formatting and structure
- Don't miss any merged cells data.

`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      });

      const extractedText = completion.choices[0]?.message?.content || '';
      console.log('Groq Vision API response:', extractedText);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text extracted from image');
      }

      console.log(`Successfully extracted ${extractedText.length} characters using Groq Vision`);
      return extractedText;
    } catch (error) {
      console.error('Error extracting from image with Groq Vision:', error);
      throw new Error(`Groq Vision extraction failed: ${error.message}`);
    }
  }

  async extractFromPdf(pdfPath: string, mimetype: string): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('Groq API key not configured. Please set GROQ_API_KEY in .env file');
      }

      // For PDF, we'll convert first page to image and process it
      // Note: For multi-page PDFs, you might want to process each page
      const pdfBuffer = await fs.readFile(pdfPath);
      
      // Convert PDF to image using Sharp (works for single page)
      // For better PDF support, consider using pdf-to-img or similar library
      console.log('Converting PDF to image for Groq Vision processing...');
      
      // For now, we'll return a message indicating PDF support needs enhancement
      // In a production system, you'd want to use a library like pdf-to-img
      throw new Error(
        'Groq Vision PDF support requires PDF-to-image conversion. ' +
        'Please use Google Vision or implement pdf-to-img library for PDF processing with Groq.'
      );
    } catch (error) {
      console.error('Error extracting from PDF with Groq Vision:', error);
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

      // Resize if too large (max 2000x2000) or too small (min 800px on shortest side)
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

      // Apply enhancements
      const enhanced = await pipeline
      .normalize()
      .sharpen()
      .greyscale()
      .toBuffer();

      return enhanced;
    } catch (error) {
      console.error('Error enhancing image:', error);
      // Return original if enhancement fails
      return await fs.readFile(imagePath);
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  getModel(): string {
    return this.model;
  }
}
