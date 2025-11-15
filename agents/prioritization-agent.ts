import { z } from "zod";
import type { Agent, AgentResult } from "./types";
import { agentLogger } from "./logger";

/**
 * PrioritizationAgent - Prioritizes tasks based on deadlines, difficulty, and estimated hours
 *
 * Purpose: Analyzes assignments and computes priority scores based on urgency (deadline proximity),
 * difficulty (difficulty_score), and workload (estimated_hours) to help users focus on the most
 * critical tasks first.
 *
 * REAL API INTEGRATION NOTES:
 * - Could integrate with calendar systems to get real-time deadlines
 * - Could learn from user behavior to adjust weight calculations
 * - Could consider dependencies between tasks
 */

const prioritizationInputSchema = z.object({
	tasks: z.array(
		z.object({
			id: z.string(),
			title: z.string().optional(),
			deadline: z.string().describe("ISO 8601 format deadline"),
			estimated_hours: z.number().describe("Estimated hours to complete"),
			difficulty_score: z
				.number()
				.min(1)
				.max(10)
				.describe("Difficulty rating from 1 (easy) to 10 (very difficult)"),
		}),
	),
});

const prioritizedTaskSchema = z.object({
	id: z.string(),
	title: z.string().optional(),
	deadline: z.string(),
	estimated_hours: z.number(),
	difficulty_score: z.number(),
	priority_score: z.number().describe("Computed priority score (sum of all weights)"),
	urgency_weight: z.number().describe("Urgency component (0-100)"),
	difficulty_weight: z.number().describe("Difficulty component (0-100)"),
	hours_weight: z.number().describe("Hours component (0-100)"),
});

const prioritizationOutputSchema = z.object({
	prioritizedTasks: z.array(prioritizedTaskSchema),
});

export type PrioritizationInput = z.infer<typeof prioritizationInputSchema>;
export type PrioritizationOutput = z.infer<typeof prioritizationOutputSchema>;
export type PrioritizedTask = z.infer<typeof prioritizedTaskSchema>;
export type TaskInput = z.infer<typeof prioritizationInputSchema>["tasks"][number];

/**
 * Calculate urgency weight based on deadline proximity
 * Closer deadlines → higher urgency_weight
 * Formula: urgency_weight = max(0, 100 - (days_until_deadline * 10))
 * - 0 days until deadline = 100
 * - 10 days until deadline = 0
 * - Overdue tasks = 100 (maximum urgency)
 */
function calculateUrgencyWeight(deadline: string, now: Date = new Date()): number {
	const deadlineDate = new Date(deadline);
	const nowTime = now.getTime();
	const deadlineTime = deadlineDate.getTime();

	// Calculate days until deadline (can be negative if overdue)
	const daysUntilDeadline = (deadlineTime - nowTime) / (1000 * 60 * 60 * 24);

	// If overdue, maximum urgency
	if (daysUntilDeadline < 0) {
		return 100;
	}

	// Urgency multiplier: 10 (so 10 days = 0, 0 days = 100)
	const urgencyWeight = Math.max(0, 100 - daysUntilDeadline * 10);

	// Normalize to 0-100 range
	return Math.min(100, Math.max(0, urgencyWeight));
}

/**
 * Calculate difficulty weight based on difficulty_score
 * Harder tasks → higher difficulty_weight
 * Formula: difficulty_weight = difficulty_score * 10
 * - difficulty 1 = 10
 * - difficulty 10 = 100
 */
function calculateDifficultyWeight(difficulty_score: number): number {
	// Direct mapping: 1-10 → 10-100
	return difficulty_score * 10;
}

/**
 * Calculate hours weight based on estimated_hours
 * Longer tasks → higher hours_weight
 * Formula: hours_weight = min(100, estimated_hours * 2)
 * - 50 hours = 100 (capped)
 * - Scales linearly
 */
function calculateHoursWeight(estimated_hours: number): number {
	// Hours multiplier: 2 (so 50 hours = 100)
	const hoursWeight = estimated_hours * 2;

	// Cap at 100
	return Math.min(100, Math.max(0, hoursWeight));
}

/**
 * Prioritize tasks based on urgency, difficulty, and hours
 * Formula: priority_score = urgency_weight + difficulty_weight + hours_weight
 *
 * @param tasks Array of tasks with deadline, estimated_hours, and difficulty_score
 * @returns Sorted array of tasks with computed priority scores (highest priority first)
 */
export function prioritize(
	tasks: Array<TaskInput>,
	now: Date = new Date(),
): Array<PrioritizedTask> {
	// Calculate priority for each task
	const prioritized = tasks.map((task) => {
		const urgency_weight = calculateUrgencyWeight(task.deadline, now);
		const difficulty_weight = calculateDifficultyWeight(task.difficulty_score);
		const hours_weight = calculateHoursWeight(task.estimated_hours);

		// Priority score = sum of all weights
		const priority_score = urgency_weight + difficulty_weight + hours_weight;

		return {
			id: task.id,
			title: task.title,
			deadline: task.deadline,
			estimated_hours: task.estimated_hours,
			difficulty_score: task.difficulty_score,
			priority_score: Math.round(priority_score * 100) / 100, // Round to 2 decimal places
			urgency_weight: Math.round(urgency_weight * 100) / 100,
			difficulty_weight: Math.round(difficulty_weight * 100) / 100,
			hours_weight: Math.round(hours_weight * 100) / 100,
		};
	});

	// Sort by priority_score (descending - higher priority first)
	prioritized.sort((a, b) => b.priority_score - a.priority_score);

	return prioritized;
}

