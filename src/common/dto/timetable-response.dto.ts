import { ApiProperty } from '@nestjs/swagger';
import { WeekDataDto } from './time-block.dto';

export class TimetableMetadataDto {
  @ApiProperty({
    description: 'File type that was processed',
    example: 'image',
    enum: ['image', 'pdf', 'docx'],
  })
  fileType: string;

  @ApiProperty({
    description: 'Vision provider used for processing',
    example: 'groq',
    enum: ['groq', 'google', 'tesseract', 'none'],
  })
  visionProvider: string;

  @ApiProperty({
    description: 'Extractor class that was used',
    example: 'GroqVisionExtractor',
  })
  extractorUsed: string;

  @ApiProperty({
    description: 'First 500 characters of extracted text',
    example: 'Monday 09:00-10:30 Data Structures Room 101...',
  })
  extractedText: string;

  @ApiProperty({
    description: 'Processing timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  processingDate: string;

  @ApiProperty({
    description: 'Title of the timetable',
    example: 'Fall 2024 Computer Science Schedule',
  })
  title: string;
}

export class TimetableResponseDto {
  @ApiProperty({
    description: 'Extracted timetable data organized by days',
    type: WeekDataDto,
  })
  weekData: WeekDataDto;

  @ApiProperty({
    description: 'Processing metadata and information',
    type: TimetableMetadataDto,
  })
  metadata: TimetableMetadataDto;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Failed to process file: Invalid file format',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}

export class ValidationErrorDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Validation error messages',
    example: ['visionProvider must be a valid enum value'],
    type: [String],
  })
  message: string[];

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}
