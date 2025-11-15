/**
 * Run CanvasAgent examples
 * Usage: npx tsx agents/run-examples.ts [example-number]
 * 
 * Examples:
 *   npx tsx agents/run-examples.ts 1    # Run example 1
 *   npx tsx agents/run-examples.ts all  # Run all examples
 */

import {
	example1_BasicUsage,
	example2_AssignmentsOnly,
	example3_Announcements,
	example4_PendingAssignments,
	example5_SubmittedWithGrades,
	example6_ByCourse,
	example7_UpcomingDeadlines,
	example8_ExamsOnly,
	example9_HighPointAssignments,
	example10_CompleteOverview,
	runAllExamples,
} from "./canvas-agent-examples";

const exampleNumber = process.argv[2] || "all";

const examples: Record<string, () => Promise<void>> = {
	"1": example1_BasicUsage,
	"2": example2_AssignmentsOnly,
	"3": example3_Announcements,
	"4": example4_PendingAssignments,
	"5": example5_SubmittedWithGrades,
	"6": example6_ByCourse,
	"7": example7_UpcomingDeadlines,
	"8": example8_ExamsOnly,
	"9": example9_HighPointAssignments,
	"10": example10_CompleteOverview,
	all: runAllExamples,
};

async function main() {
	const example = examples[exampleNumber];

	if (!example) {
		console.error(`Unknown example: ${exampleNumber}`);
		console.log("\nAvailable examples:");
		console.log("  1  - Basic Usage");
		console.log("  2  - Assignments Only");
		console.log("  3  - Announcements");
		console.log("  4  - Pending Assignments");
		console.log("  5  - Submitted with Grades");
		console.log("  6  - By Course");
		console.log("  7  - Upcoming Deadlines");
		console.log("  8  - Exams Only");
		console.log("  9  - High-Point Assignments");
		console.log("  10 - Complete Overview");
		console.log("  all - Run all examples");
		process.exit(1);
	}

	await example();
}

main().catch((error) => {
	console.error("Error running example:", error);
	process.exit(1);
});

