# TartanOptimus Agent System

A modular agent system for CMU productivity and study assistance. Each agent is designed to work standalone first, then be chainable with other agents.

## Structure

- `types.ts` - Shared types and interfaces for all agents
- `logger.ts` - Structured logging utility for agent behavior tracking
- `index.ts` - Central export point for all agents
- Individual agent modules (9 agents total)

## Agents

### 1. CanvasAgent
Fetches assignments, grades, and announcements from Canvas LMS.

**Purpose**: Integrates with CMU's Canvas learning management system.

### 2. CourseWebsiteCrawlerAgent
Crawls course websites to extract syllabus, schedule, lectures, assignments, and resources.

**Purpose**: Automatically extracts information from CMU course websites.

### 3. WorkloadEstimatorAgent
Estimates time and effort required for tasks based on type, difficulty, and user profile.

**Purpose**: Helps users plan their workload by estimating task complexity.

### 4. PrioritizationAgent
Prioritizes tasks based on deadlines, importance, dependencies, and user preferences.

**Purpose**: Helps users focus on the most critical tasks first.

### 5. StudyPlannerAgent
Creates optimized study schedules balancing coursework, breaks, and personal time.

**Purpose**: Generates study plans that account for deadlines, workload, and preferences.

### 6. CalendarAgent
Manages calendar events, scheduling, conflict detection, and available time slot finding.

**Purpose**: Handles all calendar operations and synchronization.

### 7. MeetingCoordinatorAgent
Coordinates group meetings by finding common availability and scheduling optimal times.

**Purpose**: Facilitates group study sessions and project meetings.

### 8. LearningAgent (Anti-AIV)
Learns from user behavior and preferences to continuously improve recommendations.

**Purpose**: Observes patterns and personalizes the assistant's behavior over time.

### 9. SafetySupervisorAgent
Monitors agent behavior, validates outputs, and ensures safety constraints are met.

**Purpose**: Acts as a safety layer ensuring agents operate within defined constraints.

## Usage

Each agent follows a consistent interface:

```typescript
import { CanvasAgent } from "@/agents";

const result = await CanvasAgent.execute({
  userId: "user-123",
  includeGrades: true,
});

if (result.success) {
  console.log(result.data);
}
```

## Design Principles

1. **Structured Inputs**: All agents use Zod schemas for input validation
2. **Structured Outputs**: All agents return typed, validated outputs
3. **Logging**: All agents log their behavior for testing and debugging
4. **Standalone First**: Each agent works independently
5. **Chainable Later**: Agents can be composed together for complex workflows

## Current Status

All agents are currently implemented with mock data. They return immediately with sample data matching their output schemas. This allows for:

- Testing the interface structure
- Validating input/output schemas
- Developing agent chaining logic
- Building UI components

## Next Steps

1. Implement real logic for each agent
2. Add integration with external APIs (Canvas, calendar systems, etc.)
3. Build agent chaining/orchestration system
4. Add comprehensive testing
5. Implement persistent storage for learning agent

