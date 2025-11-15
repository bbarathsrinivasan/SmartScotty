import { z } from "zod";
import type { Agent, AgentResult } from "./types";
import { agentLogger } from "./logger";

/**
 * CourseWebsiteCrawlerAgent - Crawls course websites for syllabus, schedule, and resources
 *
 * Purpose: Automatically extracts information from CMU course websites including
 * syllabus, schedule, lecture notes, assignments, office hours, and exam information.
 *
 * DATA SOURCE STRATEGY:
 * - CanvasAgent handles: Assignment submissions, grades, Canvas announcements, calendar events
 * - CourseWebsiteCrawlerAgent handles: Syllabus, detailed schedule, lecture materials,
 *   office hours, exam schedules, course resources, assignment descriptions from course website
 *
 * REAL API INTEGRATION NOTES:
 * - Replace mock HTML with actual fetch() calls to course website URLs
 * - Handle different course website structures (CMU uses various platforms)
 * - Implement retry logic for failed requests
 * - Cache parsed results to avoid re-parsing
 * - Handle authentication if course websites require login
 */

const courseWebsiteCrawlerInputSchema = z.object({
	urlOrHtml: z.string().describe("URL of course website or raw HTML text content"),
	courseId: z.string().optional(),
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
		.default(["syllabus", "schedule"]),
});

const courseWebsiteCrawlerOutputSchema = z.object({
	courseId: z.string().optional(),
	url: z.string(),
	syllabus: z
		.object({
			title: z.string(),
			description: z.string(),
			grading: z.string().optional(),
			policies: z.array(z.string()).optional(),
		})
		.optional(),
	schedule: z
		.array(
			z.object({
				week: z.number(),
				date: z.string(),
				topic: z.string(),
				readings: z.array(z.string()).optional(),
				assignments: z.array(z.string()).optional(),
			}),
		)
		.optional(),
	lectures: z
		.array(
			z.object({
				id: z.string(),
				title: z.string(),
				date: z.string(),
				slidesUrl: z.string().optional(),
				videoUrl: z.string().optional(),
			}),
		)
		.optional(),
	assignments: z
		.array(
			z.object({
				id: z.string(),
				title: z.string(),
				dueDate: z.string(),
				description: z.string().optional(),
			}),
		)
		.optional(),
	officeHours: z
		.array(
			z.object({
				instructor: z.string(),
				day: z.string(),
				time: z.string(),
				location: z.string().optional(),
			}),
		)
		.optional(),
	exams: z
		.array(
			z.object({
				type: z.string(), // e.g., "Midterm", "Final"
				date: z.string(),
				time: z.string().optional(),
				location: z.string().optional(),
				format: z.string().optional(), // e.g., "In-person", "Online"
			}),
		)
		.optional(),
	resources: z
		.array(
			z.object({
				type: z.string(),
				title: z.string(),
				url: z.string(),
				description: z.string().optional(),
			}),
		)
		.optional(),
});

export type CourseWebsiteCrawlerInput = z.infer<
	typeof courseWebsiteCrawlerInputSchema
>;
export type CourseWebsiteCrawlerOutput = z.infer<
	typeof courseWebsiteCrawlerOutputSchema
>;

/**
 * Mock HTML data for course websites
 * REAL API: Replace with actual fetch() calls to course website URLs
 */
