import { z } from "zod";
import type { Agent, AgentResult, Assignment, Course } from "./types";
import { agentLogger } from "./logger";

/**
 * CanvasAgent - Fetches assignments, grades, and announcements from Canvas LMS
 *
 * Purpose: Integrates with CMU's Canvas learning management system to retrieve
 * course information, assignments, exams, quizzes, grades, and announcements for the user.
 *
 * REAL API INTEGRATION NOTES:
 * - Replace mockCanvasApiResponse() with actual Canvas API calls using fetch/axios
 * - Use Canvas API endpoints:
 *   - GET /api/v1/users/self/courses for courses
 *   - GET /api/v1/courses/:course_id/assignments for assignments
 *   - GET /api/v1/courses/:course_id/quizzes for quizzes
 *   - GET /api/v1/courses/:course_id/calendar_events for exams/events
 *   - GET /api/v1/courses/:course_id/announcements for announcements
 * - Add OAuth2 authentication with Canvas API token
 * - Handle pagination for large result sets
 * - Implement rate limiting and error retry logic
 */

/**
 * Normalized assignment structure - consistent format regardless of source type
 */
export const normalizedAssignmentSchema = z.object({
	course_id: z.string(),
	assignment_name: z.string(),
	deadline: z.string(), // ISO 8601 format
	description: z.string().optional(),
	points: z.number().optional(),
	type: z.enum(["assignment", "quiz", "exam", "project", "discussion", "other"]),
	submission_type: z.string().optional(), // e.g., "online_upload", "online_quiz"
	submitted: z.boolean(),
	grade: z.number().optional(),
	graded: z.boolean().optional(),
	lock_at: z.string().optional(), // When assignment locks
	unlock_at: z.string().optional(), // When assignment unlocks
	url: z.string().optional(), // Canvas URL for the assignment
});

export type NormalizedAssignment = z.infer<typeof normalizedAssignmentSchema>;

/**
 * Canvas API response structure (mock representation of actual Canvas API)
 */
const canvasApiAssignmentSchema = z.object({
	id: z.number(),
	course_id: z.number(),
	name: z.string(),
	description: z.string().nullable().optional(),
	due_at: z.string().nullable().optional(),
	points_possible: z.number().nullable().optional(),
	submission_types: z.array(z.string()).optional(),
	has_submitted_submissions: z.boolean().optional(),
	submission: z
		.object({
			submitted_at: z.string().optional(),
			score: z.number().nullable().optional(),
			workflow_state: z.string().optional(),
		})
		.optional(),
	lock_at: z.string().nullable().optional(),
	unlock_at: z.string().nullable().optional(),
	html_url: z.string().optional(),
	assignment_group_id: z.number().optional(),
});

const canvasApiQuizSchema = z.object({
	id: z.number(),
	title: z.string(),
	description: z.string().nullable().optional(),
	due_at: z.string().nullable().optional(),
	points_possible: z.number().nullable().optional(),
	quiz_type: z.string().optional(),
	html_url: z.string().optional(),
	course_id: z.number().optional(),
});

const canvasApiCalendarEventSchema = z.object({
	id: z.number(),
	title: z.string(),
	description: z.string().nullable().optional(),
	start_at: z.string().nullable().optional(),
	end_at: z.string().nullable().optional(),
	context_code: z.string().optional(), // e.g., "course_12345"
});

const canvasApiCourseSchema = z.object({
	id: z.number(),
	name: z.string(),
	course_code: z.string().optional(),
	term: z
		.object({
			name: z.string().optional(),
		})
		.optional(),
	teachers: z
		.array(
			z.object({
				display_name: z.string().optional(),
			}),
		)
		.optional(),
});

const canvasApiResponseSchema = z.object({
	courses: z.array(canvasApiCourseSchema),
	assignments: z.array(canvasApiAssignmentSchema),
	quizzes: z.array(canvasApiQuizSchema).optional(),
	calendar_events: z.array(canvasApiCalendarEventSchema).optional(),
	announcements: z
		.array(
			z.object({
				id: z.number(),
				title: z.string(),
				message: z.string().optional(),
				posted_at: z.string().optional(),
				context_code: z.string().optional(),
			}),
		)
		.optional(),
});

