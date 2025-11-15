# CanvasAgent Chat Integration

## Overview

CanvasAgent has been successfully integrated into the chat interface. The system now automatically detects academic/course-related queries and uses the CanvasAgent to fetch real data instead of saying "I don't have access."

## What Was Changed

### 1. Created Canvas Tool (`lib/ai/tools/get-canvas-data.ts`)
- Tool that wraps CanvasAgent for use in chat
- Handles various query types: assignments, deadlines, exams, quizzes, courses, grades, etc.
- Automatically gets userId from session
- Returns formatted, user-friendly responses

### 2. Updated Chat Route (`app/(chat)/api/chat/route.ts`)
- Added `getCanvasData` to the tools list
- Added to `experimental_activeTools` array
- Tool is now available for the AI to call

### 3. Updated System Prompt (`lib/ai/prompts.ts`)
- Added instructions to ALWAYS use `getCanvasData` for academic queries
- Provides examples of when to use the tool
- Prevents the AI from saying "I don't have access"

### 4. Updated Types (`lib/types.ts`)
- Added `getCanvasData` to `ChatTools` type
- Ensures TypeScript types are correct

## How It Works

1. **User asks academic question** (e.g., "What's due this week?")
2. **AI detects intent** - System prompt instructs AI to recognize academic queries
3. **AI calls getCanvasData tool** - Automatically invokes the tool with appropriate query type
4. **Tool fetches data** - Uses CanvasAgent to get data from Canvas (currently mocked)
5. **AI responds** - Formats the data into a helpful response

## Query Types Supported

The tool supports these query types:
- `all_assignments` - All assignments
- `pending_assignments` - Not yet submitted
- `submitted_assignments` - Already submitted
- `upcoming_deadlines` - Due in next N days
- `exams` - All exams
- `quizzes` - All quizzes
- `courses` - Course list
- `announcements` - Course announcements
- `grades` - Assignment grades
- `by_course` - Grouped by course
- `next_deadline` - Next upcoming deadline
- `overview` - Complete summary

## Example Chat Interactions

**User**: "What's due in the next 3 days?"
**AI**: *Calls getCanvasData with query: "upcoming_deadlines", days: 3*
**Response**: Lists assignments due in next 3 days

**User**: "When are my exams?"
**AI**: *Calls getCanvasData with query: "exams"*
**Response**: Lists all exams with dates

**User**: "Show me my courses"
**AI**: *Calls getCanvasData with query: "courses"*
**Response**: Lists all enrolled courses

## Testing

The integration is ready to test. Try these prompts in chat:
- "What's due this week?"
- "When are my exams?"
- "Show me my assignments"
- "What courses am I taking?"
- "What's my next deadline?"

## Next Steps

1. **Real Canvas API Integration**: Replace mock data with actual Canvas API calls
2. **User Authentication**: Ensure userId is properly passed from session
3. **Error Handling**: Add better error messages for API failures
4. **Caching**: Consider caching Canvas data to reduce API calls

