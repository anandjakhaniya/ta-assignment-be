import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timetable } from './entities/timetable.entity';
import { TimetableResponseDto } from './dto/timetable-response.dto';
import { ProcessingService } from '../processing/processing.service';
import { createWorker } from 'tesseract.js';
import { VisionProvider } from '../common/enum/extractor.enum';

@Injectable()
export class TimetablesService {
  constructor(
    @InjectRepository(Timetable)
    private readonly timetableRepository: Repository<Timetable>,
    private readonly processingService: ProcessingService,
  ) { }

  async processTimetable(file: Express.Multer.File, visionProvider?: VisionProvider): Promise<TimetableResponseDto> {
    // Process the file and extract timetable data
    const { weekData, metadata } = await this.processingService.processFile(file, visionProvider);

    // Create and save timetable entity
    const timetable = this.timetableRepository.create({
      filename: file.originalname,
      weekData,
      metadata,
      title: metadata?.title || file.originalname,
      status: 'completed',
    });

    const savedTimetable = await this.timetableRepository.save(timetable);

    return this.mapToResponseDto(savedTimetable);
  }

  async getAllTimetables(): Promise<TimetableResponseDto[]> {
    const timetables = await this.timetableRepository.find({
      order: { uploadDate: 'DESC' },
    });

    return timetables.map((timetable) => this.mapToResponseDto(timetable));
  }

  async getTimetableById(id: number): Promise<TimetableResponseDto> {
    const timetable = await this.timetableRepository.findOne({ where: { id } });

    if (!timetable) {
      throw new NotFoundException(`Timetable with ID ${id} not found`);
    }

    return this.mapToResponseDto(timetable);
  }

  private mapToResponseDto(timetable: Timetable): TimetableResponseDto {
    return {
      id: timetable.id,
      filename: timetable.filename,
      title: timetable.title,
      weekData: timetable.weekData,
      uploadDate: timetable.uploadDate.toISOString(),
      status: timetable.status,
      metadata: timetable.metadata,
    };
  }

  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    const worker = await createWorker('eng'); // 'eng' for English
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    return text;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.timetableRepository.delete(id);
    return result.affected > 0;
  }
}

