import { Injectable } from '@nestjs/common';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import * as fs from 'fs/promises';
import sharp from 'sharp';
import { Extractor } from '../../common/interface/extractor.interface';

@Injectable()
export class GoogleVisionExtractor implements Extractor {
  private client: DocumentProcessorServiceClient;
  private projectId: string;
  private location: string;
  private processorId: string;

  constructor() {
    // Initialize Google Document AI client
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us';
    this.processorId = process.env.GOOGLE_CLOUD_PROCESSOR_ID;

    // Only initialize if credentials are provided
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.client = new DocumentProcessorServiceClient();
    }
  }

  async extractFromImage(imagePath: string, mimetype: string): Promise<string> {
    try {
      // Enhance image before processing
      const enhancedBuffer = await this.enhanceImage(imagePath);

      // If Google Document AI is configured, use it
      if (this.client && this.projectId && this.processorId) {
        return await this.extractWithDocumentAI(enhancedBuffer, mimetype);
      }

      // Fallback: Return a message indicating setup is needed
      console.warn('Google Document AI not configured, using fallback method');
      return await this.fallbackExtraction(imagePath);
    } catch (error) {
      console.error('Error extracting from image:', error);
      throw error;
    }
  }

  async extractFromPdf(pdfPath: string, mimetype: string): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('Google API key not configured. Please set GOOGLE_APPLICATION_CREDENTIALS in .env file');
      }

      // For PDF, we'll convert first page to image and process it
      // Note: For multi-page PDFs, you might want to process each page
      const pdfBuffer = await fs.readFile(pdfPath);
      return await this.extractWithDocumentAI(pdfBuffer, mimetype);
    } catch (error) {
      console.error('Error extracting from PDF with Google Vision:', error);
      throw error;
    }
  }

  private async enhanceImage(imagePath: string): Promise<Buffer> {
    try {
      const imageBuffer = await fs.readFile(imagePath);

      // Enhance image for better OCR
      const enhanced = await sharp(imageBuffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
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

  private async extractWithDocumentAI(imageBuffer: Buffer, mimetype: string): Promise<string> {
    const name = `projects/${this.projectId}/locations/${this.location}/processors/${this.processorId}`;

    const request = {
      name,
      rawDocument: {
        content: imageBuffer.toString('base64'),
        mimeType: mimetype,
      },
    };

    console.log('Google Vision API requesting...');
    const [result] = await this.client.processDocument(request);
    const { document } = result;

    console.log('Google Vision API response:', document);

    // return document?.text || '';

    const { text } = document;
    console.log(`Full document text: ${JSON.stringify(text)}`);
    console.log(`There are ${document.pages.length} page(s) in this document.`);

    const htmlOutput = this.parseVisionResponseToHtml(document);
    console.log('HTML Output:', htmlOutput);

    return text;
  }

  private parseVisionResponseToHtml(fullTextAnnotation) {
    let htmlOutput = "";

    // The main container for all text blocks
    htmlOutput += '<div style="position: relative; border: 2px solid lightgray; padding: 10px;">';

    fullTextAnnotation.pages.forEach(page => {
      page.blocks.forEach(block => {
        // Calculate block position and size using the bounding box vertices
        const boundingBox = block.layout.boundingPoly.vertices;
        const x1 = boundingBox[0].x;
        const y1 = boundingBox[0].y;
        const x2 = boundingBox[1].x;
        const y2 = boundingBox[2].y;
        const width = x2 - x1;
        const height = y2 - y1;

        // Create a div for each block
        htmlOutput += `<div class="block" style="position: absolute; left: ${x1}px; top: ${y1}px; width: ${width}px; height: ${height}px; border: 1px solid red;">`;

        htmlOutput += `<div class="paragraph"><span class="word">${this.getText(block.layout.textAnchor, fullTextAnnotation.text)} </span></div>`;

        htmlOutput += `</div>`;
      });
    });

    htmlOutput += '</div>';
    return htmlOutput;
  }

  // Extract shards from the text field
  private getText = (textAnchor, text) => {
    if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
      return '';
    }

    // First shard in document doesn't have startIndex property
    const startIndex = textAnchor.textSegments[0].startIndex || 0;
    const endIndex = textAnchor.textSegments[0].endIndex;

    return text.substring(startIndex, endIndex);
  };

  private async fallbackExtraction(imagePath: string): Promise<string> {
    // This is a placeholder for when Google Document AI is not configured
    // In a real scenario, you might use another OCR library like Tesseract
    console.log('Using fallback extraction method for:', imagePath);
    return 'Please configure Google Document AI credentials for OCR functionality.';
  }

  isConfigured(): boolean {
    return !!(this.client && this.projectId && this.processorId);
  }
}

