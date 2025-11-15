# TartanOptimus

An intelligent CMU productivity and study assistant powered by a modular agent system. TartanOptimus helps students manage coursework, plan study time, get educational guidance, and maintain academic integrity.

## 🎯 Overview

TartanOptimus is built with a modular agent architecture where each agent has a specific purpose and can work standalone or be chained together for complex workflows. The system emphasizes:

- **Academic Integrity**: Strict Anti-AIV (Anti-Academic Integrity Violation) enforcement
- **Educational Focus**: Provides guidance, hints, and concepts instead of solutions
- **Intelligent Planning**: Automatically prioritizes tasks and creates optimized study schedules
- **Comprehensive Data**: Integrates Canvas LMS and course website data

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Chat Interface (Next.js)                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              AI SDK (Vercel AI)                     │  │
│  │  - Streaming responses                               │  │
│  │  - Tool calling                                      │  │
│  │  - Message handling                                  │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐            ┌─────────▼──────────┐
│  Agent System  │            │   Database (PG)     │
│                │            │  - Users            │
│  ┌──────────┐  │            │  - Chats            │
│  │ Canvas   │  │            │  - Messages         │
│  │ Agent    │  │            │  - Documents        │
│  └──────────┘  │            └─────────────────────┘
│  ┌──────────┐  │
│  │ Course   │  │
│  │ Website  │  │
│  │ Crawler  │  │
│  └──────────┘  │
│  ┌──────────┐  │
│  │ Workload │  │
│  │ Estimator│  │
│  └──────────┘  │
│  ┌──────────┐  │
│  │Priority  │  │
│  │ Agent    │  │
│  └──────────┘  │
│  ┌──────────┐  │
│  │ Study    │  │
│  │ Planner  │  │
│  └──────────┘  │
│  ┌──────────┐  │
│  │ Learning │  │
│  │ Agent    │  │
│  │(Anti-AIV)│  │
│  └──────────┘  │
│  ┌──────────┐  │
│  │ Safety   │  │
│  │Supervisor│  │
│  └──────────┘  │
└────────────────┘
```

### Agent Architecture

Each agent follows a consistent structure:

```typescript
type Agent<Input, Output> = {
  name: string;
  description: string;
  execute(input: Input): Promise<AgentResult<Output>>;
}
```

**Key Principles:**
- **Structured Inputs**: Zod schemas for validation
- **Structured Outputs**: Typed, validated responses
- **Logging**: All agents log behavior for debugging
- **Standalone First**: Each agent works independently
- **Chainable**: Agents can be composed for complex workflows

## 🤖 Agents

### 1. CanvasAgent

**Purpose**: Fetches assignments, grades, deadlines, exams, and announcements from Canvas LMS.

**Key Functions:**
- `execute(input)` - Fetches Canvas data
- `testCanvasAgent()` - Test function

**Input:**
- `userId`: User identifier
- `courseIds`: Optional course filter
- `includeGrades`, `includeAnnouncements`, etc.

**Output:**
- Normalized assignments with course_id, assignment_name, deadline, description, points
- Quizzes, exams, announcements
- Course information

**Chat Tool**: `getCanvasData`

**Example Prompts:**
- "What's due this week?"
- "Show me my assignments"
- "What's my next deadline?"

---

### 2. CourseWebsiteCrawlerAgent

**Purpose**: Crawls course websites to extract syllabus, schedule, lectures, assignments, office hours, exams, and resources.

**Key Functions:**
- `crawl(urlOrHtml, courseId)` - Parses HTML content
- `execute(input)` - Extracts course website data
- `testCrawlerAgent()` - Test function

**Input:**
- `urlOrHtml`: URL or HTML text
- `courseId`: Course identifier
- `extractTypes`: Types of data to extract

**Output:**
- Syllabus (title, description, grading, policies)
- Schedule (weekly topics, readings, assignments)
- Office hours (instructor, TA availability)
- Exams (dates, times, locations, formats)
- Lectures (materials, slides, videos)
- Resources (textbooks, links, materials)

**Chat Tool**: `getCourseWebsiteData`

**Available Courses**: 10-601 (Machine Learning), 15-445 (Database Systems)

**Example Prompts:**
- "Show me the syllabus for 10-601"
- "When are office hours for Machine Learning?"
- "What's the exam schedule for 15-445?"

---

### 3. WorkloadEstimatorAgent

**Purpose**: Estimates time and effort required for assignments based on description analysis.

**Key Functions:**
- `estimate(assignment_description)` - Rule-based workload estimation
- `execute(input)` - Agent execution
- `testWorkloadEstimator()` - Test function

**Input:**
- `assignment_description`: Text description of assignment

**Output:**
- `estimated_hours`: Total hours needed
- `difficulty_score`: 1-10 difficulty rating
- `task_type_breakdown`: Hours by type (reading/coding/math)
- `recommended_split`: Hours per day distribution

**Chat Tool**: `getWorkloadEstimate`

**Example Prompts:**
- "How much time will this assignment take? [description]"
- "What's the workload for implementing linear regression?"
- "How difficult is this project?"

---

### 4. PrioritizationAgent

**Purpose**: Prioritizes tasks based on deadlines, difficulty, and estimated hours.

**Key Functions:**
- `prioritize(tasks)` - Calculates priority scores
- `execute(input)` - Agent execution
- `testPrioritizationAgent()` - Test function

**Input:**
- `tasks`: Array of tasks with deadline, estimated_hours, difficulty_score

**Output:**
- `prioritizedTasks`: Sorted by priority_score
- Each task includes: priority_score, urgency_weight, difficulty_weight, hours_weight

**Priority Formula**: `priority_score = urgency_weight + difficulty_weight + hours_weight`

**Chat Tool**: `getPrioritization`

**Example Prompts:**
- "Which assignment should I do first?"
- "Help me prioritize my tasks"
- "Rank my assignments by priority"

---

### 5. StudyPlannerAgent

**Purpose**: Creates optimized study schedules that split long tasks across days and avoid busy hours.

**Key Functions:**
- `generateDailyPlan(day, tasks, availability, maxHoursPerDay)` - Daily schedule
- `generateWeeklyPlan(tasks, availability, maxHoursPerDay, startDate)` - Weekly schedule
- `execute(input)` - Agent execution
- `testStudyPlannerAgent()` - Test function

**Input:**
- `prioritized_tasks`: Tasks to schedule
- `availability`: User availability schedule (optional)
- `max_hours_per_day`: Maximum study hours (default: 6)

**Output:**
- `study_blocks`: Array of {task_id, day, start_time, duration}
- `summary`: Total blocks, hours, days covered

**Features:**
- Automatically splits long tasks (> max_hours_per_day) across multiple days
- Avoids busy hours
- Schedules tasks in priority order

**Chat Tool**: `getStudyPlan`

**Example Prompts:**
- "Create a study schedule for my assignments"
- "Plan my study time for this week"
- "Schedule my assignments, I'm available 9am-5pm weekdays"

---

### 6. LearningAgent (Anti-AIV)

**Purpose**: Provides educational guidance (hints, concepts, questions) while strictly refusing solutions, answers, or code.

**Key Functions:**
- `guide(question, course_context, user_attempt)` - Main guidance function
- `execute(input)` - Agent execution
- `testLearningAgent()` - Test function

**Input:**
- `question`: Student's question
- `course_context`: Optional course information
- `user_attempt`: What user has tried

**Output:**
- `guidance`: Hints, concepts, guiding questions, thought process
- `anti_aiv_enforcement`: Refusal status and reason
- `next_steps`: Suggested intermediate steps

**Anti-AIV Rules:**
- ❌ NO solutions
- ❌ NO final code
- ❌ NO direct numeric answers
- ❌ NO step-by-step solutions
- ❌ NO MCQ answers (even if user insists)
- ✅ ONLY hints, concepts, questions, thought processes

**Chat Tool**: `getLearningGuidance`

**Example Prompts:**
- "I'm trying to understand overfitting. Can you explain?"
- "What's the answer to this MCQ? A) ... B) ..." (will refuse)
- "I'm stuck on implementing linear regression. I've tried using numpy but I'm getting errors."

---

### 7. SafetySupervisorAgent

**Purpose**: Monitors and enforces Anti-AIV rules on agent outputs, rewriting violations into educational guidance.

**Key Functions:**
- `enforce(response_text, agent_name, source_context)` - Main enforcement function
- `execute(input)` - Agent execution
- `testSafetyAgent()` - Test function

**Input:**
- `response_text`: Response to analyze
- `agent_name`: Optional agent name
- `source_context`: Optional context

**Output:**
- `violation_detected`: Whether violation found
- `violation_type`: Type of violation (solution/answer/code/step_by_step/numeric)
- `rewritten_text`: Educational guidance version
- `guiding_question`: Always included

**Detects:**
- Direct solutions
- Assignment answers (including MCQ)
- Full code implementations
- Step-by-step solutions
- Numeric answers

**Chat Tool**: `getSafetySupervision`

**Example Prompts:**
- "Check if this response is safe: [response with solution]"
- "Analyze this response for violations: [response text]"
- "Rewrite this to be educational: [response with code]"

---

### 8. CalendarAgent (Placeholder)

**Purpose**: Manages calendar events, scheduling, conflict detection, and available time slot finding.

**Status**: Placeholder implementation

---

### 9. MeetingCoordinatorAgent (Placeholder)

**Purpose**: Coordinates group meetings by finding common availability and scheduling optimal times.

**Status**: Placeholder implementation

---

## 🔄 Agent Chaining

Agents can be chained together for complex workflows:

### Example Workflow 1: Complete Assignment Planning

```
CanvasAgent → WorkloadEstimatorAgent → PrioritizationAgent → StudyPlannerAgent
```

**Prompt**: "Create a study schedule for my assignments"

**Flow**:
1. Get assignments from Canvas
2. Estimate workload for each
3. Prioritize by urgency, difficulty, hours
4. Create optimized study schedule

### Example Workflow 2: Exam Preparation

```
CourseWebsiteCrawlerAgent → CanvasAgent → PrioritizationAgent → StudyPlannerAgent
```

**Prompt**: "I have an exam next week. Help me prepare."

**Flow**:
1. Get exam schedule from course website
2. Get related assignments from Canvas
3. Prioritize study tasks
4. Create exam prep schedule

### Example Workflow 3: Learning Support

```
CanvasAgent → LearningAgent → SafetySupervisorAgent
```

**Prompt**: "I'm working on a linear regression assignment. Help me understand the concepts."

**Flow**:
1. Get assignment details from Canvas
2. Provide educational guidance (no solutions)
3. Safety supervisor ensures no violations

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI SDK**: Vercel AI SDK
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Linting/Formatting**: Biome (Ultracite)
- **Validation**: Zod

---

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add AUTH_SECRET and POSTGRES_URL

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

---

## 🧪 Testing

### Test Individual Agents

```bash
# Test CanvasAgent
npx tsx -e "import { testCanvasAgent } from './agents'; testCanvasAgent();"

