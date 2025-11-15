/**
 * Example prompts and test cases for CanvasAgent
 * 
 * Use these examples to test different scenarios and features
 */

import { CanvasAgent, type CanvasAgentInput } from "./canvas-agent";

/**
 * Example 1: Basic usage - Get all assignments and courses
 */
export async function example1_BasicUsage() {
	console.log("\n📝 Example 1: Basic Usage - Get all assignments and courses");
	console.log("=".repeat(80));
	
	const input: CanvasAgentInput = {
		userId: "student-123",
		includeGrades: true,
		includeAnnouncements: false,
		includeQuizzes: true,
		includeExams: true,
	};

	const result = await CanvasAgent.execute(input);
	
	if (result.success && result.data) {
		console.log(`✅ Found ${result.data.courses.length} courses`);
		console.log(`✅ Found ${result.data.assignments.length} assignments`);
		console.log("\nUpcoming deadlines:");
		result.data.assignments
			.filter(a => !a.submitted)
			.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
			.slice(0, 5)
			.forEach(a => {
				console.log(`  - ${a.assignment_name} (${a.course_id}): ${new Date(a.deadline).toLocaleDateString()}`);
			});
	}
}

/**
 * Example 2: Get only assignments (no quizzes or exams)
 */
export async function example2_AssignmentsOnly() {
	console.log("\n📝 Example 2: Assignments Only (no quizzes/exams)");
	console.log("=".repeat(80));
	
	const input: CanvasAgentInput = {
		userId: "student-123",
		includeQuizzes: false,
		includeExams: false,
		includeAnnouncements: false,
	};

	const result = await CanvasAgent.execute(input);
	
	if (result.success && result.data) {
		console.log(`✅ Found ${result.data.assignments.length} assignments (no quizzes/exams)`);
		result.data.assignments.forEach(a => {
			console.log(`  - [${a.type}] ${a.assignment_name}`);
		});
	}
}

/**
 * Example 3: Get all announcements
 */
export async function example3_Announcements() {
	console.log("\n📝 Example 3: Get All Announcements");
	console.log("=".repeat(80));
	
	const input: CanvasAgentInput = {
		userId: "student-123",
		includeAnnouncements: true,
		includeQuizzes: false,
		includeExams: false,
	};

	const result = await CanvasAgent.execute(input);
	
	if (result.success && result.data?.announcements) {
		console.log(`✅ Found ${result.data.announcements.length} announcements`);
		result.data.announcements.forEach(ann => {
			console.log(`\n📢 ${ann.title}`);
			console.log(`   Course: ${ann.courseId}`);
			console.log(`   Posted: ${new Date(ann.postedAt).toLocaleString()}`);
			console.log(`   Message: ${ann.message}`);
		});
	}
}

/**
 * Example 4: Get pending assignments (not submitted)
 */
