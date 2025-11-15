import { z } from "zod";
import type { Agent, AgentResult, Task } from "./types";
import { agentLogger } from "./logger";

/**
 * WorkloadEstimatorAgent - Estimates time and effort required for tasks
 *
 * Purpose: Analyzes assignments, projects, and study tasks to estimate the
 * amount of time and effort required, helping users plan their workload.
 */

const workloadEstimatorInputSchema = z.object({
	tasks: z.array(
		z.object({
			id: z.string(),
			title: z.string(),
			description: z.string().optional(),
			type: z.enum(["assignment", "project", "exam", "reading", "other"]),
			difficulty: z.enum(["easy", "medium", "hard"]).optional(),
			complexity: z.number().min(1).max(10).optional(),
		}),
	),
	userProfile: z
		.object({
			experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
			averagePace: z.number().optional(), // hours per task type
		})
		.optional(),
});

const workloadEstimatorOutputSchema = z.object({
	estimates: z.array(
		z.object({
			taskId: z.string(),
			estimatedHours: z.number(),
			confidence: z.number().min(0).max(1),
			breakdown: z
				.object({
					research: z.number().optional(),
					implementation: z.number().optional(),
					testing: z.number().optional(),
					writing: z.number().optional(),
					review: z.number().optional(),
				})
				.optional(),
			recommendations: z.array(z.string()).optional(),
		}),
	),
	totalEstimatedHours: z.number(),
	workloadLevel: z.enum(["light", "moderate", "heavy", "overloaded"]),
});

export type WorkloadEstimatorInput = z.infer<typeof workloadEstimatorInputSchema>;
export type WorkloadEstimatorOutput = z.infer<typeof workloadEstimatorOutputSchema>;

export const WorkloadEstimatorAgent: Agent<
	WorkloadEstimatorInput,
	AgentResult<WorkloadEstimatorOutput>
> = {
	name: "WorkloadEstimatorAgent",
	description:
		"Estimates time and effort required for tasks based on type, difficulty, and user profile",

	async execute(
		input: WorkloadEstimatorInput,
	): Promise<AgentResult<WorkloadEstimatorOutput>> {
		agentLogger.logStart("WorkloadEstimatorAgent", input);

		try {
			// Validate input
			const validatedInput = workloadEstimatorInputSchema.parse(input);

			// Mock implementation - estimates based on task type and difficulty
			const estimates = validatedInput.tasks.map((task) => {
				let baseHours = 5; // Default base hours

				// Adjust based on task type
				switch (task.type) {
					case "assignment":
						baseHours = 8;
						break;
					case "project":
						baseHours = 20;
						break;
					case "exam":
						baseHours = 10;
						break;
					case "reading":
						baseHours = 3;
						break;
					default:
						baseHours = 5;
				}

				// Adjust based on difficulty
				if (task.difficulty === "easy") {
					baseHours *= 0.7;
				} else if (task.difficulty === "hard") {
					baseHours *= 1.5;
				}

				// Adjust based on complexity if provided
				if (task.complexity) {
					baseHours *= task.complexity / 5;
				}

				const estimatedHours = Math.round(baseHours * 10) / 10;

				return {
					taskId: task.id,
					estimatedHours,
					confidence: 0.75,
					breakdown: {
						research: task.type === "project" ? estimatedHours * 0.3 : undefined,
						implementation:
							task.type === "assignment" || task.type === "project"
								? estimatedHours * 0.5
								: undefined,
						testing:
							task.type === "assignment" || task.type === "project"
								? estimatedHours * 0.2
								: undefined,
					},
					recommendations: [
						"Start early to avoid last-minute stress",
						"Break into smaller subtasks",
					],
				};
			});

			const totalEstimatedHours = estimates.reduce(
				(sum, est) => sum + est.estimatedHours,
				0,
			);

			// Determine workload level
			let workloadLevel: "light" | "moderate" | "heavy" | "overloaded" = "moderate";
			if (totalEstimatedHours < 20) {
				workloadLevel = "light";
			} else if (totalEstimatedHours < 40) {
				workloadLevel = "moderate";
			} else if (totalEstimatedHours < 60) {
				workloadLevel = "heavy";
			} else {
				workloadLevel = "overloaded";
			}

			const mockOutput: WorkloadEstimatorOutput = {
				estimates,
				totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
				workloadLevel,
			};

			agentLogger.logSuccess("WorkloadEstimatorAgent", mockOutput);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "WorkloadEstimatorAgent",
				message: "Successfully estimated workload",
				data: mockOutput,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			agentLogger.logError("WorkloadEstimatorAgent", errorMessage, { input });

			return {
				success: false,
				timestamp: new Date().toISOString(),
				agentName: "WorkloadEstimatorAgent",
				error: errorMessage,
			};
		}
	},
};

