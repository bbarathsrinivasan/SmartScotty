# CourseWebsiteCrawlerAgent Chat Integration

## Overview

CourseWebsiteCrawlerAgent has been successfully integrated into the chat interface. The system now automatically detects course website-related queries and uses the CourseWebsiteCrawlerAgent to fetch data from course websites, distinguishing it from Canvas data.

## Data Source Distinction

The system now intelligently routes queries to the appropriate data source:

### Canvas (getCanvasData)
- **Source**: Canvas LMS
- **Data**: Assignments, grades, submissions, deadlines, announcements, enrolled courses
- **Use for**: "What's due?", "Show me my grades", "What assignments do I have?"

### Course Website (getCourseWebsiteData)
- **Source**: Course websites (e.g., course homepages, syllabus pages)
- **Data**: Syllabus, schedule, office hours, exam info, lecture materials, resources
- **Use for**: "Show me the syllabus", "When are office hours?", "What's the course schedule?"

## Available Courses

The following courses have mock data available for course website crawling:

1. **10-601: Introduction to Machine Learning**
   - Syllabus with grading policies
   - Weekly schedule with topics and readings
   - Office hours (Prof. Smith, TAs)
   - Exam schedules (Midterm and Final)
   - Lecture materials (slides and videos)
   - Course resources (textbooks, tutorials)

2. **15-445: Database Systems**
   - Syllabus with grading policies
   - Weekly schedule with topics and readings
   - Office hours (Prof. Jones, TAs)
   - Exam schedules (Midterm and Final)
   - Lecture materials (slides and videos)
   - Course resources (textbooks, documentation)

## Example Chat Prompts

### 📚 Syllabus Queries

```
Show me the syllabus for 10-601
```
```
What's the grading policy for Machine Learning?
```
```
Tell me about the course policies for Database Systems
```
```
What's the course description for 15-445?
```

### 📅 Schedule Queries

```
Show me the course schedule for 15-445
```
```
What topics are covered in week 3 of Machine Learning?
```
```
What readings are assigned for this week in 10-601?
```
```
Show me the weekly schedule for Database Systems
```
```
What's on the schedule for week 5?
```

### 🕐 Office Hours Queries

```
When are office hours for 10-601?
```
```
Show me TA office hours for Database Systems
```
```
Where is Prof. Smith's office hours?
```
```
What are the office hours for Machine Learning?
```
```
When can I meet with the instructor for 15-445?
```

### 📝 Exam Information Queries

```
When is the midterm exam for 15-445?
```
```
What's the format of the final exam for Machine Learning?
```
```
Show me exam locations and times for 10-601
```
```
When are the exams for Database Systems?
```
```
What's the date and location of the final exam?
```

### 📖 Lecture Materials Queries

```
Show me lecture slides for Machine Learning
```
```
Where can I find lecture videos for week 2?
```
```
List all lecture materials for Database Systems
```
```
Show me slides for 10-601 week 3
```
```
What lecture materials are available for 15-445?
```

### 📚 Resource Queries

```
What textbooks are required for 10-601?
```
```
Show me course resources for 15-445
```
```
What materials do I need for Machine Learning?
```
```
List all resources for Database Systems
```
```
What links and materials are available for the course?
```

### 🔍 Combined Queries

```
Show me everything about 10-601: syllabus, schedule, and office hours
```
```
Give me a complete overview of Database Systems course
```
```
What do I need to know about Machine Learning course?
```

## Response Format

The AI will always mention the data source in responses:

- ✅ "Here's the syllabus **from the course website** for 10-601..."
- ✅ "According to **Canvas**, you have 3 assignments due this week..."
- ✅ "**From the course website**, office hours are..."

This helps users understand where the information is coming from.

## Integration Details

### Files Modified

1. **`lib/ai/tools/get-course-website-data.ts`** (NEW)
   - Tool wrapper for CourseWebsiteCrawlerAgent
   - Handles course website data extraction
   - Formats responses with source attribution

2. **`app/(chat)/api/chat/route.ts`**
   - Added `getCourseWebsiteData` to tools
   - Added to `experimental_activeTools` array

3. **`lib/ai/prompts.ts`**
   - Updated system prompt with data source guidelines
   - Instructions for when to use Canvas vs course website
   - Examples of appropriate tool usage

4. **`lib/types.ts`**
   - Added `getCourseWebsiteData` to `ChatTools` type

## How It Works

1. **User asks course website question** (e.g., "Show me the syllabus for 10-601")
2. **AI detects intent** - System prompt identifies this as a course website query
3. **AI calls getCourseWebsiteData tool** - Automatically invokes with course ID and extract types
4. **Tool fetches data** - Uses CourseWebsiteCrawlerAgent to parse course website HTML
5. **AI responds** - Formats data and mentions "from the course website"

## Query Types Supported

The tool supports these extraction types:
- `syllabus` - Course description, grading, policies
- `schedule` - Weekly schedule with topics, readings, assignments
- `officeHours` - Instructor and TA office hours
- `exams` - Exam dates, times, locations, formats
- `lectures` - Lecture materials, slides, videos
- `assignments` - Assignment information from course website
- `resources` - Textbooks, links, course materials

## Future Enhancements

- Add more courses to the mock data
- Implement real course website fetching (replace mock HTML)
- Cache parsed results to avoid re-parsing
- Handle authentication for protected course websites
- Support multiple course website formats/platforms

