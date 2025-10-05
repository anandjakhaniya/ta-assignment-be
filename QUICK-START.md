# Quick Start Guide

Get the Timetable Extraction API up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js (v18+): `node --version`
- ✅ PostgreSQL (v14+): `psql --version`
- ✅ npm: `npm --version`

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Start PostgreSQL (if not running)
# macOS with Homebrew:
brew services start postgresql

# Or on Linux:
sudo systemctl start postgresql

# Create the database
createdb timetable_db

# Alternatively, use psql:
psql -U postgres -c "CREATE DATABASE timetable_db;"
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```bash
cat > .env << 'EOF'
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=timetable_db

OPENAI_API_KEY=sk-your-actual-openai-api-key-here
EOF
```

**⚠️ IMPORTANT:** Replace `sk-your-actual-openai-api-key-here` with your real OpenAI API key!

Get your OpenAI API key from: https://platform.openai.com/api-keys

### 4. Start the Application

```bash
npm run start:dev
```

You should see:

```
Application is running on: http://localhost:3000/api
```

### 5. Test It!

**Option A: Quick Health Check**

```bash
curl http://localhost:3000/api/timetables
```

Expected response: `{"data":[]}`

## That's It! 🎉

Your API is now running at `http://localhost:3000/api`

## Next Steps

1. **Read the full documentation**: [README.md](./README.md)
2. **Test the API**: [API-TESTING.md](./API-TESTING.md)
3. **Upload your own timetables**: Use any image, PDF, or DOCX file

## Common Issues & Quick Fixes

### Port 3000 already in use

```bash
# Use a different port
PORT=3001 npm run start:dev
```

### Database connection error

```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l | grep timetable_db

# If database doesn't exist, create it
createdb timetable_db
```

### "OPENAI_API_KEY is not defined"

Make sure your `.env` file exists and contains a valid OpenAI API key:

```bash
# Check .env file exists
cat .env | grep OPENAI_API_KEY

# If missing, add it:
echo "OPENAI_API_KEY=sk-your-key-here" >> .env
```

### Module not found errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

```bash
# Start development server with auto-reload
npm run start:dev

# In another terminal, test the API
curl http://localhost:3000/api/timetables

# Format code
npm run format

# Lint code
npm run lint
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## Optional: Google Document AI Setup

For enhanced OCR capabilities (recommended for best results):

1. Create a Google Cloud project
2. Enable Document AI API
3. Create a Document OCR processor
4. Download service account JSON
5. Add to `.env`:

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us
GOOGLE_CLOUD_PROCESSOR_ID=your-processor-id
```

**Note**: The app works without Google Document AI but with reduced OCR accuracy.

## Need Help?

- 📖 Full documentation: [README.md](./README.md)
- 🧪 API testing guide: [API-TESTING.md](./API-TESTING.md)
- 📋 Architecture decisions: [adr.md](./adr.md)

## Minimal Test Commands

```bash
# 1. Check server is running
curl http://localhost:3000/api/timetables

# 2. Upload a file (replace with your file path)
curl -X POST http://localhost:3000/api/timetables \
  -F "file=@/path/to/timetable.pdf"

# 3. Get all timetables
curl http://localhost:3000/api/timetables

# 4. Get specific timetable (replace 1 with actual ID)
curl http://localhost:3000/api/timetables/1
```

Happy coding! 🚀

