import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';
import { Timetable } from './entities/timetable.entity';
import { ProcessingModule } from '../processing/processing.module';

@Module({
  imports: [TypeOrmModule.forFeature([Timetable]), ProcessingModule],
  controllers: [TimetablesController],
  providers: [TimetablesService],
  exports: [TimetablesService],
})
export class TimetablesModule {}

