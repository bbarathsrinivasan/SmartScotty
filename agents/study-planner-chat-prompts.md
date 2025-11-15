# StudyPlannerAgent Chat Integration - Example Prompts

## Overview

StudyPlannerAgent has been integrated into the chat interface. The system can now create optimized study schedules that:
- Split long tasks across multiple days
- Avoid busy hours
- Schedule tasks in priority order
- Generate weekly or daily plans

## Integration Details

### Tool: `getStudyPlan`

The tool accepts:
- `prioritized_tasks`: Array of tasks with deadlines, estimated hours, difficulty scores, and priority scores
- `availability`: Optional user availability schedule (uses defaults if not provided)
- `max_hours_per_day`: Maximum study hours per day (default: 6)
- `start_date`: Date to start planning from (default: today)
- `plan_type`: "weekly" or "daily" (default: "weekly")

### Tool Chain

For best results, chain tools in this order:
1. `getCanvasData` - Get assignments from Canvas
2. `getWorkloadEstimate` - Estimate workload for each assignment
3. `getPrioritization` - Prioritize tasks
4. `getStudyPlan` - Create study schedule

## Example Chat Prompts

### Basic Study Planning

1. **"Create a study schedule for my assignments"**
   - AI will: Get assignments from Canvas → Estimate workload → Prioritize → Create schedule

2. **"Plan my study time for this week"**
   - AI will: Get upcoming assignments → Create weekly study plan

3. **"When should I study for these tasks?"**
   - AI will: Create a schedule showing when to study each task

4. **"Help me schedule my assignments"**
   - AI will: Get assignments → Create optimized schedule

5. **"Create a weekly study plan"**
   - AI will: Get all assignments → Create 7-day study schedule

### With Specific Requirements

6. **"Create a study schedule, but I'm busy Monday 12-1pm"**
   - AI will: Create schedule avoiding the specified busy time

7. **"Plan my study time, I can only study 4 hours per day"**
   - AI will: Create schedule with max 4 hours per day

8. **"Create a study plan starting next Monday"**
   - AI will: Create schedule starting from the specified date

9. **"Give me a daily study plan for today"**
   - AI will: Create plan for just today (plan_type: "daily")

10. **"Schedule my assignments, I'm available 9am-5pm weekdays"**
    - AI will: Use the specified availability schedule

### Advanced Usage

11. **"I have these tasks: [list]. Create a study schedule"**
    - AI will: Use the provided tasks to create schedule

12. **"Prioritize my assignments and then create a study plan"**
    - AI will: First prioritize, then create schedule

13. **"What's my study schedule for the next 7 days?"**
    - AI will: Create weekly plan

14. **"Help me plan when to study for my exams"**
    - AI will: Get exams from Canvas → Create study schedule

15. **"Create a study schedule that splits my long assignments across multiple days"**
    - AI will: Automatically split long tasks (this is built-in)

### Integration with Other Tools

16. **"What assignments do I have? Then create a study schedule"**
    - AI will: Get assignments → Create schedule

17. **"Estimate the workload for my assignments, prioritize them, and create a study plan"**
    - AI will: Chain all three tools

18. **"Show me my upcoming deadlines, then plan my study time"**
    - AI will: Get deadlines → Create schedule

19. **"What's due this week? Create a study schedule for those assignments"**
    - AI will: Get week's assignments → Create schedule

20. **"Prioritize my tasks and schedule them for this week"**
    - AI will: Prioritize → Create weekly schedule

## Expected Behavior

### Automatic Features

- **Task Splitting**: Long tasks (> max_hours_per_day) are automatically split across multiple days
- **Busy Hour Avoidance**: Study blocks never overlap with busy hours
- **Priority Ordering**: Higher priority tasks get better time slots
- **Default Availability**: If no availability provided, uses:
  - Monday-Friday: 9:00-17:00 (8 hours)
  - Saturday-Sunday: 10:00-16:00 (6 hours)

### Output Format

The tool returns:
- `study_blocks`: Array of study blocks with task_id, day, start_time, duration
- `blocks_by_day`: Blocks grouped by day for easier display
- `summary`: Total blocks, hours, days covered, average hours per day

## Example Response Format

```
Here's your study schedule for the week:

**Monday (2025-11-18) - 6.0 hours**
- 09:00-12:00 (3h): Urgent Hard Long Task
- 13:00-16:00 (3h): Urgent Hard Long Task

**Tuesday (2025-11-19) - 4.0 hours**
- 10:00-11:00 (1h): Urgent Hard Long Task
- 11:00-14:00 (3h): Medium Task

**Summary:**
- Total Study Blocks: 10
- Total Hours: 37.0
- Days Covered: 7
- Average Hours Per Day: 5.3
```

## Notes

- The tool works best when tasks have been prioritized first
- Long tasks are automatically split (no need to specify)
- Busy hours are automatically avoided (no need to specify)
- Default availability is used if none provided
- Can generate weekly (7 days) or daily (1 day) plans

