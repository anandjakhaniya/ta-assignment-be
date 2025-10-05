import { Injectable, BadRequestException } from '@nestjs/common';
import { WeekDataDto } from '../common/dto/time-block.dto';
import { ExtractorFactory } from './factories/extractor.factory';
import { FileType, VisionProvider } from '../common/enum/extractor.enum';
import { AiService } from './ai.service';

@Injectable()
export class ProcessingService {

  constructor(
    private readonly extractorFactory: ExtractorFactory,
    private readonly aiService: AiService,
  ) {
    console.log('Extractor status:', this.extractorFactory.getExtractorStatus());
  }

  async processFile(
    file: Express.Multer.File,
    visionProvider?: VisionProvider,
  ): Promise<{ weekData: WeekDataDto; metadata: Record<string, any> }> {
    try {
      let extractedText: string;
      const fileType = this.getFileType(file);

      // Step 1: Get appropriate extractor using factory
      // const extractor = this.extractorFactory.getExtractor(
      //   fileType,
      //   visionProvider
      // );

      // // Step 2: Extract content using the selected extractor
      // switch (fileType) {
      //   case FileType.IMAGE:
      //     extractedText = await extractor.extractFromImage(file.path, file.mimetype);
      //     break;
      //   case FileType.PDF:
      //     extractedText = await extractor.extractFromPdf(file.path, file.mimetype);
      //     break;
      //   case FileType.DOCX:
      //     extractedText = await extractor.extractFromDocx(file.path);
      //     break;
      //   default:
      //     throw new BadRequestException('Unsupported file type');
      // }

      // if (!extractedText || extractedText.trim().length === 0) {
      //   throw new BadRequestException('Could not extract text from the file');
      // }

      // Step 2: Use AI to extract and structure timetable data
      const structuredData = await this.aiService.extractTimetableData(extractedText);

      // Step 3: Normalize to WeekData format
      const weekData = this.normalizeToWeekData(structuredData);

      return {
        weekData,
        metadata: {
          fileType,
          visionProvider: fileType === FileType.IMAGE || fileType === FileType.PDF ? visionProvider : 'none',
          // extractorUsed: extractor.constructor.name,
          // extractedText: extractedText.substring(0, 500), // Store first 500 chars
          processingDate: new Date().toISOString(),
          title: structuredData.title || file.originalname,
        },
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw new BadRequestException(
        `Failed to process file: ${error.message}`,
      );
    }
  }

  /**
   * Get extractor status
   */
  getExtractorStatus(): Record<string, any> {
    return this.extractorFactory.getExtractorStatus();
  }

  private getFileType(file: Express.Multer.File): FileType {
    const mimetype = file.mimetype;

    if (mimetype.startsWith('image/')) {
      return FileType.IMAGE;
    } else if (mimetype === 'application/pdf') {
      return FileType.PDF;
    } else if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return FileType.DOCX;
    }

    throw new BadRequestException('Unsupported file type');
  }

  private normalizeToWeekData(structuredData: any): WeekDataDto {
    const weekData: WeekDataDto = {
      days: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
    };

    // Map the structured data to WeekData format
    if (structuredData.schedule) {
      for (const [day, blocks] of Object.entries(structuredData.schedule)) {
        const dayKey = day.toLowerCase() as keyof typeof weekData.days;
        if (weekData.days[dayKey] !== undefined) {
          weekData.days[dayKey] = blocks as any[];
        }
      }
    }

    return weekData;
  }
}

