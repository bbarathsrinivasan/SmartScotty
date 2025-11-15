# Mock Data Documentation

This document provides a comprehensive overview of all mock/dummy data used in the TartanOptimus agent system. This data is used for development and testing purposes before real API integrations are implemented.

---

## 📚 Table of Contents

1. [CanvasAgent Mock Data](#canvasagent-mock-data)
2. [CourseWebsiteCrawlerAgent Mock Data](#coursewebsitecrawleragent-mock-data)
3. [Data Structure Overview](#data-structure-overview)

---

## CanvasAgent Mock Data

**Location**: `agents/canvas-agent.ts` - `mockCanvasApiResponse()` function

### Courses (3 courses)

#### Course 1: Introduction to Machine Learning
- **ID**: 12345
- **Code**: 10-601
- **Name**: Introduction to Machine Learning
- **Term**: Fall 2024
- **Instructor**: Prof. Smith

#### Course 2: Database Systems
- **ID**: 12346
- **Code**: 15-445
- **Name**: Database Systems
- **Term**: Fall 2024
- **Instructor**: Prof. Jones

#### Course 3: Computer Systems
- **ID**: 12347
- **Code**: 15-213
- **Name**: Computer Systems
- **Term**: Fall 2024
- **Instructor**: Prof. Bryant

### Assignments (5 assignments)

#### Assignment 1: Homework 1: Linear Regression
- **ID**: 1001
- **Course ID**: 12345 (10-601)
- **Name**: Homework 1: Linear Regression
- **Description**: "Implement linear regression from scratch. Submit your code and a brief report."
- **Due Date**: 2024-10-15T23:59:59Z
- **Points**: 100
- **Submission Type**: online_upload
- **Status**: Not submitted
- **URL**: https://canvas.cmu.edu/courses/12345/assignments/1001

#### Assignment 2: Midterm Exam
- **ID**: 1002
- **Course ID**: 12345 (10-601)
- **Name**: Midterm Exam
- **Description**: "In-person exam covering chapters 1-5"
- **Due Date**: 2024-10-25T14:00:00Z
- **Points**: 200
- **Submission Type**: on_paper
- **Status**: Not submitted
- **URL**: https://canvas.cmu.edu/courses/12345/assignments/1002

#### Assignment 3: Project 1: SQL Queries
- **ID**: 1003
- **Course ID**: 12346 (15-445)
- **Name**: Project 1: SQL Queries
- **Description**: "Write complex SQL queries for a sample database. See project spec for details."
- **Due Date**: 2024-10-20T23:59:59Z
- **Points**: 150
- **Submission Type**: online_upload
- **Status**: Submitted (Graded: 142/150)
- **Submitted At**: 2024-10-19T18:30:00Z
- **URL**: https://canvas.cmu.edu/courses/12346/assignments/1003

#### Assignment 4: Final Project
- **ID**: 1004
- **Course ID**: 12346 (15-445)
- **Name**: Final Project
- **Description**: null (Missing - tests graceful handling)
- **Due Date**: 2024-12-10T23:59:59Z
- **Points**: 300
- **Submission Type**: online_upload, online_text_entry
- **Status**: Not submitted
- **URL**: https://canvas.cmu.edu/courses/12346/assignments/1004

#### Assignment 5: Lab 3: Memory Management
- **ID**: 1005
- **Course ID**: 12347 (15-213)
- **Name**: Lab 3: Memory Management
- **Description**: "Implement malloc and free functions"
- **Due Date**: 2024-10-18T23:59:59Z
- **Points**: 50
- **Submission Type**: online_upload
- **Status**: Not submitted
- **Lock At**: 2024-10-18T23:59:59Z
- **Unlock At**: 2024-10-10T00:00:00Z
- **URL**: https://canvas.cmu.edu/courses/12347/assignments/1005

### Quizzes (2 quizzes)

#### Quiz 1: Machine Learning Basics
- **ID**: 2001
- **Course ID**: 12345 (10-601)
- **Title**: Quiz 1: Machine Learning Basics
- **Description**: "Multiple choice quiz covering lecture material"
- **Due Date**: 2024-10-12T23:59:59Z
- **Points**: 50
- **Type**: assignment
- **URL**: https://canvas.cmu.edu/courses/12345/quizzes/2001

#### Quiz 2: Weekly Quiz 5
- **ID**: 2002
- **Course ID**: 12346 (15-445)
- **Title**: Weekly Quiz 5
- **Description**: null (Missing - tests graceful handling)
- **Due Date**: 2024-10-22T23:59:59Z
- **Points**: 25
- **Type**: practice_quiz
- **URL**: https://canvas.cmu.edu/courses/12346/quizzes/2002

### Calendar Events (2 exams)

#### Event 1: Midterm Exam - Database Systems
- **ID**: 3001
- **Title**: Midterm Exam - Database Systems
- **Description**: "In-person exam in Wean 5409"
- **Start**: 2024-11-05T14:00:00Z
- **End**: 2024-11-05T16:00:00Z
- **Context**: course_12346 (15-445)

#### Event 2: Final Exam - Machine Learning
- **ID**: 3002
- **Title**: Final Exam - Machine Learning
- **Description**: "Comprehensive final exam"
- **Start**: 2024-12-15T09:00:00Z
- **End**: 2024-12-15T12:00:00Z
- **Context**: course_12345 (10-601)

### Announcements (2 announcements)

#### Announcement 1: Office Hours Changed
- **ID**: 4001
- **Title**: Office Hours Changed
- **Message**: "Office hours moved to Tuesday 2-4pm this week"
- **Posted At**: 2024-10-10T10:00:00Z
- **Context**: course_12345 (10-601)

#### Announcement 2: Project Extension
- **ID**: 4002
- **Title**: Project Extension
- **Message**: "Project 1 deadline extended by 2 days due to technical issues"
- **Posted At**: 2024-10-18T15:30:00Z
- **Context**: course_12346 (15-445)

---

## CourseWebsiteCrawlerAgent Mock Data

**Location**: `agents/course-website-crawler-agent.ts` - `getMockHtmlForCourse()` function

### Course 1: 10-601 - Introduction to Machine Learning

#### Syllabus
- **Title**: Course Description
- **Description**: "This course provides a broad introduction to machine learning, covering supervised learning, unsupervised learning, and reinforcement learning. Topics include linear regression, classification, neural networks, and deep learning."
- **Grading Policy**:
  - Homework: 40%
  - Midterm Exam: 30%
  - Final Exam: 30%
- **Course Policies**:
  - Late submissions: -10% per day, maximum 3 days late
  - Academic integrity: All work must be your own
  - Collaboration: Discussion allowed, but code must be written independently

#### Office Hours
| Instructor | Day | Time | Location |
|------------|-----|------|----------|
| Prof. Smith | Tuesday | 2:00 PM - 4:00 PM | GHC 5001 |
| TA: Alice | Wednesday | 10:00 AM - 12:00 PM | GHC 5002 |
| TA: Bob | Thursday | 3:00 PM - 5:00 PM | GHC 5003 |

#### Course Schedule
| Week | Date | Topic | Readings | Assignments |
|------|------|-------|----------|-------------|
| 1 | 2024-09-01 | Introduction to ML | Chapter 1, 2 | |
| 2 | 2024-09-08 | Linear Regression | Chapter 3 | HW1 assigned |
| 3 | 2024-09-15 | Classification | Chapter 4 | HW1 due |
| 4 | 2024-09-22 | Neural Networks | Chapter 5 | HW2 assigned |
| 5 | 2024-09-29 | Deep Learning | Chapter 6 | HW2 due |

#### Exams
- **Midterm Exam**: October 25, 2024, 2:00 PM - 4:00 PM, Location: Wean 5409, Format: In-person
- **Final Exam**: December 15, 2024, 9:00 AM - 12:00 PM, Location: TBA, Format: In-person

#### Assignments (from course website)
- **Homework 1: Linear Regression** - Due: 2024-09-15 23:59 - Implement linear regression from scratch
- **Homework 2: Classification** - Due: 2024-09-29 23:59 - Build a classification model
- **Project: Final Project** - Due: 2024-12-10 23:59 - Apply ML to a real-world problem

#### Lectures
- **Lecture 1** (2024-09-01): [Slides](https://example.com/10601/lecture1.pdf) | [Video](https://example.com/10601/lecture1.mp4)
- **Lecture 2** (2024-09-08): [Slides](https://example.com/10601/lecture2.pdf)
- **Lecture 3** (2024-09-15): [Slides](https://example.com/10601/lecture3.pdf)

#### Resources
- **Textbook**: [Introduction to Machine Learning](https://example.com/textbook-ml) - Required reading
- **Python Tutorial**: [Python for ML](https://example.com/python-tutorial) - Recommended for beginners
- **Course GitHub**: [Course Repository](https://github.com/cmu-10601) - Code examples and assignments

---

### Course 2: 15-445 - Database Systems

#### Syllabus
- **Title**: Course Description
- **Description**: "This course covers the fundamentals of database systems, including data models, query languages, storage systems, transaction processing, and distributed databases."
- **Grading Policy**:
  - Projects: 50%
  - Midterm Exam: 25%
  - Final Exam: 25%
- **Course Policies**:
  - Late submissions: -5% per hour, maximum 24 hours late
  - Academic integrity: Zero tolerance for cheating
  - Projects: Must be completed individually

#### Office Hours
| Instructor | Day | Time | Location |
|------------|-----|------|----------|
| Prof. Jones | Monday | 1:00 PM - 3:00 PM | GHC 6001 |
| TA: Charlie | Tuesday | 11:00 AM - 1:00 PM | GHC 6002 |
| TA: Diana | Friday | 2:00 PM - 4:00 PM | GHC 6003 |

#### Course Schedule
| Week | Date | Topic | Readings | Assignments |
|------|------|-------|----------|-------------|
| 1 | 2024-09-01 | Introduction to Databases | Chapter 1 | |
| 2 | 2024-09-08 | SQL Queries | Chapter 2, 3 | Project 1 assigned |
| 3 | 2024-09-15 | Relational Algebra | Chapter 4 | |
| 4 | 2024-09-22 | Storage Systems | Chapter 5 | Project 1 due, Project 2 assigned |
| 5 | 2024-09-29 | Indexing | Chapter 6 | |

#### Exams
- **Midterm Exam**: November 5, 2024, 2:00 PM - 4:00 PM, Location: Wean 5409, Format: In-person
- **Final Exam**: December 18, 2024, 2:00 PM - 5:00 PM, Location: TBA, Format: In-person

#### Assignments (from course website)
- **Project 1: SQL Queries** - Due: 2024-10-20 23:59 - Write complex SQL queries for a sample database
- **Project 2: Buffer Pool** - Due: 2024-11-10 23:59 - Implement a buffer pool manager
- **Final Project: Database System** - Due: 2024-12-10 23:59 - Build a complete database system

#### Lectures
- **Lecture 1** (2024-09-01): [Slides](https://example.com/15445/lecture1.pdf)
- **Lecture 2** (2024-09-08): [Slides](https://example.com/15445/lecture2.pdf) | [Video](https://example.com/15445/lecture2.mp4)
- **Lecture 3** (2024-09-15): [Slides](https://example.com/15445/lecture3.pdf)

#### Resources
- **Textbook**: [Database Systems: The Complete Book](https://example.com/textbook-db) - Required
- **PostgreSQL Docs**: [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Reference
- **Course Materials**: [Course Website](https://example.com/15445/materials) - All course materials

---

## Data Structure Overview

### CanvasAgent Data Structure

```typescript
{
  courses: [
    {
      id: number,
      name: string,
      course_code: string,
      term: { name: string },
      teachers: [{ display_name: string }]
    }
  ],
  assignments: [
    {
      id: number,
      course_id: number,
      name: string,
      description: string | null,
      due_at: string | null,
      points_possible: number | null,
      submission_types: string[],
      has_submitted_submissions: boolean,
      submission?: {
        submitted_at: string,
        score: number | null,
        workflow_state: string
      },
      lock_at: string | null,
      unlock_at: string | null,
      html_url: string
    }
  ],
  quizzes: [
    {
      id: number,
      title: string,
      description: string | null,
      due_at: string | null,
      points_possible: number | null,
      quiz_type: string,
      course_id: number,
      html_url: string
    }
  ],
  calendar_events: [
    {
      id: number,
      title: string,
      description: string | null,
      start_at: string | null,
      end_at: string | null,
      context_code: string
    }
  ],
  announcements: [
    {
      id: number,
      title: string,
      message: string,
      posted_at: string,
      context_code: string
    }
  ]
}
```

### CourseWebsiteCrawlerAgent Data Structure

The mock data is provided as HTML strings that are parsed to extract:

```typescript
{
  courseId: string,
  url: string,
  syllabus?: {
    title: string,
    description: string,
    grading: string,
    policies: string[]
  },
  schedule?: [
    {
      week: number,
      date: string,
      topic: string,
      readings: string[],
      assignments: string[]
    }
  ],
  officeHours?: [
    {
      instructor: string,
      day: string,
      time: string,
      location: string
    }
  ],
  exams?: [
    {
      type: string,
      date: string,
      time: string,
      location: string,
      format: string
    }
  ],
  lectures?: [
    {
      id: string,
      title: string,
      date: string,
      slidesUrl: string,
      videoUrl: string
    }
  ],
  assignments?: [
    {
      id: string,
      title: string,
      dueDate: string,
      description: string
    }
  ],
  resources?: [
    {
      type: string,
      title: string,
      url: string,
      description: string
    }
  ]
}
```

---

## Notes

1. **Missing Fields**: Some mock data intentionally includes `null` or missing fields to test graceful error handling (e.g., Assignment 4 has no description, Quiz 2 has no description).

2. **Date Formats**: 
   - Canvas data uses ISO 8601 format: `2024-10-15T23:59:59Z`
   - Course website HTML uses various formats that are parsed to ISO 8601

3. **URLs**: All URLs in mock data use `example.com` or `canvas.cmu.edu` as placeholders.

4. **Real API Integration**: When implementing real APIs:
   - Replace `mockCanvasApiResponse()` with actual Canvas API calls
   - Replace `getMockHtmlForCourse()` with actual HTTP requests to course websites
   - Add authentication/authorization
   - Handle pagination, rate limiting, and errors

5. **Data Consistency**: The same courses appear in both Canvas and course website data (10-601 and 15-445) to demonstrate data from different sources.

---

## Summary Statistics

- **Total Courses**: 3 (Canvas) / 2 (Course Website)
- **Total Assignments**: 5 (Canvas) / 6 (Course Website)
- **Total Quizzes**: 2 (Canvas)
- **Total Exams**: 2 (Canvas Calendar Events) / 4 (Course Website)
- **Total Announcements**: 2 (Canvas)
- **Total Office Hours**: 6 entries (3 per course)
- **Total Lectures**: 6 entries (3 per course)
- **Total Resources**: 6 entries (3 per course)