type CanvasApiResponse = z.infer<typeof canvasApiResponseSchema>;

const canvasAgentInputSchema = z.object({
	userId: z.string(),
	courseIds: z.array(z.string()).optional(),
	includeGrades: z.boolean().default(true),
	includeAnnouncements: z.boolean().default(false),
	includeQuizzes: z.boolean().default(true),
	includeExams: z.boolean().default(true),
});

const canvasAgentOutputSchema = z.object({
	courses: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			code: z.string(),
			semester: z.string(),
			instructor: z.string().optional(),
		}),
	),
	assignments: z.array(normalizedAssignmentSchema),
	announcements: z
		.array(
			z.object({
				id: z.string(),
				courseId: z.string(),
				title: z.string(),
				message: z.string(),
				postedAt: z.string(),
			}),
		)
		.optional(),
});

export type CanvasAgentInput = z.infer<typeof canvasAgentInputSchema>;
export type CanvasAgentOutput = z.infer<typeof canvasAgentOutputSchema>;

/**
 * Mock Canvas API response - simulates actual Canvas API structure
 * REAL API: Replace this with actual fetch calls to Canvas API endpoints
 */
function mockCanvasApiResponse(
	userId: string,
	courseIds?: string[],
): CanvasApiResponse {
	// Sample comprehensive Canvas API response
	return {
		courses: [
			{
				id: 12345,
				name: "Introduction to Machine Learning",
				course_code: "10-601",
				term: {
					name: "Fall 2024",
				},
				teachers: [
					{
						display_name: "Prof. Smith",
					},
				],
			},
			{
				id: 12346,
				name: "Database Systems",
				course_code: "15-445",
				term: {
					name: "Fall 2024",
				},
				teachers: [
					{
						display_name: "Prof. Jones",
					},
				],
			},
			{
				id: 12347,
				name: "Computer Systems",
				course_code: "15-213",
				term: {
					name: "Fall 2024",
				},
				teachers: [
					{
						display_name: "Prof. Bryant",
					},
				],
			},
		],
		assignments: [
			{
				id: 1001,
				course_id: 12345,
				name: "Homework 1: Linear Regression",
				description: "Implement linear regression from scratch. Submit your code and a brief report.",
				due_at: "2024-10-15T23:59:59Z",
				points_possible: 100,
				submission_types: ["online_upload"],
				has_submitted_submissions: false,
				html_url: "https://canvas.cmu.edu/courses/12345/assignments/1001",
			},
			{
				id: 1002,
				course_id: 12345,
				name: "Midterm Exam",
				description: "In-person exam covering chapters 1-5",
				due_at: "2024-10-25T14:00:00Z",
				points_possible: 200,
				submission_types: ["on_paper"],
				has_submitted_submissions: false,
				html_url: "https://canvas.cmu.edu/courses/12345/assignments/1002",
			},
			{
				id: 1003,
				course_id: 12346,
				name: "Project 1: SQL Queries",
				description: "Write complex SQL queries for a sample database. See project spec for details.",
				due_at: "2024-10-20T23:59:59Z",
				points_possible: 150,
				submission_types: ["online_upload"],
				has_submitted_submissions: true,
				submission: {
					submitted_at: "2024-10-19T18:30:00Z",
					score: 142,
					workflow_state: "graded",
				},
				html_url: "https://canvas.cmu.edu/courses/12346/assignments/1003",
			},
			{
				id: 1004,
				course_id: 12346,
				name: "Final Project",
				description: null, // Missing description - should be handled gracefully
				due_at: "2024-12-10T23:59:59Z",
				points_possible: 300,
				submission_types: ["online_upload", "online_text_entry"],
				has_submitted_submissions: false,
				html_url: "https://canvas.cmu.edu/courses/12346/assignments/1004",
			},
			{
				id: 1005,
				course_id: 12347,
				name: "Lab 3: Memory Management",
				description: "Implement malloc and free functions",
				due_at: "2024-10-18T23:59:59Z",
				points_possible: 50,
				submission_types: ["online_upload"],
				has_submitted_submissions: false,
				lock_at: "2024-10-18T23:59:59Z",
				unlock_at: "2024-10-10T00:00:00Z",
				html_url: "https://canvas.cmu.edu/courses/12347/assignments/1005",
			},
		],
		quizzes: [
			{
				id: 2001,
				title: "Quiz 1: Machine Learning Basics",
				description: "Multiple choice quiz covering lecture material",
				due_at: "2024-10-12T23:59:59Z",
				points_possible: 50,
				quiz_type: "assignment",
				course_id: 12345,
				html_url: "https://canvas.cmu.edu/courses/12345/quizzes/2001",
			},
			{
				id: 2002,
				title: "Weekly Quiz 5",
				description: null,
				due_at: "2024-10-22T23:59:59Z",
				points_possible: 25,
				quiz_type: "practice_quiz",
				course_id: 12346,
				html_url: "https://canvas.cmu.edu/courses/12346/quizzes/2002",
			},
		],
		calendar_events: [
			{
				id: 3001,
				title: "Midterm Exam - Database Systems",
				description: "In-person exam in Wean 5409",
				start_at: "2024-11-05T14:00:00Z",
				end_at: "2024-11-05T16:00:00Z",
				context_code: "course_12346",
			},
			{
				id: 3002,
				title: "Final Exam - Machine Learning",
				description: "Comprehensive final exam",
				start_at: "2024-12-15T09:00:00Z",
				end_at: "2024-12-15T12:00:00Z",
				context_code: "course_12345",
			},
		],
		announcements: [
			{
				id: 4001,
				title: "Office Hours Changed",
				message: "Office hours moved to Tuesday 2-4pm this week",
				posted_at: "2024-10-10T10:00:00Z",
				context_code: "course_12345",
			},
			{
				id: 4002,
				title: "Project Extension",
				message: "Project 1 deadline extended by 2 days due to technical issues",
				posted_at: "2024-10-18T15:30:00Z",
				context_code: "course_12346",
			},
		],
	};
}

