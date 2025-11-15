import { z } from "zod";
import type { Agent, AgentResult, Task } from "./types";
import { agentLogger } from "./logger";

/**
 * PrioritizationAgent - Prioritizes tasks based on deadlines, importance, and dependencies
 *
 * Purpose: Analyzes tasks and assigns priority scores based on multiple factors
 * including deadlines, importance, dependencies, and workload to help users
 * focus on the most critical tasks first.
 */

const prioritizationInputSchema = z.object({
	tasks: z.array(
		z.object({
			id: z.string(),
			title: z.string(),
			dueDate: z.string(),
			estimatedHours: z.number(),
			importance: z.number().min(1).max(10).optional(),
			dependencies: z.array(z.string()).optional(),
			courseId: z.string().optional(),
			type: z.enum(["assignment", "project", "exam", "reading", "other"]).optional(),
		}),
	),
	preferences: z
		.object({
			deadlineWeight: z.number().min(0).max(1).default(0.4),
			importanceWeight: z.number().min(0).max(1).default(0.3),
			workloadWeight: z.number().min(0).max(1).default(0.3),
		})
		.optional(),
});

const prioritizationOutputSchema = z.object({
	prioritizedTasks: z.array(
		z.object({
			taskId: z.string(),
			priority: z.number().min(0).max(100),
			rank: z.number(),
			reasoning: z.string(),
			urgency: z.enum(["low", "medium", "high", "critical"]),
			recommendedStartDate: z.string().optional(),
		}),
	),
	summary: z.object({
		criticalCount: z.number(),
		highCount: z.number(),
		mediumCount: z.number(),
		lowCount: z.number(),
	}),
});

export type PrioritizationInput = z.infer<typeof prioritizationInputSchema>;
export type PrioritizationOutput = z.infer<typeof prioritizationOutputSchema>;

export const PrioritizationAgent: Agent<
	PrioritizationInput,
	AgentResult<PrioritizationOutput>
> = {
	name: "PrioritizationAgent",
	description:
		"Prioritizes tasks based on deadlines, importance, dependencies, and user preferences",

	async execute(
		input: PrioritizationInput,
	): Promise<AgentResult<PrioritizationOutput>> {
		agentLogger.logStart("PrioritizationAgent", input);

		try {
			// Validate input
			const validatedInput = prioritizationInputSchema.parse(input);

			const now = new Date();
			const preferences = validatedInput.preferences || {
				deadlineWeight: 0.4,
				importanceWeight: 0.3,
				workloadWeight: 0.3,
			};

			// Calculate priority for each task
			const prioritizedTasks = validatedInput.tasks
				.map((task) => {
					const dueDate = new Date(task.dueDate);
					const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

					// Deadline score (closer = higher priority)
					const deadlineScore = Math.max(0, 100 - daysUntilDue * 5);
					const normalizedDeadlineScore = Math.min(100, deadlineScore);

					// Importance score
					const importanceScore = (task.importance || 5) * 10;

					// Workload score (more hours = higher priority if deadline is close)
					const workloadScore = daysUntilDue < 7 ? task.estimatedHours * 2 : task.estimatedHours;

					// Calculate weighted priority
					const priority =
						normalizedDeadlineScore * preferences.deadlineWeight +
						importanceScore * preferences.importanceWeight +
						Math.min(100, workloadScore * 2) * preferences.workloadWeight;

					// Determine urgency
					let urgency: "low" | "medium" | "high" | "critical" = "medium";
					if (daysUntilDue < 1) {
						urgency = "critical";
					} else if (daysUntilDue < 3) {
						urgency = "high";
					} else if (daysUntilDue < 7) {
						urgency = "medium";
					} else {
						urgency = "low";
					}

					// Generate reasoning
					const reasoning = `Due in ${Math.round(daysUntilDue)} days, importance: ${task.importance || 5}/10, estimated: ${task.estimatedHours}h`;

					return {
						taskId: task.id,
						priority: Math.round(priority),
						rank: 0, // Will be set after sorting
						reasoning,
						urgency,
						recommendedStartDate:
							daysUntilDue > task.estimatedHours / 8
								? new Date(
										now.getTime() + (daysUntilDue - task.estimatedHours / 8) * 24 * 60 * 60 * 1000,
									).toISOString()
								: undefined,
					};
				})
				.sort((a, b) => b.priority - a.priority)
				.map((task, index) => ({
					...task,
					rank: index + 1,
				}));

			// Count by urgency
			const summary = {
				criticalCount: prioritizedTasks.filter((t) => t.urgency === "critical").length,
				highCount: prioritizedTasks.filter((t) => t.urgency === "high").length,
				mediumCount: prioritizedTasks.filter((t) => t.urgency === "medium").length,
				lowCount: prioritizedTasks.filter((t) => t.urgency === "low").length,
			};

			const mockOutput: PrioritizationOutput = {
				prioritizedTasks,
				summary,
			};

			agentLogger.logSuccess("PrioritizationAgent", mockOutput);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "PrioritizationAgent",
				message: "Successfully prioritized tasks",
				data: mockOutput,
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

