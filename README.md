# Timetable Extraction System

A NestJS-based backend API that extracts timetable data from uploaded documents (images, PDFs, DOCX) and stores it in a structured format for easy rendering.

## Features

- 📤 Upload timetable documents (JPEG, PNG, PDF, DOCX)
- 🔍 Extract text using **Groq Vision** or Google Document AI (OCR)
- ⚡ **NEW**: Groq Vision AI - Fast, cost-effective alternative to Google
- 🤖 AI-powered data extraction using OpenAI and LangChain
- 💾 Store structured timetable data in PostgreSQL
- 🔄 RESTful API for easy integration
- 📊 Uniform data structure for predictable UI rendering
- 🔀 Automatic fallback between vision providers

## Technology Stack

- **Backend**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **File Storage**: Local file system
- **OCR**: Groq Vision AI (default) or Google Document AI
- **AI**: OpenAI GPT-4 + LangChain
- **Image Processing**: Sharp

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- **OpenAI API Key** (Required)
- **Groq API Key** (Recommended - for fast, free OCR)
- Google Cloud Account with Document AI (Optional - alternative OCR)

## Installation

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE timetable_db;

# Exit psql
\q
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=timetable_db

# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=your_openai_api_key_here

# Groq Configuration (RECOMMENDED - for fast OCR)
GROQ_API_KEY=your_groq_api_key_here
GROQ_VISION_MODEL=llama-3.2-11b-vision-preview
VISION_PROVIDER=groq

# Google Cloud Configuration (OPTIONAL - alternative OCR)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_LOCATION=us
GOOGLE_CLOUD_PROCESSOR_ID=your_processor_id

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 4. Groq Vision Setup (Recommended)

For fast and accurate OCR, set up Groq Vision:

1. Go to [Groq Console](https://console.groq.com/)
2. Create an account (free tier available)
3. Generate an API key
4. Add to `.env`: `GROQ_API_KEY=your_groq_key`

**Note**: Groq Vision is now fully implemented with SDK support!

### 5. Google Document AI Setup (Optional Alternative)

For enterprise-grade OCR, set up Google Document AI:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Document AI API
3. Create a Document OCR processor
4. Download service account credentials JSON
5. Set the path in `GOOGLE_APPLICATION_CREDENTIALS`
6. Change `VISION_PROVIDER=google` in `.env`

**Note**: The application works best with Groq Vision (default) or Google Document AI. Both provide excellent OCR results.

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000/api`

**Swagger Documentation:** `http://localhost:3000/api/docs`

### Production Mode

```bash
# Build
npm run build

# Start
npm run start:prod
```

## API Endpoints

### 1. Upload Timetable

**POST** `/api/timetables`

Upload and process a timetable document.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (image/jpeg, image/png, application/pdf, or .docx)
- Optional: `visionProvider` (groq, google, tesseract)

**Example:**
```bash
curl -X POST http://localhost:3000/api/timetables \
  -F "file=@/path/to/timetable.pdf" \
  -F "visionProvider=groq"
```

**Response:**
```json
{
  "id": 1,
  "filename": "timetable.pdf",
  "title": "Weekly Schedule",
  "weekData": {
    "days": {
      "monday": [
        {
          "startTime": "09:00",
          "endTime": "10:00",
          "subject": "Mathematics",
          "location": "Room 101",
          "teacherName": "John Doe",
          "notes": "Bring calculator"
        }
      ],
      "tuesday": [...],
      ...
    }
  },
  "uploadDate": "2024-01-15T10:30:00.000Z",
  "status": "completed"
}
```

### 2. Get All Timetables

**GET** `/api/timetables`

Retrieve all uploaded timetables.

**Example:**
```bash
curl http://localhost:3000/api/timetables
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "filename": "timetable.pdf",
      "title": "Weekly Schedule",
      "weekData": { ... },
      "uploadDate": "2024-01-15T10:30:00.000Z",
      "status": "completed"
    }
  ]
}
```

### 3. Get Timetable by ID

**GET** `/api/timetables/:id`

Retrieve a specific timetable with full details.

**Example:**
```bash
curl http://localhost:3000/api/timetables/1
```

**Response:**
```json
{
  "id": 1,
  "filename": "timetable.pdf",
  "title": "Weekly Schedule",
  "weekData": { ... },
  "metadata": {
    "fileType": "pdf",
    "processingDate": "2024-01-15T10:30:00.000Z",
    "extractedText": "..."
  },
  "uploadDate": "2024-01-15T10:30:00.000Z",
  "status": "completed"
}
```

### 4. Delete Timetable

**DELETE** `/api/timetables/:id`

Delete a specific timetable by its ID.

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/timetables/1
```

**Response:**
```json
{
  "message": "Timetable deleted successfully"
}
```

### 5. Swagger Documentation

**GET** `/api/docs`

Access the interactive Swagger UI documentation for testing all endpoints.

**URL:** `http://localhost:3000/api/docs`

## Data Structure

### WeekData Interface

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
  startTime: string;      // "09:00"
  endTime: string;        // "10:00"
  subject: string;        // "Mathematics"
  location?: string;      // "Room 101"
  notes?: string;         // Additional info
  teacherName?: string;   // "John Doe"
}
```

## Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── timetables/                # Timetables feature module
│   ├── timetables.module.ts
│   ├── timetables.controller.ts
│   ├── timetables.service.ts
│   ├── entities/
│   │   └── timetable.entity.ts
│   └── dto/
│       └── timetable-response.dto.ts
└── processing/                # File processing module
    ├── processing.module.ts
    ├── processing.service.ts  # Main processing orchestrator
    ├── ai.service.ts          # LangChain + OpenAI integration
    └── extractors/
        ├── google-vision.extractor.ts
        ├── pdf.extractor.ts
        └── docx.extractor.ts
```