/**
 * Normalizes a Canvas assignment to our standard format
 * Handles missing fields gracefully with sensible defaults
 */
function normalizeAssignment(
	assignment: z.infer<typeof canvasApiAssignmentSchema>,
	courseId: string,
): NormalizedAssignment {
	return {
		course_id: courseId,
		assignment_name: assignment.name || "Untitled Assignment",
		deadline: assignment.due_at || new Date().toISOString(), // Default to now if missing
		description: assignment.description || undefined,
		points: assignment.points_possible ?? undefined,
		type: "assignment",
		submission_type: assignment.submission_types?.join(", ") || undefined,
		submitted: assignment.has_submitted_submissions || false,
		grade: assignment.submission?.score ?? undefined,
		graded: assignment.submission?.workflow_state === "graded",
		lock_at: assignment.lock_at || undefined,
		unlock_at: assignment.unlock_at || undefined,
		url: assignment.html_url || undefined,
	};
}

/**
 * Normalizes a Canvas quiz to our standard format
 */
function normalizeQuiz(
	quiz: z.infer<typeof canvasApiQuizSchema>,
	courseId: string,
): NormalizedAssignment {
	return {
		course_id: courseId,
		assignment_name: quiz.title || "Untitled Quiz",
		deadline: quiz.due_at || new Date().toISOString(),
		description: quiz.description || undefined,
		points: quiz.points_possible ?? undefined,
		type: quiz.quiz_type === "assignment" ? "quiz" : "quiz",
		submission_type: "online_quiz",
		submitted: false, // Quizzes need separate submission check
		url: quiz.html_url || undefined,
	};
}

