import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetablesModule } from './timetables/timetables.module';
import { Timetable } from './timetables/entities/timetable.entity';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configure TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'timetable_db',
      entities: [Timetable],
      synchronize: true, // Set to false in production
      logging: false,
    }),

    // Feature modules
    TimetablesModule,
  ],
})
export class AppModule {}