# Test WorkloadEstimatorAgent
npx tsx -e "import { testWorkloadEstimator } from './agents'; testWorkloadEstimator();"

# Test PrioritizationAgent
npx tsx -e "import { testPrioritizationAgent } from './agents'; testPrioritizationAgent();"

# Test StudyPlannerAgent
npx tsx -e "import { testStudyPlannerAgent } from './agents'; testStudyPlannerAgent();"

# Test LearningAgent
npx tsx -e "import { testLearningAgent } from './agents'; testLearningAgent();"

# Test SafetySupervisorAgent
npx tsx -e "import { testSafetyAgent } from './agents'; testSafetyAgent();"
```

### Test Complete Flow

See `agents/TEST_FLOW_COMPLETE.md` for comprehensive test prompts.

---

## 📚 Documentation

- **Chat Prompts**: `agents/CHAT_PROMPTS_README.md` - Complete reference of all chat prompts
- **Test Flow**: `agents/TEST_FLOW_COMPLETE.md` - End-to-end test flow
- **Mock Data**: `agents/MOCK_DATA_DOCUMENTATION.md` - All mock data used
- **Agent Details**: `agents/README.md` - Individual agent documentation

---

## 🔒 Academic Integrity

TartanOptimus is designed with strict Anti-AIV (Anti-Academic Integrity Violation) enforcement:

- **LearningAgent**: Never provides solutions, answers, or code - only guidance
- **SafetySupervisorAgent**: Monitors all outputs and rewrites violations
- **Educational Focus**: All responses promote learning through hints and concepts

---

## 🚀 Features

- ✅ Canvas LMS integration (mock data)
- ✅ Course website crawling (mock data)
- ✅ Workload estimation
- ✅ Task prioritization
- ✅ Study schedule generation
- ✅ Educational guidance (Anti-AIV)
- ✅ Safety supervision
- ✅ Chat interface integration
- ✅ Tool chaining
- ✅ Comprehensive logging

---

## 📝 License

[Your License Here]

---

## 🤝 Contributing

[Contributing Guidelines]

---

## 📧 Contact

[Contact Information]