## Processing Pipeline

1. **File Upload**: User uploads a timetable document
2. **Content Extraction**:
   - **Images**: Enhanced with Sharp → **Groq Vision** or Google Document AI OCR
   - **PDFs**: Text extraction with pdf-parse (or Groq Vision)
   - **DOCX**: Text extraction with mammoth
3. **AI Processing**: LangChain + OpenAI analyze and structure the data
4. **Normalization**: Convert to uniform WeekData format
5. **Storage**: Save to PostgreSQL database
6. **Response**: Return structured timetable data

### Vision Provider Selection

The system automatically selects the configured vision provider:
- **Default**: Groq Vision (fast, cost-effective)
- **Alternative**: Google Document AI (enterprise-grade)
- **Fallback**: Automatically switches if primary fails

## Error Handling

The API includes comprehensive error handling:

- Invalid file types return `400 Bad Request`
- Processing failures return `400 Bad Request` with details
- Not found resources return `404 Not Found`
- File size exceeds limit (10MB) returns `400 Bad Request`

## Testing

Test the API with sample files:

```bash
# Upload an image
curl -X POST http://localhost:3000/api/timetables \
  -F "file=@sample-timetable.jpg"

# Upload a PDF
curl -X POST http://localhost:3000/api/timetables \
  -F "file=@timetable.pdf"

# Get all timetables
curl http://localhost:3000/api/timetables

# Get specific timetable
curl http://localhost:3000/api/timetables/1

# Delete timetable
curl -X DELETE http://localhost:3000/api/timetables/1
```

## Development

```bash
# Development with watch mode
npm run start:dev

# Build for production
npm run build

# Format code
npm run format

# Lint code
npm run lint
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Verify database exists
psql -U postgres -l | grep timetable_db
```

### Groq Vision Not Working

- Verify API key is valid: https://console.groq.com/
- Check you have available credits/quota
- Try switching to Google Vision: `VISION_PROVIDER=google`
- Review logs for specific error messages

### Google Document AI Not Working

- Verify credentials file path is correct
- Ensure Document AI API is enabled in Google Cloud
- Check processor ID and project ID are correct
- Switch to Groq Vision: `VISION_PROVIDER=groq`

### OpenAI API Issues

- Verify API key is valid and has credits
- Check network connectivity to OpenAI servers
- Ensure you're using a supported model (gpt-4o-mini)

## Security Considerations

- File size is limited to 10MB
- Only specific file types are allowed (JPEG, PNG, PDF, DOCX)
- API keys should be kept in `.env` and never committed
- In production, set `synchronize: false` in TypeORM config

## Future Enhancements

- [ ] Async processing with job queues
- [ ] Real-time processing status updates
- [ ] Multiple timetable formats support
- [ ] Export functionality
- [ ] User authentication
- [ ] Cloud storage integration (S3, Google Cloud Storage)

## License

MIT

## Support

For issues and questions, please create an issue in the repository.