/**
 * Normalizes a Canvas calendar event (exam) to our standard format
 */
function normalizeExam(
	event: z.infer<typeof canvasApiCalendarEventSchema>,
	courseId: string,
): NormalizedAssignment {
	// Extract course ID from context_code if available (format: "course_12345")
	const extractedCourseId =
		event.context_code?.replace("course_", "") || courseId;

	return {
		course_id: extractedCourseId,
		assignment_name: event.title || "Untitled Exam",
		deadline: event.start_at || event.end_at || new Date().toISOString(),
		description: event.description || undefined,
		points: undefined, // Exams may not have points in calendar events
		type: "exam",
		submission_type: "in_person",
		submitted: false,
		url: undefined,
	};
}

/**
 * Fetches data from Canvas API
 * REAL API: Replace with actual API calls
 */
async function fetchCanvasData(
	userId: string,
	courseIds?: string[],
): Promise<CanvasApiResponse> {
	// REAL API IMPLEMENTATION:
	// const canvasApiToken = process.env.CANVAS_API_TOKEN;
	// const canvasBaseUrl = "https://canvas.cmu.edu/api/v1";
	//
	// const headers = {
	//   Authorization: `Bearer ${canvasApiToken}`,
	// };
	//
	// // Fetch courses
	// const coursesResponse = await fetch(`${canvasBaseUrl}/users/self/courses`, { headers });
	// const courses = await coursesResponse.json();
	//
	// // Fetch assignments for each course
	// const assignmentsPromises = courses.map(course =>
	//   fetch(`${canvasBaseUrl}/courses/${course.id}/assignments`, { headers })
	// );
	// const assignmentsResponses = await Promise.all(assignmentsPromises);
	// const assignmentsArrays = await Promise.all(assignmentsResponses.map(r => r.json()));
	// const assignments = assignmentsArrays.flat();
	//
	// // Similar for quizzes, calendar_events, announcements
	// // Handle pagination with Link headers
	//
	// return { courses, assignments, quizzes, calendar_events, announcements };

	// Mock implementation
	return mockCanvasApiResponse(userId, courseIds);
}

export const CanvasAgent: Agent<CanvasAgentInput, AgentResult<CanvasAgentOutput>> = {
	name: "CanvasAgent",
	description:
		"Fetches assignments, grades, and announcements from Canvas LMS for CMU courses",

	async execute(input: CanvasAgentInput): Promise<AgentResult<CanvasAgentOutput>> {
		agentLogger.logStart("CanvasAgent", input);

		try {
			// Validate input
			const validatedInput = canvasAgentInputSchema.parse(input);

			// Fetch data from Canvas API (currently mocked)
			const canvasData = await fetchCanvasData(
				validatedInput.userId,
				validatedInput.courseIds,
			);

			// Normalize courses
			const courses = canvasData.courses.map((course) => ({
				id: course.id.toString(),
				name: course.name,
				code: course.course_code || "N/A",
				semester: course.term?.name || "Unknown",
				instructor: course.teachers?.[0]?.display_name || undefined,
			}));

			// Normalize assignments
			const normalizedAssignments: NormalizedAssignment[] = [];

			// Process regular assignments
			for (const assignment of canvasData.assignments) {
				normalizedAssignments.push(
					normalizeAssignment(assignment, assignment.course_id.toString()),
				);
			}

			// Process quizzes if included
			if (validatedInput.includeQuizzes && canvasData.quizzes) {
				for (const quiz of canvasData.quizzes) {
					const courseId = quiz.course_id?.toString() || "unknown";
					normalizedAssignments.push(normalizeQuiz(quiz, courseId));
				}
			}

			// Process exams/calendar events if included
			if (validatedInput.includeExams && canvasData.calendar_events) {
				for (const event of canvasData.calendar_events) {
					// Extract course ID from context_code or use first course as fallback
					const courseId =
						event.context_code?.replace("course_", "") || courses[0]?.id || "unknown";
					normalizedAssignments.push(normalizeExam(event, courseId));
				}
			}

			// Normalize announcements if included
			const announcements = validatedInput.includeAnnouncements
				? canvasData.announcements?.map((announcement) => {
						const courseId =
							announcement.context_code?.replace("course_", "") || courses[0]?.id || "unknown";
						return {
							id: announcement.id.toString(),
							courseId,
							title: announcement.title,
							message: announcement.message || "No message",
							postedAt: announcement.posted_at || new Date().toISOString(),
						};
					})
				: undefined;

			const output: CanvasAgentOutput = {
				courses,
				assignments: normalizedAssignments,
				announcements,
			};

			agentLogger.logSuccess("CanvasAgent", output);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "CanvasAgent",
				message: `Successfully fetched ${normalizedAssignments.length} assignments from ${courses.length} courses`,
				data: output,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			agentLogger.logError("CanvasAgent", errorMessage, { input });

			return {
				success: false,
				timestamp: new Date().toISOString(),
				agentName: "CanvasAgent",
				error: errorMessage,
			};
		}
	},
};

