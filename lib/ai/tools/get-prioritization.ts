import { tool } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import { prioritize } from "@/agents/prioritization-agent";

/**
 * Prioritization tool for ranking tasks by priority
 * 
 * This tool should be used when users ask about:
 * - Which tasks to do first
 * - Prioritizing assignments
 * - What to work on next
 * - Task prioritization based on deadlines, difficulty, and workload
 */
export const getPrioritization = ({ session }: { session: Session | null }) => tool({
	description: `Prioritize tasks/assignments based on deadlines, difficulty scores, and estimated hours.
	
	Use this tool when users ask about:
	- Which tasks to do first
	- Prioritizing assignments or coursework
	- What to work on next
	- Ranking tasks by priority
	- "What should I prioritize?"
	- "Which assignment should I do first?"
	- "Help me prioritize my tasks"
	
	This tool computes priority scores using urgency (deadline proximity), difficulty, and workload (estimated hours).
	Tasks are returned sorted by priority (highest priority first).`,
	inputSchema: z.object({
		tasks: z
			.array(
				z.object({
					id: z.string().describe("Unique identifier for the task"),
					title: z.string().optional().describe("Task title or name"),
					deadline: z
						.string()
						.describe("ISO 8601 format deadline (e.g., '2024-10-15T23:59:59Z')"),
					estimated_hours: z
						.number()
						.describe("Estimated hours to complete the task"),
					difficulty_score: z
						.number()
						.min(1)
						.max(10)
						.describe("Difficulty rating from 1 (easy) to 10 (very difficult)"),
				}),
			)
			.describe("Array of tasks to prioritize"),
	}),
	execute: async (input) => {
		try {
			// Get user ID from session (for future personalization)
			if (!session?.user?.id) {
				return {
					error: "User not authenticated. Please log in to prioritize tasks.",
				};
			}

			// Prioritize tasks
			const prioritized = prioritize(input.tasks);

			// Format response for user-friendly display
			return {
				prioritizedTasks: prioritized.map((task) => ({
					id: task.id,
					title: task.title || task.id,
					deadline: task.deadline,
					estimated_hours: task.estimated_hours,
					difficulty_score: task.difficulty_score,
					priority_score: task.priority_score,
					urgency_weight: task.urgency_weight,
					difficulty_weight: task.difficulty_weight,
					hours_weight: task.hours_weight,
					days_until_deadline: Math.ceil(
						(new Date(task.deadline).getTime() - new Date().getTime()) /
							(1000 * 60 * 60 * 24),
					),
				})),
				summary: {
					total_tasks: prioritized.length,
					highest_priority: prioritized[0]?.title || prioritized[0]?.id,
					highest_priority_score: prioritized[0]?.priority_score,
					lowest_priority: prioritized[prioritized.length - 1]?.title ||
						prioritized[prioritized.length - 1]?.id,
					lowest_priority_score: prioritized[prioritized.length - 1]?.priority_score,
				},
			};
		} catch (error) {
			return {
				error:
					error instanceof Error
						? error.message
						: "An error occurred while prioritizing tasks",
			};
		}
	},
});