export const PrioritizationAgent: Agent<
	PrioritizationInput,
	AgentResult<PrioritizationOutput>
> = {
	name: "PrioritizationAgent",
	description:
		"Prioritizes tasks based on deadlines, difficulty scores, and estimated hours",

	async execute(
		input: PrioritizationInput,
	): Promise<AgentResult<PrioritizationOutput>> {
		agentLogger.logStart("PrioritizationAgent", input);

		try {
			// Validate input
			const validatedInput = prioritizationInputSchema.parse(input);

			// Prioritize tasks using the prioritize function
			const prioritizedTasks = prioritize(validatedInput.tasks);

			const output: PrioritizationOutput = {
				prioritizedTasks,
			};

			agentLogger.logSuccess("PrioritizationAgent", output);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "PrioritizationAgent",
				message: "Successfully prioritized tasks",
				data: output,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			agentLogger.logError("PrioritizationAgent", errorMessage, { input });

			return {
				success: false,
				timestamp: new Date().toISOString(),
				agentName: "PrioritizationAgent",
				error: errorMessage,
			};
		}
	},
};

/**
 * Test function for PrioritizationAgent
 * Tests with various task scenarios and verifies sorting
 */
export async function testPrioritizationAgent(): Promise<void> {
	console.log("=".repeat(80));
	console.log("Testing PrioritizationAgent");
	console.log("=".repeat(80));
	console.log();

	const now = new Date();
	const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
	const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
	const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
	const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
	const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

	const testTasks: Array<TaskInput> = [
		{
			id: "task-1",
			title: "Urgent Hard Long Task",
			deadline: tomorrow.toISOString(),
			estimated_hours: 40,
			difficulty_score: 9,
		},
		{
			id: "task-2",
			title: "Far Easy Short Task",
			deadline: oneMonth.toISOString(),
			estimated_hours: 5,
			difficulty_score: 2,
		},
		{
			id: "task-3",
			title: "Urgent Easy Short Task",
			deadline: threeDays.toISOString(),
			estimated_hours: 8,
			difficulty_score: 3,
		},
		{
			id: "task-4",
			title: "Far Hard Long Task",
			deadline: twoWeeks.toISOString(),
			estimated_hours: 35,
			difficulty_score: 8,
		},
		{
			id: "task-5",
			title: "Medium Urgency Medium Task",
			deadline: oneWeek.toISOString(),
			estimated_hours: 20,
			difficulty_score: 6,
		},
		{
			id: "task-6",
			title: "Overdue Critical Task",
			deadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
			estimated_hours: 15,
			difficulty_score: 7,
		},
		{
			id: "task-7",
			title: "Very Long Easy Task",
			deadline: oneWeek.toISOString(),
			estimated_hours: 60,
			difficulty_score: 3,
		},
	];

	console.log("Input Tasks:");
	console.log("-".repeat(80));
	testTasks.forEach((task) => {
		const daysUntil = Math.ceil(
			(new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
		);
		console.log(
			`  ${task.title}: Due in ${daysUntil} days, ${task.estimated_hours}h, difficulty ${task.difficulty_score}/10`,
		);
	});
	console.log();

	// Prioritize tasks
	const prioritized = prioritize(testTasks, now);

	console.log("Prioritized Tasks (sorted by priority_score, highest first):");
	console.log("=".repeat(80));
	console.log();

	prioritized.forEach((task, index) => {
		const daysUntil = Math.ceil(
			(new Date(task.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
		);
		console.log(`${index + 1}. ${task.title || task.id}`);
		console.log(`   Priority Score: ${task.priority_score}`);
		console.log(`   Breakdown:`);
		console.log(`     - Urgency Weight: ${task.urgency_weight} (${daysUntil} days until deadline)`);
		console.log(`     - Difficulty Weight: ${task.difficulty_weight} (difficulty ${task.difficulty_score}/10)`);
		console.log(`     - Hours Weight: ${task.hours_weight} (${task.estimated_hours} hours)`);
		console.log(`   Details: Due in ${daysUntil} days, ${task.estimated_hours}h, difficulty ${task.difficulty_score}/10`);
		console.log();
	});

	// Verify sorting
	console.log("=".repeat(80));
	console.log("Verification:");
	console.log("-".repeat(80));

	let isCorrectlySorted = true;
	for (let i = 0; i < prioritized.length - 1; i++) {
		if (prioritized[i].priority_score < prioritized[i + 1].priority_score) {
			isCorrectlySorted = false;
			console.log(
				`✗ Sorting error: Task ${i + 1} (${prioritized[i].priority_score}) < Task ${i + 2} (${prioritized[i + 1].priority_score})`,
			);
		}
	}

	if (isCorrectlySorted) {
		console.log("✓ Tasks are correctly sorted by priority_score (descending)");
	}

	// Verify expected highest priority
	const highestPriority = prioritized[0];
	console.log();
	console.log(`Highest Priority Task: "${highestPriority.title || highestPriority.id}"`);
	console.log(`  Expected: Urgent Hard Long Task (due soon, hard, long hours)`);
	console.log(
		`  Actual: ${highestPriority.title} (priority: ${highestPriority.priority_score})`,
	);

	// Verify expected lowest priority
	const lowestPriority = prioritized[prioritized.length - 1];
	console.log();
	console.log(`Lowest Priority Task: "${lowestPriority.title || lowestPriority.id}"`);
	console.log(`  Expected: Far Easy Short Task (due far, easy, short hours)`);
	console.log(
		`  Actual: ${lowestPriority.title} (priority: ${lowestPriority.priority_score})`,
	);

	console.log();
	console.log("=".repeat(80));
}