/**
 * Test function for CanvasAgent
 * Prints formatted results to console
 */
export async function testCanvasAgent(): Promise<void> {
	console.log("=".repeat(80));
	console.log("Testing CanvasAgent");
	console.log("=".repeat(80));
	console.log();

	const testInput: CanvasAgentInput = {
		userId: "test-user-123",
		includeGrades: true,
		includeAnnouncements: true,
		includeQuizzes: true,
		includeExams: true,
	};

	console.log("Input:", JSON.stringify(testInput, null, 2));
	console.log();

	const result = await CanvasAgent.execute(testInput);

	if (result.success && result.data) {
		console.log("✅ CanvasAgent executed successfully!");
		console.log();
		console.log("Courses:", result.data.courses.length);
		result.data.courses.forEach((course) => {
			console.log(`  - ${course.code}: ${course.name} (${course.semester})`);
			if (course.instructor) {
				console.log(`    Instructor: ${course.instructor}`);
			}
		});
		console.log();

		console.log("Assignments:", result.data.assignments.length);
		result.data.assignments.forEach((assignment) => {
			console.log(`  - [${assignment.type.toUpperCase()}] ${assignment.assignment_name}`);
			console.log(`    Course: ${assignment.course_id}`);
			console.log(`    Deadline: ${new Date(assignment.deadline).toLocaleString()}`);
			if (assignment.points) {
				console.log(`    Points: ${assignment.points}`);
			}
			if (assignment.description) {
				console.log(`    Description: ${assignment.description.substring(0, 60)}...`);
			}
			console.log(`    Submitted: ${assignment.submitted ? "Yes" : "No"}`);
			if (assignment.grade !== undefined) {
				console.log(`    Grade: ${assignment.grade}`);
			}
			console.log();
		});

		if (result.data.announcements && result.data.announcements.length > 0) {
			console.log("Announcements:", result.data.announcements.length);
			result.data.announcements.forEach((announcement) => {
				console.log(`  - ${announcement.title}`);
				console.log(`    Course: ${announcement.courseId}`);
				console.log(`    Posted: ${new Date(announcement.postedAt).toLocaleString()}`);
				console.log(`    Message: ${announcement.message.substring(0, 60)}...`);
				console.log();
			});
		}

		console.log("Summary:");
		console.log(`  Total courses: ${result.data.courses.length}`);
		console.log(`  Total assignments: ${result.data.assignments.length}`);
		console.log(
			`  Submitted: ${result.data.assignments.filter((a) => a.submitted).length}`,
		);
		console.log(
			`  Pending: ${result.data.assignments.filter((a) => !a.submitted).length}`,
		);
		if (result.data.announcements) {
			console.log(`  Announcements: ${result.data.announcements.length}`);
		}
	} else {
		console.log("❌ CanvasAgent execution failed!");
		console.log("Error:", result.error);
	}

	console.log();
	console.log("=".repeat(80));
}

