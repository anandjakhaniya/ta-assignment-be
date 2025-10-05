import { Module } from '@nestjs/common';
import { ProcessingService } from './processing.service';
import { GoogleVisionExtractor } from './extractors/google-vision.extractor';
import { GroqVisionExtractor } from './extractors/groq-vision.extractor';
import { DocxExtractor } from './extractors/docx.extractor';
import { TesseractExtractor } from './extractors/tesseract.extractor';
import { ExtractorFactory } from './factories/extractor.factory';
import { AiService } from './ai.service';

@Module({
  providers: [
    ProcessingService,
    ExtractorFactory,
    GoogleVisionExtractor,
    GroqVisionExtractor,
    DocxExtractor,
    TesseractExtractor,
    AiService,
  ],
  exports: [ProcessingService],
})
export class ProcessingModule { }

