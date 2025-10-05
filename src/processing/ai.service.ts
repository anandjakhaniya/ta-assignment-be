import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

@Injectable()
export class AiService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL,
      temperature: Number(process.env.OPENAI_TEMPERATURE || 0.1),
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async extractTimetableData(extractedText: string): Promise<any> {
    extractedText = "The image is a school timetable for Class 2EJ at Little Thurrock Primary School, taught by Miss Joynes, during Spring Term, Week 2. The timetable is divided into a grid with days of the week (Monday to Friday) on the left-hand side and time slots across the top. The time slots range from 8:35 am to 3:15 pm, with breaks in between. Here's a detailed breakdown of the timetable: **Monday** * 8:35 - 9:30 am: Registration and Early Morning Work (RWI) * 9:30 - 10:00 am: Maths Consolidation * 10:00 - 10:15 am: Assembly * 10:20 - 10:35 am: Break * 10:35 - 11:00 am: Maths Continued * 11:00 - 11:55 am: English Experience Day * 1:15 - 2:00 pm: History - Inside the Titanic * 2:00 - 3:00 pm: Computing - Data (Tally Charts) Pictogram * 3:00 - 3:15 pm: Storytime **Tuesday** * 8:35 - 9:30 am: Registration and Early Morning Work (RWI) * 9:30 - 10:20 am: English Sentence Stack 5 * 10:35 - 11:00 am: PHSE Lesson 2 - What is Money and how to keep it safe * 11:00 - 12:00 pm: Music - Glocks booked at 11:30 * 1:15 - 1:45 pm: Maths - Compare and order time * 2:00 - 3:00 pm: Science - Natural and man-made materials * 3:00 - 3:15 pm: Storytime **Wednesday** * 8:35 - 9:30 am: Registration and Early Morning Work (RWI) * 9:30 - 10:00 am: Maths Compare and order time * 10:50 - 11:00 am: Maths Continued * 11:00 - 12:00 pm: English Experience Day * 1:20 - 2:20 pm: Art - Drawing with detail - small objects * 2:15 - 3:00 pm: RE - To know what a Mezuzah reminds Jewish people about. * 3:00 - 3:15 pm: Storytime **Thursday** * 8:35 - 9:30 am: Registration and Early Morning Work (RWI) * 9:30 - 10:20 am: PE * 10:20 - 10:35 am: Singing Assembly * 1:50 - 2:20 pm: English Sentence Stack 6 * 2:20 - 3:00 pm: Maths Arithmetic Test * 3:00 - 3:15 pm: Storytime **Friday** * 8:35 - 10:35 am: Celebration Assembly * 10:35 - 11:40 am: English Sentence Stacking 7 * 11:40 - 12:00 pm: Maths Test Revision * 1:15 - 1:45 pm: Maths Test Revision * 1:45 - 2:35 pm: Catch Up Slot * 2:15 - 3:00 pm: Whole Class Comprehension + TTRS * 3:00 - 3:15 pm: Storytime The timetable outlines the daily schedule for Class 2EJ, including registration, lessons, breaks, and assemblies. The lessons cover various subjects such as Maths, English, Science, History, Computing, Music, Art, and RE. The timetable also includes test revisions and catch-up slots."
    try {
      // Define the expected structure using Zod schema
      const timeBlockSchema = z.object({
        startTime: z.string().describe('Start time in HH:MM format'),
        endTime: z.string().describe('End time in HH:MM format'),
        subject: z.string().describe('Subject or activity name'),
        location: z.string().optional().describe('Room or location'),
        notes: z.string().optional().describe('Additional notes'),
        teacherName: z.string().optional().describe('Teacher or instructor name'),
      });

      const timetableSchema = z.object({
        title: z.string().optional().describe('Timetable title'),
        schedule: z.object({
          monday: z.array(timeBlockSchema).optional(),
          tuesday: z.array(timeBlockSchema).optional(),
          wednesday: z.array(timeBlockSchema).optional(),
          thursday: z.array(timeBlockSchema).optional(),
          friday: z.array(timeBlockSchema).optional(),
          saturday: z.array(timeBlockSchema).optional(),
          sunday: z.array(timeBlockSchema).optional(),
        }),
      });

      const parser = StructuredOutputParser.fromZodSchema(timetableSchema);

      const prompt = PromptTemplate.fromTemplate(`
You are an expert text-to-JSON extractor.
You are specialized in parsing structured educational documents such as school timetables and schedules.

- Extract all time blocks for each day of the week.
- Format times as HH:MM (24-hour format, e.g., "09:00", "14:30").
- Identify subjects, locations (rooms), teacher names, and any additional notes.
- Group activities by day of the week (Monday through Sunday).
- If a day has no activities, include it as an empty array if necessary.
- Be thorough and extract all available information across all the days.
- Found “Registration and Early Morning work”, “Break”, “Lunch”, “Storytime” etc. add it to all the days. (Strickly)

**Example:**

**Input Markdown:**
\`\`\`
### Monday  
- 09:00-10:00: Mathematics (Room 101, Mr. X)  
- 10:15-11:15: Physics (Room 102)

### Tuesday  
- 09:00-10:00: English (Ms. Y)  

### Wednesday  
- 11:30-12:30: Break
\`\`\`

**Expected JSON Output:**
\`\`\`
{{
  "days":
      "Monday": [
        "time": "09:00-10:00", "subject": "Mathematics", "room": "Room 101", "teacher": "Mr. X" ,
        "time": "10:15-11:15", "subject": "Physics", "room": "Room 102", "teacher": "" ,
        "time": "11:30-12:30", "subject": "Break", "room": "", "teacher": "" ,
      ],
      "Tuesday": [
        "time": "09:00-10:00", "subject": "English", "room": "", "teacher": "Ms. Y" ,
        "time": "11:30-12:30", "subject": "Break", "room": "", "teacher": "" ,
      ],
      "Wednesday": [
        "time": "11:30-12:30", "subject": "Break", "room": "", "teacher": ""
      ]
}}
\`\`\`

**Input Markdown:**
{text}

**Expected JSON Output:**
{format_instructions}
`);

      const input = await prompt.format({
        text: extractedText,
        format_instructions: parser.getFormatInstructions(),
      });

      console.log('Requesting AI...');
      const response = await this.model.invoke(input);
      const parsed = await parser.parse(response.content as string);
      console.log('AI Parsed response successfully');
      return parsed;
    } catch (error) {
      console.error('Error in AI extraction:', error);

      // Fallback: Return a basic structure if AI extraction fails
      return {
        title: 'Extracted Timetable',
        schedule: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
        },
      };
    }
  }
}

