# Project Structure

Complete file structure of the Timetable Extraction System.

```
ta-assignment/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── nest-cli.json             # NestJS CLI configuration
│   ├── .eslintrc.js              # ESLint rules
│   ├── .prettierrc               # Prettier formatting rules
│   └── .gitignore                # Git ignore patterns
│
├── 📚 Documentation
│   ├── README.md                 # Main documentation
│   ├── QUICK-START.md            # Quick start guide
│   ├── SETUP-CHECKLIST.md        # Setup verification checklist
│   ├── SWAGGER-DOCUMENTATION.md  # Swagger API documentation
│   ├── EXTRACTOR-FACTORY-PATTERN.md # Factory pattern implementation
│   ├── VISION-PROVIDER-COMPARISON.md # Vision provider comparison
│   ├── adr.md                    # Architecture Decision Record
│   ├── PROJECT-STRUCTURE.md      # This file
│   └── database-setup.sql        # Database setup script
│
├── 📁 src/                       # Source code
│   │
│   ├── 🚀 Application Bootstrap
│   │   ├── main.ts               # Application entry point with Swagger
│   │   └── app.module.ts         # Root module
│   │
│   ├── 📋 Timetables Module
│   │   ├── timetables.module.ts  # Module definition
│   │   ├── timetables.controller.ts  # REST API endpoints with Swagger
│   │   ├── timetables.service.ts     # Business logic
│   │   │
│   │   ├── entities/
│   │   │   └── timetable.entity.ts   # TypeORM entity with Swagger decorators
│   │   │
│   │   └── dto/
│   │       └── timetable-response.dto.ts  # Response DTO
│   │
│   ├── 🔧 Processing Module
│   │   ├── processing.module.ts      # Module definition
│   │   ├── processing.service.ts     # Main processing orchestrator
│   │   ├── ai.service.ts             # LangChain + OpenAI integration
│   │   │
│   │   ├── factories/
│   │   │   └── extractor.factory.ts  # Extractor factory pattern
│   │   │
│   │   └── extractors/
│   │       ├── google-vision.extractor.ts  # Google Document AI
│   │       ├── groq-vision.extractor.ts    # Groq Vision AI
│   │       ├── tesseract.extractor.ts      # Tesseract OCR
│   │       └── docx.extractor.ts           # DOCX extraction
│   │
│   └── 📝 Common Module
│       └── dto/
│           ├── upload-file.dto.ts      # File upload DTO with Swagger
│           ├── time-block.dto.ts       # Time block DTO with Swagger
│           └── timetable-response.dto.ts # Response DTO with Swagger
│
└── 📂 uploads/                   # File upload directory
    └── .gitkeep                  # Keep directory in git
```

## Module Overview

### 1. Application Module (`src/app.module.ts`)

The root module that:
- Configures environment variables with `ConfigModule`
- Sets up TypeORM database connection
- Imports the Timetables feature module

### 2. Timetables Module (`src/timetables/`)

Handles all timetable-related operations:

#### Controller (`timetables.controller.ts`)
- `POST /api/timetables` - Upload and process timetable
- `GET /api/timetables` - Get all timetables
- `GET /api/timetables/:id` - Get specific timetable
- `DELETE /api/timetables/:id` - Delete timetable
- Swagger decorators for interactive documentation

#### Service (`timetables.service.ts`)
- `processTimetable()` - Orchestrates file processing with vision provider
- `getAllTimetables()` - Retrieves all timetables
- `getTimetableById()` - Retrieves specific timetable
- `delete()` - Deletes timetable by ID
- `mapToResponseDto()` - Maps entity to DTO

#### Entity (`entities/timetable.entity.ts`)
Database entity with fields and Swagger decorators:
- `id` - Primary key
- `filename` - Original filename
- `uploadDate` - Upload timestamp
- `title` - Timetable title
- `weekData` - JSONB structured schedule
- `metadata` - JSONB additional data
- `status` - Processing status

#### DTO (`dto/timetable-response.dto.ts`)
Response data transfer object for API responses.

### 3. Processing Module (`src/processing/`)

Handles document processing and AI extraction:

#### Processing Service (`processing.service.ts`)
Main orchestrator that:
- Uses ExtractorFactory for provider selection
- Determines file type (image/PDF/DOCX)
- Routes to appropriate extractor
- Calls AI service for data structuring
- Normalizes data to `WeekData` format
- Supports vision provider switching

#### AI Service (`ai.service.ts`)
- Uses LangChain for structured prompting
- Integrates OpenAI GPT-4o-mini
- Defines Zod schema for validation
- Extracts timetable data from text

#### Factory Pattern

**Extractor Factory** (`factories/extractor.factory.ts`)
- Central factory for managing all extractors
- Simple provider selection without complex fallback logic
- Type-safe extractor selection
- Status monitoring for all extractors

#### Extractors

**Google Vision Extractor** (`extractors/google-vision.extractor.ts`)
- Enhances images with Sharp
- Performs OCR using Google Document AI
- Falls back gracefully if not configured
- Implements `isConfigured()` method

**Groq Vision Extractor** (`extractors/groq-vision.extractor.ts`)
- Fast, cost-effective OCR using Groq Vision AI
- Direct REST API calls for vision processing
- Image enhancement with Sharp
- Implements `isConfigured()` method

**Tesseract Extractor** (`extractors/tesseract.extractor.ts`)
- Local OCR fallback using Tesseract.js
- No API calls required
- Image enhancement for better OCR
- Worker management and cleanup

