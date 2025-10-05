import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { VisionProvider } from '../../common/enum/extractor.enum';

export class UploadFileDto {
  @ApiProperty({
    description: 'Vision provider to use for OCR processing',
    enum: VisionProvider,
    default: VisionProvider.GROQ,
    example: VisionProvider.GROQ,
  })
  @IsOptional()
  @IsEnum(VisionProvider)
  visionProvider?: VisionProvider;
}