function getMockHtmlForCourse(courseId?: string): string {
	// Course 1: Machine Learning (10-601)
	if (courseId === "10-601" || courseId === "course-1" || !courseId) {
		return `
<!DOCTYPE html>
<html>
<head><title>10-601: Introduction to Machine Learning</title></head>
<body>
	<h1>10-601: Introduction to Machine Learning</h1>
	<h2>Syllabus</h2>
	<div class="syllabus">
		<h3>Course Description</h3>
		<p>This course provides a broad introduction to machine learning, covering supervised learning, unsupervised learning, and reinforcement learning. Topics include linear regression, classification, neural networks, and deep learning.</p>
		
		<h3>Grading Policy</h3>
		<ul>
			<li>Homework: 40%</li>
			<li>Midterm Exam: 30%</li>
			<li>Final Exam: 30%</li>
		</ul>
		
		<h3>Course Policies</h3>
		<ul>
			<li>Late submissions: -10% per day, maximum 3 days late</li>
			<li>Academic integrity: All work must be your own</li>
			<li>Collaboration: Discussion allowed, but code must be written independently</li>
		</ul>
	</div>
	
	<h2>Office Hours</h2>
	<table>
		<tr><th>Instructor</th><th>Day</th><th>Time</th><th>Location</th></tr>
		<tr><td>Prof. Smith</td><td>Tuesday</td><td>2:00 PM - 4:00 PM</td><td>GHC 5001</td></tr>
		<tr><td>TA: Alice</td><td>Wednesday</td><td>10:00 AM - 12:00 PM</td><td>GHC 5002</td></tr>
		<tr><td>TA: Bob</td><td>Thursday</td><td>3:00 PM - 5:00 PM</td><td>GHC 5003</td></tr>
	</table>
	
	<h2>Course Schedule</h2>
	<table>
		<tr><th>Week</th><th>Date</th><th>Topic</th><th>Readings</th><th>Assignments</th></tr>
		<tr><td>1</td><td>2024-09-01</td><td>Introduction to ML</td><td>Chapter 1, 2</td><td></td></tr>
		<tr><td>2</td><td>2024-09-08</td><td>Linear Regression</td><td>Chapter 3</td><td>HW1 assigned</td></tr>
		<tr><td>3</td><td>2024-09-15</td><td>Classification</td><td>Chapter 4</td><td>HW1 due</td></tr>
		<tr><td>4</td><td>2024-09-22</td><td>Neural Networks</td><td>Chapter 5</td><td>HW2 assigned</td></tr>
		<tr><td>5</td><td>2024-09-29</td><td>Deep Learning</td><td>Chapter 6</td><td>HW2 due</td></tr>
	</table>
	
	<h2>Exams</h2>
	<ul>
		<li><strong>Midterm Exam:</strong> October 25, 2024, 2:00 PM - 4:00 PM, Location: Wean 5409, Format: In-person</li>
		<li><strong>Final Exam:</strong> December 15, 2024, 9:00 AM - 12:00 PM, Location: TBA, Format: In-person</li>
	</ul>
	
	<h2>Assignments</h2>
	<ul>
		<li><strong>Homework 1: Linear Regression</strong> - Due: 2024-09-15 23:59 - Implement linear regression from scratch</li>
		<li><strong>Homework 2: Classification</strong> - Due: 2024-09-29 23:59 - Build a classification model</li>
		<li><strong>Project: Final Project</strong> - Due: 2024-12-10 23:59 - Apply ML to a real-world problem</li>
	</ul>
	
	<h2>Lectures</h2>
	<ul>
		<li>Lecture 1 (2024-09-01): <a href="https://example.com/10601/lecture1.pdf">Slides</a> | <a href="https://example.com/10601/lecture1.mp4">Video</a></li>
		<li>Lecture 2 (2024-09-08): <a href="https://example.com/10601/lecture2.pdf">Slides</a></li>
		<li>Lecture 3 (2024-09-15): <a href="https://example.com/10601/lecture3.pdf">Slides</a></li>
	</ul>
	
	<h2>Resources</h2>
	<ul>
		<li><strong>Textbook:</strong> <a href="https://example.com/textbook-ml">Introduction to Machine Learning</a> - Required reading</li>
		<li><strong>Python Tutorial:</strong> <a href="https://example.com/python-tutorial">Python for ML</a> - Recommended for beginners</li>
		<li><strong>Course GitHub:</strong> <a href="https://github.com/cmu-10601">Course Repository</a> - Code examples and assignments</li>
	</ul>
</body>
</html>
		`;
	}

	// Course 2: Database Systems (15-445)
	if (courseId === "15-445" || courseId === "course-2") {
		return `
<!DOCTYPE html>
<html>
<head><title>15-445: Database Systems</title></head>
<body>
	<h1>15-445: Database Systems</h1>
	<h2>Syllabus</h2>
	<div class="syllabus">
		<h3>Course Description</h3>
		<p>This course covers the fundamentals of database systems, including data models, query languages, storage systems, transaction processing, and distributed databases.</p>
		
		<h3>Grading Policy</h3>
		<ul>
			<li>Projects: 50%</li>
			<li>Midterm Exam: 25%</li>
			<li>Final Exam: 25%</li>
		</ul>
		
		<h3>Course Policies</h3>
		<ul>
			<li>Late submissions: -5% per hour, maximum 24 hours late</li>
			<li>Academic integrity: Zero tolerance for cheating</li>
			<li>Projects: Must be completed individually</li>
		</ul>
	</div>
	
	<h2>Office Hours</h2>
	<table>
		<tr><th>Instructor</th><th>Day</th><th>Time</th><th>Location</th></tr>
		<tr><td>Prof. Jones</td><td>Monday</td><td>1:00 PM - 3:00 PM</td><td>GHC 6001</td></tr>
		<tr><td>TA: Charlie</td><td>Tuesday</td><td>11:00 AM - 1:00 PM</td><td>GHC 6002</td></tr>
		<tr><td>TA: Diana</td><td>Friday</td><td>2:00 PM - 4:00 PM</td><td>GHC 6003</td></tr>
	</table>
	
	<h2>Course Schedule</h2>
	<table>
		<tr><th>Week</th><th>Date</th><th>Topic</th><th>Readings</th><th>Assignments</th></tr>
		<tr><td>1</td><td>2024-09-01</td><td>Introduction to Databases</td><td>Chapter 1</td><td></td></tr>
		<tr><td>2</td><td>2024-09-08</td><td>SQL Queries</td><td>Chapter 2, 3</td><td>Project 1 assigned</td></tr>
		<tr><td>3</td><td>2024-09-15</td><td>Relational Algebra</td><td>Chapter 4</td><td></td></tr>
		<tr><td>4</td><td>2024-09-22</td><td>Storage Systems</td><td>Chapter 5</td><td>Project 1 due, Project 2 assigned</td></tr>
		<tr><td>5</td><td>2024-09-29</td><td>Indexing</td><td>Chapter 6</td><td></td></tr>
	</table>
	
	<h2>Exams</h2>
	<ul>
		<li><strong>Midterm Exam:</strong> November 5, 2024, 2:00 PM - 4:00 PM, Location: Wean 5409, Format: In-person</li>
		<li><strong>Final Exam:</strong> December 18, 2024, 2:00 PM - 5:00 PM, Location: TBA, Format: In-person</li>
	</ul>
	
	<h2>Assignments</h2>
	<ul>
		<li><strong>Project 1: SQL Queries</strong> - Due: 2024-10-20 23:59 - Write complex SQL queries for a sample database</li>
		<li><strong>Project 2: Buffer Pool</strong> - Due: 2024-11-10 23:59 - Implement a buffer pool manager</li>
		<li><strong>Final Project: Database System</strong> - Due: 2024-12-10 23:59 - Build a complete database system</li>
	</ul>
	
	<h2>Lectures</h2>
	<ul>
		<li>Lecture 1 (2024-09-01): <a href="https://example.com/15445/lecture1.pdf">Slides</a></li>
		<li>Lecture 2 (2024-09-08): <a href="https://example.com/15445/lecture2.pdf">Slides</a> | <a href="https://example.com/15445/lecture2.mp4">Video</a></li>
		<li>Lecture 3 (2024-09-15): <a href="https://example.com/15445/lecture3.pdf">Slides</a></li>
	</ul>
	
	<h2>Resources</h2>
	<ul>
		<li><strong>Textbook:</strong> <a href="https://example.com/textbook-db">Database Systems: The Complete Book</a> - Required</li>
		<li><strong>PostgreSQL Docs:</strong> <a href="https://www.postgresql.org/docs/">PostgreSQL Documentation</a> - Reference</li>
		<li><strong>Course Materials:</strong> <a href="https://example.com/15445/materials">Course Website</a> - All course materials</li>
	</ul>
</body>
</html>
		`;
	}

	// Default fallback
	return `
<html>
<body>
	<h1>Course Website</h1>
	<p>Course information not available</p>
</body>
</html>
	`;
}