**DOCX Extractor** (`extractors/docx.extractor.ts`)
- Extracts text from Word documents
- Uses mammoth library

## Data Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/timetables
       │ (multipart/form-data)
       ▼
┌─────────────────────┐
│ TimetablesController│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  TimetablesService  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ProcessingService  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ExtractorFactory   │
└──────────┬──────────┘
           │
           ├─────► GroqVisionExtractor (images/PDFs)
           ├─────► GoogleVisionExtractor (images/PDFs)
           ├─────► TesseractExtractor (images/PDFs)
           └─────► DocxExtractor (DOCX)
           │
           ▼
┌─────────────────────┐
│     AIService       │
│  (LangChain+OpenAI) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Normalize WeekData  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Save to Database   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Return Response    │
└─────────────────────┘
```

## Database Schema

```sql
CREATE TABLE timetables (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  upload_date TIMESTAMP DEFAULT NOW(),
  title VARCHAR(255),
  week_data JSONB NOT NULL,
  metadata JSONB,
  status VARCHAR(50) DEFAULT 'completed'
);
```

### WeekData Structure (JSONB)

```typescript
{
  days: {
    monday: [
      {
        startTime: "09:00",
        endTime: "10:00",
        subject: "Mathematics",
        location: "Room 101",
        teacherName: "Prof. Smith",
        notes: "Bring calculator"
      }
    ],
    tuesday: [...],
    wednesday: [...],
    thursday: [...],
    friday: [...],
    saturday: [...],
    sunday: [...]
  }
}
```

## Key Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @nestjs/core | ^10.0.0 | NestJS framework core |
| @nestjs/typeorm | ^10.0.0 | TypeORM integration |
| @nestjs/swagger | ^7.0.0 | Swagger documentation |
| swagger-ui-express | ^5.0.0 | Swagger UI |
| typeorm | ^0.3.17 | ORM for database |
| pg | ^8.11.3 | PostgreSQL driver |
| sharp | ^0.32.6 | Image processing |
| @google-cloud/documentai | ^8.0.0 | Google Document AI |
| groq-sdk | ^0.33.0 | Groq Vision API |
| mammoth | ^1.6.0 | DOCX text extraction |
| tesseract.js | ^6.0.1 | OCR fallback |
| openai | ^4.0.0 | OpenAI API client |
| langchain | ^0.0.200 | LangChain framework |
| @langchain/openai | ^0.0.14 | LangChain OpenAI integration |
| zod | ^3.22.4 | Schema validation |
| class-validator | ^0.14.0 | Validation decorators |
| class-transformer | ^0.5.1 | Object transformation |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| @nestjs/cli | NestJS CLI tools |
| typescript | TypeScript compiler |
| @typescript-eslint/* | TypeScript linting |
| prettier | Code formatting |

## Environment Variables

Required configuration in `.env`:

```env
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=timetable_db

# OpenAI (Required)
OPENAI_API_KEY=sk-xxx

# Google Cloud (Optional)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GOOGLE_CLOUD_PROJECT_ID=project-id
GOOGLE_CLOUD_LOCATION=us
GOOGLE_CLOUD_PROCESSOR_ID=processor-id
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/timetables` | Upload & process timetable |
| GET | `/api/timetables` | Get all timetables |
| GET | `/api/timetables/:id` | Get specific timetable |
| DELETE | `/api/timetables/:id` | Delete timetable |
| GET | `/api/docs` | Swagger UI documentation |

## File Upload Specifications

- **Max file size**: Configurable via `MAX_FILE_SIZE` env var (default: 10MB)
- **Allowed types**: 
  - Images: JPEG, PNG
  - Documents: PDF, DOCX
- **Storage**: Local filesystem (`./uploads/`)
- **Naming**: `file-{timestamp}-{random}.{ext}`
- **Vision Provider**: Optional parameter for OCR provider selection

## Build & Run Scripts

```bash
# Development
npm run start:dev        # Watch mode with auto-reload

# Production
npm run build            # Build TypeScript to JavaScript
npm run start:prod       # Run production build

# Code Quality
npm run format           # Format code with Prettier
npm run lint             # Lint code with ESLint
```

## Deployment Considerations

### Environment-Specific Settings

**Development**:
- `synchronize: true` in TypeORM (auto-create tables)
- Detailed logging enabled
- Local file storage

**Production**:
- `synchronize: false` in TypeORM (use migrations)
- Minimal logging
- Consider cloud storage (S3, GCS)
- Environment variable validation
- HTTPS/SSL termination
- Rate limiting
- Input validation

### Scaling Considerations

- Add Redis for caching
- Implement job queue for async processing
- Use cloud storage for files
- Add CDN for file delivery
- Implement database connection pooling
- Add health check endpoints

## Testing

```bash
# Test the application
curl -X POST http://localhost:3000/api/timetables \
  -F "file=@timetable.pdf" \
  -F "visionProvider=groq"

curl http://localhost:3000/api/timetables

curl -X DELETE http://localhost:3000/api/timetables/1

# Access Swagger UI
# http://localhost:3000/api/docs
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Setup database: `createdb timetable_db`
3. ✅ Configure `.env` file
4. ✅ Start application: `npm run start:dev`
5. ✅ Access Swagger UI: `http://localhost:3000/api/docs`
6. ✅ Test API endpoints through Swagger UI

For detailed instructions, see [QUICK-START.md](./QUICK-START.md).

