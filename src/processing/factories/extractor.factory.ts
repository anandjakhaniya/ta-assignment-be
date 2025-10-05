import { Injectable } from '@nestjs/common';
import { GoogleVisionExtractor } from '../extractors/google-vision.extractor';
import { GroqVisionExtractor } from '../extractors/groq-vision.extractor';
import { DocxExtractor } from '../extractors/docx.extractor';
import { TesseractExtractor } from '../extractors/tesseract.extractor';
import { FileType, VisionProvider } from '../../common/enum/extractor.enum';
import { Extractor } from '../../common/interface/extractor.interface';

@Injectable()
export class ExtractorFactory {
  constructor(
    private readonly googleVisionExtractor: GoogleVisionExtractor,
    private readonly groqVisionExtractor: GroqVisionExtractor,
    private readonly docxExtractor: DocxExtractor,
    private readonly tesseractExtractor: TesseractExtractor,
  ) {}

  /**
   * Get the appropriate extractor for the given file type and vision provider
   */
  getExtractor(fileType: FileType, visionProvider?: VisionProvider): Extractor {
    const provider = visionProvider || this.getDefaultVisionProvider();
    
    switch (fileType) {
      case FileType.IMAGE:
        return this.getVisionExtractor(provider);
      case FileType.PDF:
        return this.getVisionExtractor(provider);
      case FileType.DOCX:
        return this.docxExtractor;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  /**
   * Get vision extractor based on provider
   */
  private getVisionExtractor(provider: VisionProvider): Extractor {
    switch (provider) {
      case VisionProvider.GROQ:
        return this.groqVisionExtractor;
      case VisionProvider.GOOGLE:
        return this.googleVisionExtractor;
      case VisionProvider.TESSERACT:
        return this.tesseractExtractor;
      default:
        throw new Error(`Unsupported vision provider: ${provider}`);
    }
  }

  /**
   * Get the default vision provider from environment
   */
  private getDefaultVisionProvider(): VisionProvider {
    const provider = process.env.VISION_PROVIDER?.toLowerCase();
    
    switch (provider) {
      case 'groq':
        return VisionProvider.GROQ;
      case 'google':
        return VisionProvider.GOOGLE;
      case 'tesseract':
        return VisionProvider.TESSERACT;
      default:
        return VisionProvider.GROQ; // Default to Groq
    }
  }


  /**
   * Get extractor status information
   */
  getExtractorStatus(): Record<string, any> {
    return {
      groq: {
        configured: this.groqVisionExtractor.isConfigured(),
        model: this.groqVisionExtractor.getModel(),
      },
      google: {
        configured: this.googleVisionExtractor.isConfigured(),
      },
      tesseract: {
        configured: this.tesseractExtractor.isConfigured(),
      },
      docx: {
        configured: true, // Always available
      },
    };
  }
}