/**
 * Utility function to extract text content from HTML tags
 */
function extractTextFromHtml(html: string, tag: string): string[] {
	const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "gis");
	const matches = html.matchAll(regex);
	const results: string[] = [];
	for (const match of matches) {
		const text = match[1]
			.replace(/<[^>]+>/g, "")
			.replace(/&nbsp;/g, " ")
			.trim();
		if (text) {
			results.push(text);
		}
	}
	return results;
}

/**
 * Utility function to extract content from HTML table rows
 * Extracts only the first table after the marker (if provided)
 */
function extractTableRows(html: string, tableStartMarker?: string): string[][] {
	let searchHtml = html;
	if (tableStartMarker) {
		const startIndex = html.indexOf(tableStartMarker);
		if (startIndex !== -1) {
			// Find the first <table> tag after the marker
			const afterMarker = html.substring(startIndex);
			const tableMatch = afterMarker.match(/<table[^>]*>(.*?)<\/table>/is);
			if (tableMatch) {
				searchHtml = tableMatch[1]; // Only search within this table
			} else {
				// Fallback: search from marker position but stop at next <h2> or </body>
				const nextSection = afterMarker.match(/(.*?)(?:<h2|<h3|<\/body>)/is);
				if (nextSection) {
					searchHtml = nextSection[1];
				} else {
					searchHtml = afterMarker;
				}
			}
		}
	}

	const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
	const rows: string[][] = [];
	const rowMatches = searchHtml.matchAll(rowRegex);

	for (const rowMatch of rowMatches) {
		const cellRegex = /<t[dh][^>]*>(.*?)<\/t[dh]>/gis;
		const cells: string[] = [];
		const cellMatches = rowMatch[1].matchAll(cellRegex);

		for (const cellMatch of cellMatches) {
			const text = cellMatch[1]
				.replace(/<[^>]+>/g, "")
				.replace(/&nbsp;/g, " ")
				.replace(/&amp;/g, "&")
				.trim();
			if (text) {
				cells.push(text);
			}
		}

		if (cells.length > 0) {
			rows.push(cells);
		}
	}

	return rows;
}

