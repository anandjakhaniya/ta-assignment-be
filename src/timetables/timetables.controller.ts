import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { TimetablesService } from './timetables.service';
import { UploadFileDto } from '../common/dto/upload-file.dto';
import { ErrorResponseDto, ValidationErrorDto } from '../common/dto/timetable-response.dto';
import { TimetableResponseDto } from './dto/timetable-response.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VisionProvider } from '../common/enum/extractor.enum';

@ApiTags('Timetables')
@Controller('timetables')
export class TimetablesController {
  constructor(
    private readonly timetablesService: TimetablesService,
  ) { }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Invalid file type. Only images (JPEG, PNG), PDF, and DOCX are allowed.',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024), // 10MB
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload and process timetable file',
    description: 'Upload an image, PDF, or DOCX file containing a timetable and extract structured data using AI',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload with optional parameters',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Timetable file (Image, PDF, or DOCX)',
        },
        visionProvider: {
          type: 'string',
          enum: [VisionProvider.GROQ, VisionProvider.GOOGLE, VisionProvider.TESSERACT],
          description: 'Vision provider for OCR processing',
          default: VisionProvider.GROQ,
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File processed successfully',
    type: TimetableResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or processing error',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Validation error',
    type: ValidationErrorDto,
  })
  async uploadTimetable(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
  ): Promise<TimetableResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return await this.timetablesService.processTimetable(file, uploadDto.visionProvider);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all timetables',
    description: 'Retrieve all stored timetables with their metadata',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all timetables',
    type: [TimetableResponseDto],
  })
  async getAllTimetables(): Promise<TimetableResponseDto[]> {
    return await this.timetablesService.getAllTimetables();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get timetable by ID',
    description: 'Retrieve a specific timetable by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Timetable ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable found',
    type: TimetableResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Timetable not found',
    type: ErrorResponseDto,
  })
  async getTimetableById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TimetableResponseDto> {
    return await this.timetablesService.getTimetableById(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete timetable',
    description: 'Delete a specific timetable by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Timetable ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Timetable deleted successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Timetable not found',
    type: ErrorResponseDto,
  })
  async deleteTimetable(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    const result = await this.timetablesService.delete(id);
    if (!result) {
      throw new NotFoundException(`Timetable with ID ${id} not found`);
    }
    return { message: 'Timetable deleted successfully' };
  }
}