export async function example4_PendingAssignments() {
	console.log("\n📝 Example 4: Pending Assignments (Not Submitted)");
	console.log("=".repeat(80));
	
	const input: CanvasAgentInput = {
		userId: "student-123",
		includeQuizzes: true,
		includeExams: true,
	};

	const result = await CanvasAgent.execute(input);
	
	if (result.success && result.data) {
		const pending = result.data.assignments.filter(a => !a.submitted);
		console.log(`✅ Found ${pending.length} pending assignments`);
		
		// Sort by deadline
		pending.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
		
		pending.forEach(a => {
			const daysUntil = Math.ceil(
				(new Date(a.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
			);
			console.log(`\n  📌 ${a.assignment_name}`);
			console.log(`     Course: ${a.course_id}`);
			console.log(`     Deadline: ${new Date(a.deadline).toLocaleString()} (${daysUntil} days)`);
			if (a.points) console.log(`     Points: ${a.points}`);
			if (a.description) console.log(`     Description: ${a.description.substring(0, 80)}...`);
		});
	}
}

/**
 * Example 5: Get submitted assignments with grades
 */
export async function example5_SubmittedWithGrades() {
	console.log("\n📝 Example 5: Submitted Assignments with Grades");
	console.log("=".repeat(80));
	
	const input: CanvasAgentInput = {
		userId: "student-123",
		includeGrades: true,
	};

	const result = await CanvasAgent.execute(input);
	
	if (result.success && result.data) {
		const submitted = result.data.assignments.filter(a => a.submitted);
		console.log(`✅ Found ${submitted.length} submitted assignments`);
		
		submitted.forEach(a => {
			console.log(`\n  ✅ ${a.assignment_name}`);
			console.log(`     Course: ${a.course_id}`);
			if (a.grade !== undefined && a.points) {
				const percentage = ((a.grade / a.points) * 100).toFixed(1);
				console.log(`     Grade: ${a.grade}/${a.points} (${percentage}%)`);
			} else if (a.grade !== undefined) {
				console.log(`     Grade: ${a.grade}`);
			}
			console.log(`     Submitted: Yes`);
		});
	}
}

/**
 * Example 6: Get assignments by course
 */
export async function example6_ByCourse() {
	console.log("\n📝 Example 6: Assignments Grouped by Course");
	console.log("=".repeat(80));
	
	const input: CanvasAgentInput = {
		userId: "student-123",
		includeQuizzes: true,
		includeExams: true,
	};

	const result = await CanvasAgent.execute(input);
	
	if (result.success && result.data) {
		// Group by course
		const byCourse = new Map<string, typeof result.data.assignments>();
		
		result.data.assignments.forEach(a => {
			if (!byCourse.has(a.course_id)) {
				byCourse.set(a.course_id, []);
			}
			byCourse.get(a.course_id)!.push(a);
		});
		
		// Display by course
		result.data.courses.forEach(course => {
			const courseAssignments = byCourse.get(course.id) || [];
			if (courseAssignments.length > 0) {
				console.log(`\n📚 ${course.code}: ${course.name}`);
				console.log(`   ${courseAssignments.length} assignments`);
				courseAssignments.forEach(a => {
					const status = a.submitted ? "✅" : "⏳";
					console.log(`   ${status} ${a.assignment_name} (${a.type})`);
				});
			}
		});
	}
}

/**
 * Example 7: Get upcoming deadlines (next 7 days)
 */
export async function example7_UpcomingDeadlines() {
	console.log("\n📝 Example 7: Upcoming Deadlines (Next 7 Days)");
	console.log("=".repeat(80));
	
	const input: CanvasAgentInput = {
		userId: "student-123",
		includeQuizzes: true,
		includeExams: true,
	};

	const result = await CanvasAgent.execute(input);
	
	if (result.success && result.data) {
		const now = new Date();
		const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
		
		const upcoming = result.data.assignments
			.filter(a => {
				const deadline = new Date(a.deadline);
				return deadline >= now && deadline <= sevenDaysFromNow && !a.submitted;
			})
			.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
		
		console.log(`✅ Found ${upcoming.length} assignments due in the next 7 days`);
		
		upcoming.forEach(a => {
			const deadline = new Date(a.deadline);
			const hoursUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
			console.log(`\n  ⚠️  ${a.assignment_name}`);
			console.log(`     Course: ${a.course_id}`);
			console.log(`     Due: ${deadline.toLocaleString()} (${hoursUntil} hours)`);
			if (a.points) console.log(`     Points: ${a.points}`);
		});
	}
}

/**
 * Example 8: Get exams only
 */
export async function example8_ExamsOnly() {
	console.log("\n📝 Example 8: Exams Only");
	console.log("=".repeat(80));
	
	const input: CanvasAgentInput = {
		userId: "student-123",
		includeQuizzes: false,
		includeExams: true,
		includeAnnouncements: false,
	};

	const result = await CanvasAgent.execute(input);
	
	if (result.success && result.data) {
		const exams = result.data.assignments.filter(a => a.type === "exam");
		console.log(`✅ Found ${exams.length} exams`);
		
		exams.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
		
		exams.forEach(exam => {
			console.log(`\n  📝 ${exam.assignment_name}`);
			console.log(`     Course: ${exam.course_id}`);
			console.log(`     Date: ${new Date(exam.deadline).toLocaleString()}`);
			if (exam.description) console.log(`     Description: ${exam.description}`);
		});
	}
}

/**
 * Example 9: Get high-point assignments
 */
export async function example9_HighPointAssignments() {
	console.log("\n📝 Example 9: High-Point Assignments (100+ points)");
	console.log("=".repeat(80));
	
	const input: CanvasAgentInput = {
		userId: "student-123",
		includeQuizzes: true,
		includeExams: true,
	};

	const result = await CanvasAgent.execute(input);
	
	if (result.success && result.data) {
		const highPoint = result.data.assignments
			.filter(a => a.points && a.points >= 100)
			.sort((a, b) => (b.points || 0) - (a.points || 0));
		
		console.log(`✅ Found ${highPoint.length} high-point assignments (100+ points)`);
		
		highPoint.forEach(a => {
			console.log(`\n  💯 ${a.assignment_name}`);
			console.log(`     Course: ${a.course_id}`);
			console.log(`     Points: ${a.points}`);
			console.log(`     Deadline: ${new Date(a.deadline).toLocaleString()}`);
			console.log(`     Status: ${a.submitted ? "Submitted" : "Pending"}`);
		});
	}
}

/**
 * Example 10: Complete overview
 */
export async function example10_CompleteOverview() {
	console.log("\n📝 Example 10: Complete Overview");
	console.log("=".repeat(80));
	
	const input: CanvasAgentInput = {
		userId: "student-123",
		includeGrades: true,
		includeAnnouncements: true,
		includeQuizzes: true,
		includeExams: true,
	};

	const result = await CanvasAgent.execute(input);
	
	if (result.success && result.data) {
		console.log("\n📊 SUMMARY");
		console.log("─".repeat(80));
		console.log(`Courses: ${result.data.courses.length}`);
		console.log(`Total Assignments: ${result.data.assignments.length}`);
		
		const byType = {
			assignment: result.data.assignments.filter(a => a.type === "assignment").length,
			quiz: result.data.assignments.filter(a => a.type === "quiz").length,
			exam: result.data.assignments.filter(a => a.type === "exam").length,
		};
		
		console.log(`  - Assignments: ${byType.assignment}`);
		console.log(`  - Quizzes: ${byType.quiz}`);
		console.log(`  - Exams: ${byType.exam}`);
		
		const submitted = result.data.assignments.filter(a => a.submitted).length;
		const pending = result.data.assignments.filter(a => !a.submitted).length;
		
		console.log(`\nStatus:`);
		console.log(`  - Submitted: ${submitted}`);
		console.log(`  - Pending: ${pending}`);
		
		if (result.data.announcements) {
			console.log(`\nAnnouncements: ${result.data.announcements.length}`);
		}
		
		// Next deadline
		const pendingSorted = result.data.assignments
			.filter(a => !a.submitted)
			.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
		
		if (pendingSorted.length > 0) {
			const next = pendingSorted[0];
			const daysUntil = Math.ceil(
				(new Date(next.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
			);
			console.log(`\n⏰ Next Deadline:`);
			console.log(`   ${next.assignment_name} (${next.course_id})`);
			console.log(`   Due: ${new Date(next.deadline).toLocaleString()} (${daysUntil} days)`);
		}
	}
}

/**
 * Run all examples
 */
export async function runAllExamples() {
	console.log("\n" + "=".repeat(80));
	console.log("CANVAS AGENT - EXAMPLE PROMPTS");
	console.log("=".repeat(80));
	
	await example1_BasicUsage();
	await example2_AssignmentsOnly();
	await example3_Announcements();
	await example4_PendingAssignments();
	await example5_SubmittedWithGrades();
	await example6_ByCourse();
	await example7_UpcomingDeadlines();
	await example8_ExamsOnly();
	await example9_HighPointAssignments();
	await example10_CompleteOverview();
	
	console.log("\n" + "=".repeat(80));
	console.log("All examples completed!");
	console.log("=".repeat(80));
}

