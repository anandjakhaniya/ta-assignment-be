# Architecture Decision Record (ADR)

## Simplified Timetable Extraction System

### Project Overview

A focused backend API that extracts timetable data from uploaded documents and stores it in a uniform structure for UI rendering. Simple, direct, and effective.

---

## ADR-001: Simplified Architecture

### Context

Quick assessment focusing on core timetable extraction functionality without complex enterprise features.

### Decision

**Simple 3-layer architecture:**

```
Upload File → Process & Extract → Store & Return
```

**Technology Stack:**

- **Backend**: NestJS (TypeScript, built-in validation, clean architecture)
- **Database**: PostgreSQL with TypeORM (simple ORM, good TypeScript support)
- **File Storage**: Local file system (simple, no cloud dependencies)
- **Processing**: Sharp + Groq Vision AI / Google Vision Document AI + OpenAI + LangChain

### Rationale

- NestJS provides excellent structure and TypeScript support out of the box
- TypeORM is simpler than Prisma for this use case
- Local storage eliminates cloud setup complexity
- Groq Vision provides fast, cost-effective OCR with free tier
- Focus on processing logic rather than infrastructure

---

## ADR-002: Single Table Database Design

### Context

No authentication, no user management, just timetable storage with uniform structure.

### Decision

**Single `timetables` table:**

```sql
CREATE TABLE timetables (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  upload_date TIMESTAMP DEFAULT NOW(),
  title VARCHAR(255),
  week_data JSONB NOT NULL, -- Structured timetable data
  metadata JSONB, -- Original extraction details
  status VARCHAR(50) DEFAULT 'completed'
);
```

**Week Data Structure:**

```typescript
interface WeekData {
  days: {
    monday: TimeBlock[];
    tuesday: TimeBlock[];
    wednesday: TimeBlock[];
    thursday: TimeBlock[];
    friday: TimeBlock[];
    saturday?: TimeBlock[];
    sunday?: TimeBlock[];
  };
}

interface TimeBlock {
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  subject: string; // "Mathematics"
  location?: string; // "Room 101"
  notes?: string; // Additional info
  teacherName?: string; //Jonhn Doe
}
```

### Rationale

- Single table keeps it simple
- JSONB for flexible timetable structure
- Uniform structure makes UI rendering predictable
- Easy to query and display

---

## ADR-003: Processing Pipeline

### Context

Need reliable extraction from images, PDFs, and DOCX files.

### Decision

**Simple 3-step pipeline:**

1. **File Processing**: Extract content using Groq Vision / Google Vision Document  AI for OCR
2. **AI Extraction**: Use LangChain + OpenAI to understand and structure data
3. **Data Normalization**: Convert to our uniform TimeBlock format

```typescript
// Processing flow
const processFile = async (file: Express.Multer.File) => {
  // Step 1: Extract content using Google Vision Document AI
  let extractedText: string;
  if (isImage(file)) {
    const enhancedImage = await enhanceImage(file.buffer);
    extractedText = await extractWithGoogleVision(enhancedImage);
  } else if (isPDF(file)) {
    extractedText = await extractPDFWithGoogleVision(file.buffer);
  } else if (isDOCX(file)) {
    extractedText = await extractDOCXContent(file.buffer);
  }

  // Step 2: AI extraction using LangChain + OpenAI
  const extractedData = await extractWithLangChain(extractedText);

  // Step 3: Normalize to WeekData format
  const weekData = normalizeToWeekData(extractedData);

  return weekData;
};
```

### Rationale

- Groq Vision AI provides fast, cost-effective OCR with excellent accuracy
- LangChain offers structured prompting and better error handling
- OpenAI for intelligent data interpretation and extraction
- Simple normalization step ensures consistent output
- Clear separation of concerns

---

## ADR-004: API Design

### Context

Simple REST API for upload and retrieval.

### Decision

**Two main endpoints:**

```typescript
// Upload and process timetable
POST /api/timetables
Content-Type: multipart/form-data
Body: { file: File }
Response: {
  id: number,
  filename: string,
  weekData: WeekData,
  uploadDate: string
}

// Get all timetables
GET /api/timetables
Response: {
  data: [{
    id: number,
    filename: string,
    title: string,
    weekData: WeekData,
    uploadDate: string
  }]
}

// Get specific timetable
GET /api/timetables/:id
Response: {
  id: number,
  filename: string,
  weekData: WeekData,
  metadata: object,
  uploadDate: string
}
```

### Rationale

- Simple RESTful design
- Synchronous processing (acceptable for assessment)
- Clear request/response structure
- Easy to test and integrate

---

## ADR-005: Implementation Plan

### Context

Focus on core functionality within time constraints.

### Decision

**Phase 1: Setup**

- NestJS project setup
- TypeORM configuration
- Basic API structure
- File upload endpoint

**Phase 2: Processing**

- Image enhancement with Sharp
- Groq Vision AI / Google Vision Document  integration
- PDF/DOCX parsing
- LangChain + OpenAI integration
- Data extraction logic

**Phase 3: Storage & API**

- Database integration
- Complete API endpoints
- Error handling
- Testing with sample files

**Total: ~8 hours focused development**

### Success Criteria

- ✅ Successfully extracts timetable from image, PDF, and DOCX
- ✅ Stores data in consistent format
- ✅ API returns structured timetable data
- ✅ Works with various timetable layouts
- ✅ Fast processing with Groq Vision AI

---

## Key Dependencies

```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "typeorm": "^0.3.17",
  "pg": "^8.11.3",
  "multer": "^1.4.5",
  "sharp": "^0.32.6",
  "@google-cloud/documentai": "^8.0.0",
  "groq-sdk": "^0.33.0",
  "mammoth": "^1.6.0",
  "tesseract.js": "^6.0.1",
  "openai": "^4.0.0",
  "langchain": "^0.0.200",
  "@langchain/openai": "^0.0.14"
}
```

## File Structure

```
src/
├── app.module.ts
├── main.ts
├── timetables/
│   ├── timetables.module.ts
│   ├── timetables.controller.ts
│   ├── timetables.service.ts
│   ├── timetables.entity.ts
│   └── dto/
├── processing/
│   ├── processing.service.ts
│   ├── extractors/
│   │   ├── google-vision.extractor.ts
│   │   ├── groq-vision.extractor.ts
│   │   └── docx.extractor.ts
│   ├── ai.service.ts
│   └── langchain.service.ts
└── uploads/ (local file storage)
```

This simplified approach focuses entirely on the core challenge: accurate timetable extraction and storage with clean, maintainable code.