import { ApiProperty } from '@nestjs/swagger';

export class TimeBlockDto {
  @ApiProperty({
    description: 'Start time of the class',
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time of the class',
    example: '10:30',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  endTime: string;

  @ApiProperty({
    description: 'Subject or course name',
    example: 'Data Structures and Algorithms',
  })
  subject: string;

  @ApiProperty({
    description: 'Room number or location',
    example: 'Room 101',
    required: false,
  })
  location?: string;

  @ApiProperty({
    description: 'Teacher or instructor name',
    example: 'Dr. Smith',
    required: false,
  })
  teacher?: string;

  @ApiProperty({
    description: 'Additional notes or description',
    example: 'Lab session',
    required: false,
  })
  notes?: string;
}

export class DayScheduleDto {

  @ApiProperty({
    description: 'Monday schedule',
    type: TimeBlockDto,
  })
  monday: TimeBlockDto[];

  @ApiProperty({
    description: 'Tuesday schedule',
    type: TimeBlockDto,
  })
  tuesday: TimeBlockDto[];

  @ApiProperty({
    description: 'Wednesday schedule',
    type: TimeBlockDto,
  })
  wednesday: TimeBlockDto[];

  @ApiProperty({
    description: 'Thursday schedule',
    type: TimeBlockDto,
  })
  thursday: TimeBlockDto[];

  @ApiProperty({
    description: 'Friday schedule',
    type: TimeBlockDto,
  })
  friday: TimeBlockDto[];

  @ApiProperty({
    description: 'Saturday schedule',
    type: TimeBlockDto,
  })
  saturday: TimeBlockDto[];

  @ApiProperty({
    description: 'Sunday schedule',
    type: TimeBlockDto,
  })
  sunday: TimeBlockDto[];
}

export class WeekDataDto {
  @ApiProperty({
    description: 'List of days in the week',
    type: DayScheduleDto,
  })
  days: DayScheduleDto;
}
