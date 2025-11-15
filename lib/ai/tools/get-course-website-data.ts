import { tool } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import { CourseWebsiteCrawlerAgent } from "@/agents/course-website-crawler-agent";

/**
 * Course Website Crawler tool for accessing course website information
 * 
 * This tool should be used when users ask about:
 * - Course syllabus, grading policies, course descriptions
 * - Course schedule, weekly topics, readings
 * - Office hours, instructor/TA availability
 * - Exam schedules, locations, formats (from course website)
 * - Lecture materials, slides, videos
 * - Course resources, textbooks, links
 * 
 * DATA SOURCE: Course websites (not Canvas)
 * - Canvas provides: assignments, grades, submissions, announcements
 * - Course websites provide: syllabus, detailed schedule, office hours, lecture materials, resources
 */
export const getCourseWebsiteData = ({ session }: { session: Session | null }) => tool({
	description: `Get information from course websites including syllabus, schedule, office hours, exams, lectures, and resources.
	
	Use this tool when users ask about:
	- Course syllabus, grading policies, course descriptions
	- Course schedule, weekly topics, readings, lecture schedule
	- Office hours, when instructors/TAs are available
	- Exam schedules, locations, formats (from course website, not Canvas)
	- Lecture materials, slides, videos, lecture notes
	- Course resources, textbooks, required materials, links
	
	This tool provides access to course website data (different from Canvas data).
	Always mention the data source: "from the course website" vs "from Canvas".
	
	Available courses: 10-601 (Machine Learning), 15-445 (Database Systems)`,
	inputSchema: z.object({
		courseId: z
			.string()
			.describe("Course ID or code (e.g., '10-601', '15-445')"),
		extractTypes: z
			.array(
				z.enum([
					"syllabus",
					"schedule",
					"lectures",
					"assignments",
					"resources",
					"officeHours",
					"exams",
				]),
			)
			.default(["syllabus", "schedule"])
			.describe("Types of information to extract from course website"),
		url: z
			.string()
			.optional()
			.describe("Optional URL of course website (if not provided, will use mock data for known courses)"),
	}),
	execute: async (input) => {
		try {
			// Get user ID from session (for future authentication)
			if (!session?.user?.id) {
				return {
					error: "User not authenticated. Please log in to access course website data.",
				};
			}

			// Determine URL - use provided URL or construct from course ID
			const url = input.url || `https://example.com/courses/${input.courseId}`;

			// Fetch data from CourseWebsiteCrawlerAgent
			const result = await CourseWebsiteCrawlerAgent.execute({
				urlOrHtml: url,
				courseId: input.courseId,
				extractTypes: input.extractTypes,
			});

			if (!result.success || !result.data) {
				return {
					error: result.error || "Failed to fetch course website data",
					source: "course website",
				};
			}

			const data = result.data;

			// Format response based on what was extracted
			const response: {
				source: string;
				courseId?: string;
				url?: string;
				syllabus?: any;
				schedule?: any;
				officeHours?: any;
				exams?: any;
				lectures?: any;
				assignments?: any;
				resources?: any;
			} = {
				source: "course website",
				courseId: data.courseId,
				url: data.url,
			};

			if (data.syllabus) {
				response.syllabus = {
					title: data.syllabus.title,
					description: data.syllabus.description,
					grading: data.syllabus.grading,
					policies: data.syllabus.policies,
				};
			}

			if (data.schedule) {
				response.schedule = data.schedule.map((s) => ({
					week: s.week,
					date: new Date(s.date).toLocaleDateString(),
					topic: s.topic,
					readings: s.readings,
					assignments: s.assignments,
				}));
			}

			if (data.officeHours) {
				response.officeHours = data.officeHours.map((oh) => ({
					instructor: oh.instructor,
					day: oh.day,
					time: oh.time,
					location: oh.location,
				}));
			}

			if (data.exams) {
				response.exams = data.exams.map((exam) => ({
					type: exam.type,
					date: new Date(exam.date).toLocaleDateString(),
					time: exam.time,
					location: exam.location,
					format: exam.format,
				}));
			}

			if (data.lectures) {
				response.lectures = data.lectures.map((l) => ({
					title: l.title,
					date: new Date(l.date).toLocaleDateString(),
					slidesUrl: l.slidesUrl,
					videoUrl: l.videoUrl,
				}));
			}

			if (data.assignments) {
				response.assignments = data.assignments.map((a) => ({
					title: a.title,
					dueDate: new Date(a.dueDate).toLocaleString(),
					description: a.description,
				}));
			}

			if (data.resources) {
				response.resources = data.resources.map((r) => ({
					type: r.type,
					title: r.title,
					url: r.url,
					description: r.description,
				}));
			}

			return response;
		} catch (error) {
			return {
				error:
					error instanceof Error
						? error.message
						: "An error occurred while fetching course website data",
				source: "course website",
			};
		}
	},
});

