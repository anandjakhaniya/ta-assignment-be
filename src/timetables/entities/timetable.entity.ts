import { WeekDataDto } from '../../common/dto/time-block.dto';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('timetables')
export class Timetable {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @CreateDateColumn({ name: 'upload_date' })
  uploadDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'jsonb' })
  weekData: WeekDataDto;

  
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: 'completed' })
  status: string;
}

