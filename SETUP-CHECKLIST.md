# Setup Checklist

Use this checklist to ensure everything is properly configured.

## ✅ Prerequisites

- [ ] Node.js v18 or higher installed
  ```bash
  node --version  # Should show v18.x.x or higher
  ```

- [ ] PostgreSQL v14 or higher installed
  ```bash
  psql --version  # Should show 14.x or higher
  ```

- [ ] npm installed
  ```bash
  npm --version
  ```

## ✅ Project Setup

- [ ] Dependencies installed
  ```bash
  npm install
  # Should complete without errors
  ```

- [ ] Database created
  ```bash
  createdb timetable_db
  # OR
  psql -U postgres -c "CREATE DATABASE timetable_db;"
  ```

- [ ] Database connection verified
  ```bash
  psql -U postgres -l | grep timetable_db
  # Should show timetable_db in the list
  ```

## ✅ Environment Configuration

- [ ] `.env` file created in root directory
  ```bash
  ls -la .env
  # Should show the file exists
  ```

- [ ] Port configured (default: 3000)
  ```env
  PORT=3000
  ```

- [ ] Database credentials configured
  ```env
  DB_HOST=localhost
  DB_PORT=5432
  DB_USERNAME=postgres
  DB_PASSWORD=postgres
  DB_DATABASE=timetable_db
  ```

- [ ] OpenAI API key configured (REQUIRED)
  ```env
  OPENAI_API_KEY=sk-your-actual-key-here
  ```
  **Get your key**: https://platform.openai.com/api-keys

- [ ] Groq API key configured (RECOMMENDED)
  ```env
  GROQ_API_KEY=gsk-your-actual-key-here
  VISION_PROVIDER=groq
  ```
  **Get your key**: https://console.groq.com/

- [ ] Google Cloud credentials configured (OPTIONAL)
  ```env
  GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
  GOOGLE_CLOUD_PROJECT_ID=your-project-id
  GOOGLE_CLOUD_LOCATION=us
  GOOGLE_CLOUD_PROCESSOR_ID=your-processor-id
  ```
  **Note**: Skip this if you don't have Google Document AI setup

## ✅ Application Startup

- [ ] Application starts without errors
  ```bash
  npm run start:dev
  ```
  
  Expected output:
  ```
  [Nest] LOG [NestFactory] Starting Nest application...
  [Nest] LOG [InstanceLoader] AppModule dependencies initialized
  [Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized
  [Nest] LOG [InstanceLoader] ConfigModule dependencies initialized
  [Nest] LOG [InstanceLoader] TimetablesModule dependencies initialized
  [Nest] LOG [InstanceLoader] ProcessingModule dependencies initialized
  [Nest] LOG [RoutesResolver] TimetablesController {/api/timetables}:
  [Nest] LOG [RouterExplorer] Mapped {/api/timetables, POST} route
  [Nest] LOG [RouterExplorer] Mapped {/api/timetables, GET} route
  [Nest] LOG [RouterExplorer] Mapped {/api/timetables/:id, GET} route
  [Nest] LOG [NestApplication] Nest application successfully started
  Application is running on: http://localhost:3000/api
  ```

- [ ] Server responds to requests
  ```bash
  curl http://localhost:3000/api/timetables
  # Should return: {"data":[]}
  ```

## ✅ Database Verification

- [ ] Database tables created automatically
  ```bash
  psql -U postgres -d timetable_db -c "\dt"
  # Should show 'timetables' table
  ```

- [ ] Can query the timetables table
  ```bash
  psql -U postgres -d timetable_db -c "SELECT * FROM timetables;"
  # Should return empty result (0 rows)
  ```

## ✅ API Testing

- [ ] GET /api/timetables works
  ```bash
  curl http://localhost:3000/api/timetables
  # Expected: {"data":[]}
  ```

- [ ] POST /api/timetables accepts files
  ```bash
  # Create a test file first, then:
  curl -X POST http://localhost:3000/api/timetables \
    -F "file=@/path/to/test-file.pdf"
  # Should return timetable object with weekData
  ```

- [ ] GET /api/timetables/:id works
  ```bash
  curl http://localhost:3000/api/timetables/1
  # Should return specific timetable or 404
  ```

## ✅ File Upload

- [ ] Uploads directory exists and is writable
  ```bash
  ls -la uploads/
  # Should show directory exists
  ```

- [ ] Files are stored after upload
  ```bash
  # After uploading a file
  ls -la uploads/
  # Should show uploaded file(s)
  ```

## ✅ OpenAI Integration

- [ ] OpenAI API key is valid
  ```bash
  # Upload a test file and check logs
  # Should see AI processing happening without errors
  ```

- [ ] Groq Vision is working
  ```bash
  # Upload an image and check logs
  # Should see: "Extracting text from image using Groq Vision..."
  # Should see: "Successfully extracted X characters using Groq Vision"
  ```

- [ ] AI extraction returns structured data
  ```bash
  # After uploading, check response has:
  # - weekData object
  # - days with arrays
  # - timeBlocks with startTime, endTime, subject
  ```

## ✅ Error Handling

- [ ] Invalid file type rejected
  ```bash
  curl -X POST http://localhost:3000/api/timetables \
    -F "file=@test.txt"
  # Should return 400 Bad Request
  ```

- [ ] Missing file rejected
  ```bash
  curl -X POST http://localhost:3000/api/timetables
  # Should return 400 Bad Request
  ```

- [ ] Non-existent ID returns 404
  ```bash
  curl http://localhost:3000/api/timetables/99999
  # Should return 404 Not Found
  ```

## 🎯 Ready to Use!

If all items are checked, your application is fully configured and ready to use!

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run start:dev
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL
# macOS with Homebrew:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Check connection manually
psql -U postgres -h localhost -p 5432
```

### OpenAI API Errors

- Verify API key is correct
- Check you have credits: https://platform.openai.com/account/usage
- Ensure no extra spaces in `.env` file
- Try a different model if rate limited

### Module Not Found Errors

```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

### File Upload Fails

```bash
# Check uploads directory permissions
chmod 755 uploads/

# Ensure directory exists
mkdir -p uploads
```

## 📋 Post-Setup Checklist

Once everything is working:

- [ ] Read the [README.md](./README.md) for full documentation
- [ ] Review [API-TESTING.md](./API-TESTING.md) for testing examples
- [ ] Check [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) to understand the codebase
- [ ] Review [adr.md](./adr.md) for architecture decisions

## 🎓 Next Steps

1. **Test with real timetables**: Upload images, PDFs, or DOCX files
2. **Explore the API**: Try all endpoints with different files
3. **Customize**: Modify the code to fit your specific needs
4. **Deploy**: Consider deployment options (Docker, cloud platforms)

## 📞 Need Help?

If you encounter issues:

1. Check application logs in the terminal
2. Verify database connection
3. Ensure OpenAI API key is valid
4. Review error messages carefully
5. Check this checklist again

## 🚀 Production Readiness

Before deploying to production:

- [ ] Set `synchronize: false` in TypeORM config
- [ ] Create database migrations
- [ ] Add proper error logging
- [ ] Implement rate limiting
- [ ] Add authentication if needed
- [ ] Use environment-specific configs
- [ ] Set up monitoring
- [ ] Configure HTTPS/SSL
- [ ] Review security best practices
- [ ] Add automated tests

---

**Congratulations!** If you've completed this checklist, your Timetable Extraction System is ready to use! 🎉

