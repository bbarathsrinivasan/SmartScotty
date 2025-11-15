import { tool } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import { CanvasAgent } from "@/agents/canvas-agent";

/**
 * Canvas tool for accessing course information, assignments, deadlines, and grades
 * 
 * This tool should be used when users ask about:
 * - Courses, assignments, homework, projects
 * - Deadlines, due dates, exams, quizzes
 * - Grades, submissions, academic progress
 * - Course announcements
 * - Academic schedule and workload
 */
export const getCanvasData = ({ session }: { session: Session | null }) => tool({
	description: `Get information about courses, assignments, deadlines, exams, quizzes, and grades from Canvas LMS.
	
	Use this tool when users ask about:
	- Their courses, assignments, homework, projects, exams, quizzes
	- Deadlines, due dates, what's due soon
	- Grades, submitted work, academic progress
	- Course announcements
	- Academic schedule, workload, what to work on next
	
	This tool provides access to the user's Canvas academic data. Always use this tool for academic/course-related queries.`,
	inputSchema: z.object({
		query: z
			.enum([
				"all_assignments",
				"pending_assignments",
				"submitted_assignments",
				"upcoming_deadlines",
				"exams",
				"quizzes",
				"courses",
				"announcements",
				"grades",
				"by_course",
				"next_deadline",
				"overview",
			])
			.describe(
				"Type of query: all_assignments, pending_assignments, submitted_assignments, upcoming_deadlines, exams, quizzes, courses, announcements, grades, by_course, next_deadline, or overview",
			),
		courseId: z
			.string()
			.optional()
			.describe("Optional course ID or code to filter results (e.g., '10-601', '12345')"),
		days: z
			.number()
			.optional()
			.describe("Number of days for upcoming deadlines query (default: 7)"),
		includeQuizzes: z.boolean().default(true).describe("Include quizzes in results"),
		includeExams: z.boolean().default(true).describe("Include exams in results"),
		includeAnnouncements: z.boolean().default(false).describe("Include announcements in results"),
	}),
	execute: async (input) => {
		try {
			// Get user ID from session
			if (!session?.user?.id) {
				return {
					error: "User not authenticated. Please log in to access Canvas data.",
				};
			}
			
			const userId = session.user.id;

			// Fetch data from CanvasAgent
			const result = await CanvasAgent.execute({
				userId,
				courseIds: input.courseId ? [input.courseId] : undefined,
				includeGrades: true,
				includeAnnouncements: input.includeAnnouncements,
				includeQuizzes: input.includeQuizzes,
				includeExams: input.includeExams,
			});

			if (!result.success || !result.data) {
				return {
					error: result.error || "Failed to fetch Canvas data",
				};
			}

			const { courses, assignments, announcements } = result.data;
			const now = new Date();
			const daysAhead = input.days || 7;
			const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

			// Process based on query type
			switch (input.query) {
				case "all_assignments": {
					return {
						assignments: assignments.map((a) => ({
							name: a.assignment_name,
							course: courses.find((c) => c.id === a.course_id)?.code || a.course_id,
							deadline: new Date(a.deadline).toLocaleString(),
							points: a.points,
							type: a.type,
							submitted: a.submitted,
							grade: a.grade,
							description: a.description,
						})),
						total: assignments.length,
					};
				}

				case "pending_assignments": {
					const pending = assignments.filter((a) => !a.submitted);
					return {
						assignments: pending.map((a) => ({
							name: a.assignment_name,
							course: courses.find((c) => c.id === a.course_id)?.code || a.course_id,
							deadline: new Date(a.deadline).toLocaleString(),
							points: a.points,
							type: a.type,
							description: a.description,
						})),
						total: pending.length,
					};
				}

				case "submitted_assignments": {
					const submitted = assignments.filter((a) => a.submitted);
					return {
						assignments: submitted.map((a) => ({
							name: a.assignment_name,
							course: courses.find((c) => c.id === a.course_id)?.code || a.course_id,
							deadline: new Date(a.deadline).toLocaleString(),
							points: a.points,
							grade: a.grade,
							type: a.type,
						})),
						total: submitted.length,
					};
				}

				case "upcoming_deadlines": {
					const upcoming = assignments
						.filter((a) => {
							const deadline = new Date(a.deadline);
							return deadline >= now && deadline <= futureDate && !a.submitted;
						})
						.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

					return {
						assignments: upcoming.map((a) => {
							const deadline = new Date(a.deadline);
							const hoursUntil = Math.ceil(
								(deadline.getTime() - now.getTime()) / (1000 * 60 * 60),
							);
							return {
								name: a.assignment_name,
								course: courses.find((c) => c.id === a.course_id)?.code || a.course_id,
								deadline: deadline.toLocaleString(),
								hoursUntil,
								points: a.points,
								type: a.type,
								description: a.description,
							};
						}),
						total: upcoming.length,
						days: daysAhead,
					};
				}

				case "exams": {
					const exams = assignments.filter((a) => a.type === "exam");
					return {
						exams: exams.map((a) => ({
							name: a.assignment_name,
							course: courses.find((c) => c.id === a.course_id)?.code || a.course_id,
							date: new Date(a.deadline).toLocaleString(),
							description: a.description,
						})),
						total: exams.length,
					};
				}

				case "quizzes": {
					const quizzes = assignments.filter((a) => a.type === "quiz");
					return {
						quizzes: quizzes.map((a) => ({
							name: a.assignment_name,
							course: courses.find((c) => c.id === a.course_id)?.code || a.course_id,
							deadline: new Date(a.deadline).toLocaleString(),
							points: a.points,
							description: a.description,
						})),
						total: quizzes.length,
					};
				}

				case "courses": {
					return {
						courses: courses.map((c) => ({
							code: c.code,
							name: c.name,
							semester: c.semester,
							instructor: c.instructor,
						})),
						total: courses.length,
					};
				}

				case "announcements": {
					if (!announcements) {
						return {
							announcements: [],
							total: 0,
							message: "No announcements available",
						};
					}
					return {
						announcements: announcements.map((a) => ({
							title: a.title,
							course: courses.find((c) => c.id === a.courseId)?.code || a.courseId,
							message: a.message,
							postedAt: new Date(a.postedAt).toLocaleString(),
						})),
						total: announcements.length,
					};
				}

				case "grades": {
					const graded = assignments.filter((a) => a.grade !== undefined);
					return {
						grades: graded.map((a) => ({
							name: a.assignment_name,
							course: courses.find((c) => c.id === a.course_id)?.code || a.course_id,
							points: a.points,
							grade: a.grade,
							percentage:
								a.points && a.grade !== undefined
									? ((a.grade / a.points) * 100).toFixed(1)
									: undefined,
						})),
						total: graded.length,
					};
				}

				case "by_course": {
					const byCourse: Record<string, typeof assignments> = {};
					assignments.forEach((a) => {
						const courseCode = courses.find((c) => c.id === a.course_id)?.code || a.course_id;
						if (!byCourse[courseCode]) {
							byCourse[courseCode] = [];
						}
						byCourse[courseCode].push(a);
					});

					return {
						byCourse: Object.entries(byCourse).map(([course, assignments]) => ({
							course,
							assignments: assignments.map((a) => ({
								name: a.assignment_name,
								deadline: new Date(a.deadline).toLocaleString(),
								points: a.points,
								type: a.type,
								submitted: a.submitted,
							})),
							total: assignments.length,
						})),
					};
				}

				case "next_deadline": {
					const pending = assignments
						.filter((a) => !a.submitted)
						.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

					if (pending.length === 0) {
						return {
							message: "No pending assignments",
						};
					}

					const next = pending[0];
					const deadline = new Date(next.deadline);
					const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

					return {
						assignment: {
							name: next.assignment_name,
							course: courses.find((c) => c.id === next.course_id)?.code || next.course_id,
							deadline: deadline.toLocaleString(),
							daysUntil,
							points: next.points,
							type: next.type,
							description: next.description,
						},
					};
				}

				case "overview": {
					const pending = assignments.filter((a) => !a.submitted).length;
					const submitted = assignments.filter((a) => a.submitted).length;
					const nextDeadline = assignments
						.filter((a) => !a.submitted)
						.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

					return {
						summary: {
							totalCourses: courses.length,
							totalAssignments: assignments.length,
							pending,
							submitted,
							exams: assignments.filter((a) => a.type === "exam").length,
							quizzes: assignments.filter((a) => a.type === "quiz").length,
						},
						nextDeadline: nextDeadline
							? {
									name: nextDeadline.assignment_name,
									course:
										courses.find((c) => c.id === nextDeadline.course_id)?.code ||
										nextDeadline.course_id,
									deadline: new Date(nextDeadline.deadline).toLocaleString(),
								}
							: null,
						courses: courses.map((c) => ({
							code: c.code,
							name: c.name,
						})),
					};
				}

				default:
					return {
						error: `Unknown query type: ${input.query}`,
					};
			}
		} catch (error) {
			return {
				error:
					error instanceof Error
						? error.message
						: "An error occurred while fetching Canvas data",
			};
		}
	},
});