/**
 * Utility function to extract links from HTML
 */
function extractLinks(html: string): Array<{ text: string; url: string }> {
	const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
	const links: Array<{ text: string; url: string }> = [];
	const matches = html.matchAll(linkRegex);

	for (const match of matches) {
		const url = match[1];
		const text = match[2].replace(/<[^>]+>/g, "").trim();
		if (url && text) {
			links.push({ text, url });
		}
	}

	return links;
}

/**
 * Parse date string to ISO 8601 format
 */
function parseDate(dateStr: string): string {
	// Try various date formats
	const dateFormats = [
		/(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
		/(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
		/(\w+)\s+(\d{1,2}),\s+(\d{4})/, // Month DD, YYYY
	];

	for (const format of dateFormats) {
		const match = dateStr.match(format);
		if (match) {
			if (format === dateFormats[0]) {
				// Already in YYYY-MM-DD format
				return `${match[0]}T00:00:00Z`;
			} else if (format === dateFormats[1]) {
				// MM/DD/YYYY
				const [, month, day, year] = match;
				return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00Z`;
			} else if (format === dateFormats[2]) {
				// Month DD, YYYY
				const monthNames: Record<string, string> = {
					January: "01",
					February: "02",
					March: "03",
					April: "04",
					May: "05",
					June: "06",
					July: "07",
					August: "08",
					September: "09",
					October: "10",
					November: "11",
					December: "12",
				};
				const [, month, day, year] = match;
				const monthNum = monthNames[month] || "01";
				return `${year}-${monthNum}-${day.padStart(2, "0")}T00:00:00Z`;
			}
		}
	}

	// Fallback: return as-is if can't parse
	return dateStr;
}

/**
 * Extract syllabus information from HTML
 */
function extractSyllabus(html: string): CourseWebsiteCrawlerOutput["syllabus"] {
	const syllabusSection = html.match(/<div[^>]*class=["']syllabus["'][^>]*>(.*?)<\/div>/is);
	if (!syllabusSection) {
		return undefined;
	}

	const sectionHtml = syllabusSection[1];

	// Extract title (from h3 or first heading)
	const titleMatch = sectionHtml.match(/<h3[^>]*>(.*?)<\/h3>/i);
	const title = titleMatch
		? titleMatch[1].replace(/<[^>]+>/g, "").trim()
		: "Course Syllabus";

	// Extract description
	const descMatch = sectionHtml.match(/<p[^>]*>(.*?)<\/p>/i);
	const description = descMatch
		? descMatch[1].replace(/<[^>]+>/g, "").trim()
		: "";

	// Extract grading policy
	const gradingMatch = sectionHtml.match(
		/grading[^>]*>.*?<ul[^>]*>(.*?)<\/ul>/is,
	);
	let grading: string | undefined;
	if (gradingMatch) {
		const items = extractTextFromHtml(gradingMatch[1], "li");
		grading = items.join(", ");
	}

	// Extract policies
	const policiesMatch = sectionHtml.match(
		/polic[^>]*>.*?<ul[^>]*>(.*?)<\/ul>/is,
	);
	const policies = policiesMatch ? extractTextFromHtml(policiesMatch[1], "li") : undefined;

	return {
		title,
		description,
		grading,
		policies: policies && policies.length > 0 ? policies : undefined,
	};
}

/**
 * Extract schedule from HTML
 */
function extractSchedule(html: string): CourseWebsiteCrawlerOutput["schedule"] {
	const scheduleRows = extractTableRows(html, "Course Schedule");
	if (scheduleRows.length < 2) {
		return undefined; // Need at least header + 1 data row
	}

	const schedule: CourseWebsiteCrawlerOutput["schedule"] = [];
	const headerRow = scheduleRows[0];
	const weekIndex = headerRow.findIndex((h) =>
		h.toLowerCase().includes("week"),
	);
	const dateIndex = headerRow.findIndex((h) => h.toLowerCase().includes("date"));
	const topicIndex = headerRow.findIndex((h) => h.toLowerCase().includes("topic"));
	const readingsIndex = headerRow.findIndex((h) =>
		h.toLowerCase().includes("reading"),
	);
	const assignmentsIndex = headerRow.findIndex((h) =>
		h.toLowerCase().includes("assignment"),
	);

	for (let i = 1; i < scheduleRows.length; i++) {
		const row = scheduleRows[i];
		if (row.length === 0) continue;

		const week = weekIndex >= 0 ? Number.parseInt(row[weekIndex] || "0", 10) : i;
		const date = dateIndex >= 0 ? parseDate(row[dateIndex] || "") : "";
		const topic = topicIndex >= 0 ? row[topicIndex] || "" : "";

		let readings: string[] | undefined;
		if (readingsIndex >= 0 && row[readingsIndex]) {
			readings = row[readingsIndex]
				.split(/[,;]/)
				.map((r) => r.trim())
				.filter((r) => r.length > 0);
		}

		let assignments: string[] | undefined;
		if (assignmentsIndex >= 0 && row[assignmentsIndex]) {
			assignments = row[assignmentsIndex]
				.split(/[,;]/)
				.map((a) => a.trim())
				.filter((a) => a.length > 0);
		}

		if (date && topic) {
			schedule.push({
				week,
				date,
				topic,
				readings,
				assignments,
			});
		}
	}

	return schedule.length > 0 ? schedule : undefined;
}

/**
 * Extract office hours from HTML
 */
function extractOfficeHours(html: string): CourseWebsiteCrawlerOutput["officeHours"] {
	const officeHoursRows = extractTableRows(html, "Office Hours");
	if (officeHoursRows.length < 2) {
		return undefined;
	}

	const headerRow = officeHoursRows[0];
	// Validate this is actually an office hours table (not a schedule table)
	if (
		!headerRow.some((h) => h.toLowerCase().includes("instructor")) ||
		!headerRow.some((h) => h.toLowerCase().includes("day"))
	) {
		return undefined;
	}

	const instructorIndex = headerRow.findIndex((h) =>
		h.toLowerCase().includes("instructor"),
	);
	const dayIndex = headerRow.findIndex((h) => h.toLowerCase().includes("day"));
	const timeIndex = headerRow.findIndex((h) => h.toLowerCase().includes("time"));
	const locationIndex = headerRow.findIndex((h) =>
		h.toLowerCase().includes("location"),
	);

	const officeHours: CourseWebsiteCrawlerOutput["officeHours"] = [];

	for (let i = 1; i < officeHoursRows.length; i++) {
		const row = officeHoursRows[i];
		if (row.length === 0) continue;

		// Skip rows that look like schedule headers (contain "Week", "Date", "Topic")
		if (
			row.some((cell) => cell.toLowerCase().includes("week")) ||
			row.some((cell) => cell.toLowerCase().includes("topic"))
		) {
			continue;
		}

		const instructor =
			instructorIndex >= 0 ? row[instructorIndex] || "" : "";
		const day = dayIndex >= 0 ? row[dayIndex] || "" : "";
		const time = timeIndex >= 0 ? row[timeIndex] || "" : "";
		const location =
			locationIndex >= 0 ? row[locationIndex] || "" : undefined;

		if (instructor && day && time) {
			officeHours.push({
				instructor,
				day,
				time,
				location,
			});
		}
	}

	return officeHours.length > 0 ? officeHours : undefined;
}

/**
 * Extract exam information from HTML
 */
function extractExamInfo(html: string): CourseWebsiteCrawlerOutput["exams"] {
	const examList = html.match(/<h2[^>]*>Exams<\/h2>.*?<ul[^>]*>(.*?)<\/ul>/is);
	if (!examList) {
		return undefined;
	}

	const examItems = extractTextFromHtml(examList[1], "li");
	const exams: CourseWebsiteCrawlerOutput["exams"] = [];

	for (const item of examItems) {
		// Parse exam format: "Midterm Exam: October 25, 2024, 2:00 PM - 4:00 PM, Location: Wean 5409, Format: In-person"
		const typeMatch = item.match(/^([^:]+):/);
		const type = typeMatch ? typeMatch[1].trim() : "Exam";

		const dateMatch = item.match(/(\w+\s+\d{1,2},\s+\d{4})/);
		const date = dateMatch ? parseDate(dateMatch[1]) : "";

		const timeMatch = item.match(/(\d{1,2}:\d{2}\s+[AP]M(?:\s+-\s+\d{1,2}:\d{2}\s+[AP]M)?)/);
		const time = timeMatch ? timeMatch[1] : undefined;

		const locationMatch = item.match(/Location:\s*([^,]+)/i);
		const location = locationMatch ? locationMatch[1].trim() : undefined;

		const formatMatch = item.match(/Format:\s*([^,]+)/i);
		const format = formatMatch ? formatMatch[1].trim() : undefined;

		if (date) {
			exams.push({
				type,
				date,
				time,
				location,
				format,
			});
		}
	}

	return exams.length > 0 ? exams : undefined;
}

/**
 * Extract assignments from HTML
 */
function extractAssignments(html: string): CourseWebsiteCrawlerOutput["assignments"] {
	const assignmentList = html.match(
		/<h2[^>]*>Assignments<\/h2>.*?<ul[^>]*>(.*?)<\/ul>/is,
	);
	if (!assignmentList) {
		return undefined;
	}

	const assignmentItems = extractTextFromHtml(assignmentList[1], "li");
	const assignments: CourseWebsiteCrawlerOutput["assignments"] = [];

	for (let i = 0; i < assignmentItems.length; i++) {
		const item = assignmentItems[i];

		// Parse format: "Homework 1: Linear Regression - Due: 2024-09-15 23:59 - Implement linear regression"
		const titleMatch = item.match(/^([^:]+):/);
		const title = titleMatch ? titleMatch[1].trim() : `Assignment ${i + 1}`;

		const dueMatch = item.match(/Due:\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/i);
		const dueDate = dueMatch
			? `${dueMatch[1].replace(" ", "T")}:00Z`
			: "";

		const descMatch = item.match(/-\s+(.+)$/);
		const description = descMatch ? descMatch[1].trim() : undefined;

		if (title && dueDate) {
			assignments.push({
				id: `assignment-${i + 1}`,
				title,
				dueDate,
				description,
			});
		}
	}

	return assignments.length > 0 ? assignments : undefined;
}

/**
 * Extract lectures from HTML
 */
function extractLectures(html: string): CourseWebsiteCrawlerOutput["lectures"] {
	const lectureList = html.match(
		/<h2[^>]*>Lectures<\/h2>.*?<ul[^>]*>(.*?)<\/ul>/is,
	);
	if (!lectureList) {
		return undefined;
	}

	const lectureItems = extractTextFromHtml(lectureList[1], "li");
	const links = extractLinks(lectureList[1]);
	const lectures: CourseWebsiteCrawlerOutput["lectures"] = [];

	for (let i = 0; i < lectureItems.length; i++) {
		const item = lectureItems[i];

		// Parse format: "Lecture 1 (2024-09-01): Slides | Video"
		const titleMatch = item.match(/^([^(]+)/);
		const title = titleMatch ? titleMatch[1].trim() : `Lecture ${i + 1}`;

		const dateMatch = item.match(/\((\d{4}-\d{2}-\d{2})\)/);
		const date = dateMatch ? parseDate(dateMatch[1]) : "";

		// Find corresponding links
		const itemLinks = links.filter((l) =>
			item.toLowerCase().includes(l.text.toLowerCase()),
		);
		const slidesUrl = itemLinks.find((l) =>
			l.text.toLowerCase().includes("slide"),
		)?.url;
		const videoUrl = itemLinks.find((l) =>
			l.text.toLowerCase().includes("video"),
		)?.url;

		if (title && date) {
			lectures.push({
				id: `lecture-${i + 1}`,
				title,
				date,
				slidesUrl,
				videoUrl,
			});
		}
	}

	return lectures.length > 0 ? lectures : undefined;
}

/**
 * Extract resources from HTML
 */
function extractResources(html: string): CourseWebsiteCrawlerOutput["resources"] {
	const resourceList = html.match(
		/<h2[^>]*>Resources<\/h2>.*?<ul[^>]*>(.*?)<\/ul>/is,
	);
	if (!resourceList) {
		return undefined;
	}

	const resourceItems = extractTextFromHtml(resourceList[1], "li");
	const links = extractLinks(resourceList[1]);
	const resources: CourseWebsiteCrawlerOutput["resources"] = [];

	for (const item of resourceItems) {
		// Parse format: "Textbook: Course Textbook - Required reading"
		const typeMatch = item.match(/^([^:]+):/);
		const type = typeMatch ? typeMatch[1].trim() : "resource";

		const titleMatch = item.match(/:\s*([^-]+)/);
		const title = titleMatch ? titleMatch[1].trim() : item;

		const descMatch = item.match(/-\s+(.+)$/);
		const description = descMatch ? descMatch[1].trim() : undefined;

		// Find corresponding link
		const itemLink = links.find((l) =>
			item.toLowerCase().includes(l.text.toLowerCase()),
		);
		const url = itemLink?.url || "";

		if (title && url) {
			resources.push({
				type,
				title,
				url,
				description,
			});
		}
	}

	return resources.length > 0 ? resources : undefined;
}

/**
 * Crawl function - parses HTML and extracts structured data
 * REAL API: Replace with actual fetch() call to URL, then parse HTML
 */
async function crawl(
	urlOrHtml: string,
	courseId?: string,
): Promise<string> {
	// REAL API IMPLEMENTATION:
	// if (urlOrHtml.startsWith('http://') || urlOrHtml.startsWith('https://')) {
	//   const response = await fetch(urlOrHtml);
	//   if (!response.ok) {
	//     throw new Error(`Failed to fetch URL: ${response.statusText}`);
	//   }
	//   return await response.text();
	// }
	// return urlOrHtml; // Already HTML text

	// Mock implementation - return mock HTML based on course ID
	if (urlOrHtml.startsWith("http://") || urlOrHtml.startsWith("https://")) {
		// Extract course ID from URL if not provided
		const extractedCourseId =
			courseId || urlOrHtml.match(/(10-601|15-445)/)?.[0];
		return getMockHtmlForCourse(extractedCourseId);
	}

	// If it's already HTML text, return as-is
	return urlOrHtml;
}

export const CourseWebsiteCrawlerAgent: Agent<
	CourseWebsiteCrawlerInput,
	AgentResult<CourseWebsiteCrawlerOutput>
> = {
	name: "CourseWebsiteCrawlerAgent",
	description:
		"Crawls course websites to extract syllabus, schedule, lectures, assignments, office hours, exams, and resources",

	async execute(
		input: CourseWebsiteCrawlerInput,
	): Promise<AgentResult<CourseWebsiteCrawlerOutput>> {
		agentLogger.logStart("CourseWebsiteCrawlerAgent", input);

		try {
			// Validate input
			const validatedInput = courseWebsiteCrawlerInputSchema.parse(input);

			// Crawl the website (fetch HTML or use provided HTML)
			const html = await crawl(validatedInput.urlOrHtml, validatedInput.courseId);

			// Determine URL for output
			const url =
				validatedInput.urlOrHtml.startsWith("http://") ||
				validatedInput.urlOrHtml.startsWith("https://")
					? validatedInput.urlOrHtml
					: "provided-html-text";

			// Extract data based on requested types
			const output: CourseWebsiteCrawlerOutput = {
				courseId: validatedInput.courseId,
				url,
				syllabus: validatedInput.extractTypes.includes("syllabus")
					? extractSyllabus(html)
					: undefined,
				schedule: validatedInput.extractTypes.includes("schedule")
					? extractSchedule(html)
					: undefined,
				lectures: validatedInput.extractTypes.includes("lectures")
					? extractLectures(html)
					: undefined,
				assignments: validatedInput.extractTypes.includes("assignments")
					? extractAssignments(html)
					: undefined,
				officeHours: validatedInput.extractTypes.includes("officeHours")
					? extractOfficeHours(html)
					: undefined,
				exams: validatedInput.extractTypes.includes("exams")
					? extractExamInfo(html)
					: undefined,
				resources: validatedInput.extractTypes.includes("resources")
					? extractResources(html)
					: undefined,
			};

			agentLogger.logSuccess("CourseWebsiteCrawlerAgent", output);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "CourseWebsiteCrawlerAgent",
				message: "Successfully crawled course website",
				data: output,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			agentLogger.logError("CourseWebsiteCrawlerAgent", errorMessage, { input });

			return {
				success: false,
				timestamp: new Date().toISOString(),
				agentName: "CourseWebsiteCrawlerAgent",
				error: errorMessage,
			};
		}
	},
};

/**
 * Test function for CourseWebsiteCrawlerAgent
 * Prints formatted results to console
 */
export async function testCrawlerAgent(): Promise<void> {
	console.log("=".repeat(80));
	console.log("Testing CourseWebsiteCrawlerAgent");
	console.log("=".repeat(80));
	console.log();

	// Test Course 1: Machine Learning (10-601)
	console.log("Test 1: Machine Learning (10-601)");
	console.log("-".repeat(80));

	const testInput1: CourseWebsiteCrawlerInput = {
		urlOrHtml: "https://example.com/courses/10-601",
		courseId: "10-601",
		extractTypes: [
			"syllabus",
			"schedule",
			"lectures",
			"assignments",
			"officeHours",
			"exams",
			"resources",
		],
	};

	const result1 = await CourseWebsiteCrawlerAgent.execute(testInput1);

	if (result1.success && result1.data) {
		console.log("✅ CourseWebsiteCrawlerAgent executed successfully!");
		console.log();

		if (result1.data.syllabus) {
			console.log("Syllabus:");
			console.log(`  Title: ${result1.data.syllabus.title}`);
			console.log(`  Description: ${result1.data.syllabus.description.substring(0, 80)}...`);
			if (result1.data.syllabus.grading) {
				console.log(`  Grading: ${result1.data.syllabus.grading}`);
			}
			if (result1.data.syllabus.policies) {
				console.log(`  Policies: ${result1.data.syllabus.policies.length} policies`);
				result1.data.syllabus.policies.forEach((p) => {
					console.log(`    - ${p}`);
				});
			}
			console.log();
		}

		if (result1.data.officeHours) {
			console.log("Office Hours:");
			result1.data.officeHours.forEach((oh) => {
				console.log(
					`  ${oh.instructor}: ${oh.day} ${oh.time}${oh.location ? ` (${oh.location})` : ""}`,
				);
			});
			console.log();
		}

		if (result1.data.schedule) {
			console.log("Schedule:");
			result1.data.schedule.forEach((s) => {
				console.log(
					`  Week ${s.week} (${s.date}): ${s.topic}${s.readings ? ` - Readings: ${s.readings.join(", ")}` : ""}${s.assignments ? ` - Assignments: ${s.assignments.join(", ")}` : ""}`,
				);
			});
			console.log();
		}

		if (result1.data.exams) {
			console.log("Exams:");
			result1.data.exams.forEach((exam) => {
				console.log(
					`  ${exam.type}: ${new Date(exam.date).toLocaleDateString()}${exam.time ? ` at ${exam.time}` : ""}${exam.location ? ` in ${exam.location}` : ""}${exam.format ? ` (${exam.format})` : ""}`,
				);
			});
			console.log();
		}

		if (result1.data.assignments) {
			console.log("Assignments:");
			result1.data.assignments.forEach((a) => {
				console.log(
					`  ${a.title}: Due ${new Date(a.dueDate).toLocaleString()}${a.description ? ` - ${a.description}` : ""}`,
				);
			});
			console.log();
		}

		if (result1.data.lectures) {
			console.log("Lectures:");
			result1.data.lectures.forEach((l) => {
				console.log(
					`  ${l.title} (${new Date(l.date).toLocaleDateString()})${l.slidesUrl ? ` - Slides: ${l.slidesUrl}` : ""}${l.videoUrl ? ` - Video: ${l.videoUrl}` : ""}`,
				);
			});
			console.log();
		}

		if (result1.data.resources) {
			console.log("Resources:");
			result1.data.resources.forEach((r) => {
				console.log(
					`  [${r.type}] ${r.title}: ${r.url}${r.description ? ` - ${r.description}` : ""}`,
				);
			});
			console.log();
		}
	} else {
		console.log("❌ CourseWebsiteCrawlerAgent execution failed!");
		console.log("Error:", result1.error);
	}

	// Test Course 2: Database Systems (15-445)
	console.log("\n" + "=".repeat(80));
	console.log("Test 2: Database Systems (15-445)");
	console.log("-".repeat(80));

	const testInput2: CourseWebsiteCrawlerInput = {
		urlOrHtml: "https://example.com/courses/15-445",
		courseId: "15-445",
		extractTypes: ["syllabus", "officeHours", "exams"],
	};

	const result2 = await CourseWebsiteCrawlerAgent.execute(testInput2);

	if (result2.success && result2.data) {
		console.log("✅ CourseWebsiteCrawlerAgent executed successfully!");
		console.log();
		console.log(`Course: ${result2.data.courseId || "Unknown"}`);
		console.log(`URL: ${result2.data.url}`);
		console.log();

		if (result2.data.syllabus) {
			console.log("Syllabus extracted:", result2.data.syllabus.title);
		}
		if (result2.data.officeHours) {
			console.log(`Office hours: ${result2.data.officeHours.length} entries`);
		}
		if (result2.data.exams) {
			console.log(`Exams: ${result2.data.exams.length} exams`);
		}
	} else {
		console.log("❌ CourseWebsiteCrawlerAgent execution failed!");
		console.log("Error:", result2.error);
	}

	console.log();
	console.log("=".repeat(80));
}

