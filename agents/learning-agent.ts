import { z } from "zod";
import type { Agent, AgentResult } from "./types";
import { agentLogger } from "./logger";

/**
 * LearningAgent (Anti-AIV) - Learns from user behavior and preferences
 *
 * Purpose: Observes user interactions, study patterns, and preferences to
 * continuously improve recommendations and personalize the assistant's behavior.
 * Named "Anti-AIV" to emphasize learning and adaptation rather than static
 * artificial intelligence.
 */

const learningAgentInputSchema = z.object({
	action: z.enum(["observe", "learn", "getRecommendations", "updateModel"]),
	observation: z
		.object({
			eventType: z.enum([
				"task_completed",
				"task_scheduled",
				"preference_changed",
				"study_session",
				"deadline_met",
				"deadline_missed",
			]),
			data: z.record(z.unknown()),
			timestamp: z.string(),
		})
		.optional(),
	userId: z.string(),
	context: z.record(z.unknown()).optional(),
});

const learningAgentOutputSchema = z.object({
	insights: z
		.array(
			z.object({
				type: z.string(),
				description: z.string(),
				confidence: z.number().min(0).max(1),
			}),
		)
		.optional(),
	recommendations: z
		.array(
			z.object({
				category: z.string(),
				suggestion: z.string(),
				reason: z.string(),
				priority: z.enum(["low", "medium", "high"]),
			}),
		)
		.optional(),
	modelUpdated: z.boolean().optional(),
	userProfile: z
		.object({
			preferredStudyTimes: z.array(z.string()).optional(),
			averageSessionLength: z.number().optional(),
			productivityPatterns: z.array(z.string()).optional(),
			commonTaskTypes: z.array(z.string()).optional(),
		})
		.optional(),
	message: z.string(),
});

export type LearningAgentInput = z.infer<typeof learningAgentInputSchema>;
export type LearningAgentOutput = z.infer<typeof learningAgentOutputSchema>;

export const LearningAgent: Agent<
	LearningAgentInput,
	AgentResult<LearningAgentOutput>
> = {
	name: "LearningAgent",
	description:
		"Learns from user behavior and preferences to continuously improve recommendations (Anti-AIV)",

	async execute(
		input: LearningAgentInput,
	): Promise<AgentResult<LearningAgentOutput>> {
		agentLogger.logStart("LearningAgent", input);

		try {
			// Validate input
			const validatedInput = learningAgentInputSchema.parse(input);

			let mockOutput: LearningAgentOutput;

			switch (validatedInput.action) {
				case "observe": {
					if (!validatedInput.observation) {
						throw new Error("Observation data required for observe action");
					}

					agentLogger.logAction(
						"LearningAgent",
						"OBSERVE",
						`Observed ${validatedInput.observation.eventType}`,
						validatedInput.observation.data,
					);

					mockOutput = {
						message: "Observation recorded successfully",
					};
					break;
				}

				case "learn": {
					// Mock learning process
					const insights: LearningAgentOutput["insights"] = [
						{
							type: "study_pattern",
							description: "User prefers morning study sessions",
							confidence: 0.75,
						},
						{
							type: "task_completion",
							description: "User completes assignments 2 days before deadline on average",
							confidence: 0.65,
						},
					];

					mockOutput = {
						insights,
						message: "Learning completed, insights generated",
					};
					break;
				}

				case "getRecommendations": {
					const recommendations: LearningAgentOutput["recommendations"] = [
						{
							category: "scheduling",
							suggestion: "Schedule high-priority tasks in the morning",
							reason: "Based on your productivity patterns",
							priority: "high",
						},
						{
							category: "study_habits",
							suggestion: "Take breaks every 2 hours",
							reason: "Optimal for maintaining focus",
							priority: "medium",
						},
					];

					const userProfile: LearningAgentOutput["userProfile"] = {
						preferredStudyTimes: ["morning", "afternoon"],
						averageSessionLength: 2.5,
						productivityPatterns: ["morning_peak", "afternoon_steady"],
						commonTaskTypes: ["assignment", "project", "reading"],
					};

					mockOutput = {
						recommendations,
						userProfile,
						message: "Recommendations generated based on learned patterns",
					};
					break;
				}

				case "updateModel": {
					mockOutput = {
						modelUpdated: true,
						message: "Learning model updated successfully",
					};
					break;
				}

				default:
					throw new Error(`Unknown action: ${validatedInput.action}`);
			}

			agentLogger.logSuccess("LearningAgent", mockOutput);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "LearningAgent",
				message: mockOutput.message,
				data: mockOutput,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			agentLogger.logError("LearningAgent", errorMessage, { input });

			return {
				success: false,
				timestamp: new Date().toISOString(),
				agentName: "LearningAgent",
				error: errorMessage,
			};
		}
	},
};

