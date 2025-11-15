# PrioritizationAgent - Example Chat Prompts

These are example prompts you can use in the chat interface to interact with PrioritizationAgent and get task prioritization recommendations.

## 🎯 Basic Prioritization Queries

### Simple Prioritization Requests
```
Which assignment should I do first?
```
```
Help me prioritize my tasks
```
```
What should I work on next?
```
```
Rank my assignments by priority
```

### With Task List
```
Prioritize these tasks:
- Linear Regression HW: due in 3 days, 20 hours, difficulty 8
- Database Project: due in 7 days, 40 hours, difficulty 9
- Math Problem Set: due in 5 days, 10 hours, difficulty 6
```

## 📋 Integration with Canvas Data

### Automatic Prioritization from Canvas
```
Prioritize my assignments from Canvas
```
```
Which of my Canvas assignments should I do first?
```
```
Help me prioritize all my pending assignments
```

### Specific Course Prioritization
```
Prioritize my assignments for 10-601
```
```
What should I work on first for Machine Learning?
```
```
Rank my Database Systems assignments by priority
```

## 🔄 Combined Workflow Queries

### Full Prioritization Workflow
```
Get my assignments from Canvas, estimate their workload, and prioritize them
```
```
Show me my assignments, estimate how long each will take, and tell me what to do first
```

### With Workload Estimation
```
I have these assignments:
1. Implement linear regression - due in 2 days
2. Database project - due in 10 days  
3. Math homework - due in 5 days

Estimate the workload for each and prioritize them
```

## 📊 Detailed Prioritization Queries

### With Specific Details
```
Prioritize these:
- Task A: due tomorrow, 15 hours, difficulty 7
- Task B: due next week, 8 hours, difficulty 4
- Task C: due in 3 days, 25 hours, difficulty 9
```
```
Help me prioritize:
- Final Project: due 2024-12-10, 50 hours, difficulty 10
- Midterm Study: due 2024-11-05, 20 hours, difficulty 8
- Lab Assignment: due 2024-10-20, 5 hours, difficulty 3
```

### Priority Breakdown
```
Show me the priority breakdown for my tasks
```
```
Why is this task high priority? Show me the urgency, difficulty, and hours weights
```

## 🎓 Course-Specific Prioritization

### Single Course
```
Prioritize my Machine Learning assignments
```
```
What should I focus on for 15-445?
```
```
Rank my assignments for Database Systems by priority
```

### Multiple Courses
```
Prioritize all my assignments across all courses
```
```
What should I work on first across all my classes?
```

## ⚠️ Urgent Task Queries

### Overdue Tasks
```
Prioritize my tasks, including any overdue ones
```
```
What's most urgent right now?
```

### Time-Sensitive
```
I have 3 days. Prioritize what I should do
```
```
What should I focus on this week?
```

## 💡 Natural Language Variations

### Question Formats
```
What's the priority order for my assignments?
```
```
Which tasks are most important?
```
```
What order should I do these in?
```

### Request Formats
```
Can you help me prioritize my workload?
```
```
I need help deciding what to work on
```
```
Show me what to prioritize
```

## 🔗 Example Conversation Flows

### Flow 1: Canvas → Prioritization
**User**: "Show me my assignments"

**System**: *Fetches assignments from Canvas*

**User**: "Prioritize them for me"

**System**: *Estimates workload for each, then prioritizes and shows ranked list*

### Flow 2: Manual Task List
**User**: "I have these tasks:
- Project due in 2 days, 30 hours, difficulty 9
- Homework due in 5 days, 10 hours, difficulty 5
- Reading due in 1 week, 5 hours, difficulty 3
Prioritize them"

**System**: *Prioritizes and shows: Project first (highest priority), then Homework, then Reading*

### Flow 3: Workload + Prioritization
**User**: "Estimate workload for 'Implement a database system' and 'Solve calculus problems', then prioritize them"

**System**: *Estimates workload for both, then prioritizes based on deadlines, difficulty, and hours*

## 📝 Tips for Best Results

1. **Provide complete information**: Include deadline, estimated hours (or description for estimation), and difficulty score
2. **Use Canvas integration**: Ask to "prioritize my Canvas assignments" for automatic data fetching
3. **Be specific**: Mention course codes or assignment names for better context
4. **Ask for breakdown**: Request to see urgency, difficulty, and hours weights to understand priority scores

## 🎯 Expected Response Format

When you ask for prioritization, the system will return:

- **Ranked list** of tasks (highest priority first)
- **Priority score** for each task (sum of urgency + difficulty + hours weights)
- **Breakdown** showing:
  - Urgency weight (based on deadline proximity)
  - Difficulty weight (based on difficulty score)
  - Hours weight (based on estimated hours)
- **Summary** with highest and lowest priority tasks

Example response:
```
1. Linear Regression HW (Priority: 260)
   - Urgency: 90 (due in 1 day)
   - Difficulty: 90 (difficulty 9/10)
   - Hours: 80 (40 hours)

2. Database Project (Priority: 150)
   - Urgency: 30 (due in 7 days)
   - Difficulty: 80 (difficulty 8/10)
   - Hours: 40 (20 hours)
```

