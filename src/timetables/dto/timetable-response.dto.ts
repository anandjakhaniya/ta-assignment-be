import { ApiProperty } from '@nestjs/swagger';
import { WeekDataDto } from '../../common/dto/time-block.dto';

export class TimetableResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the timetable',
    example: 1,
  })
  id: number;
  @ApiProperty({
    description: 'Original filename of the timetable',
    example: 'timetable.pdf',
  })
  filename: string;
  @ApiProperty({
    description: 'Original filename of the timetable',
    example: 'timetable.pdf',
  })
  title?: string;

  @ApiProperty({
    description: 'Extracted timetable data organized by days',
    type: WeekDataDto,
  })
  weekData: WeekDataDto;
  @ApiProperty({
    description: 'Upload date of the timetable',
    example: '2024-01-01',
  })
  uploadDate: string;
  @ApiProperty({
    description: 'Upload date of the timetable',
    example: '2024-01-01',
  })
  status: string;
  @ApiProperty({
    description: 'Additional metadata for the timetable',
    example: {
      visionProvider: 'groq',
    },
  })
  metadata?: Record<string, any>;
}

