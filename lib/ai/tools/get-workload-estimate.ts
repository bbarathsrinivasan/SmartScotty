import { tool } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import { estimate } from "@/agents/workload-estimator-agent";

/**
 * Workload Estimator tool for analyzing assignment and course workload
 * 
 * This tool should be used when users ask about:
 * - How much time/workload an assignment will take
 * - How difficult an assignment is
 * - Time estimates for coursework
 * - Workload breakdown for assignments
 */
export const getWorkloadEstimate = ({ session }: { session: Session | null }) => tool({
	description: `Estimate the workload, difficulty, and time requirements for assignments or courses based on their descriptions.
	
	Use this tool when users ask about:
	- How much time/workload an assignment will take
	- How difficult an assignment is
	- Time estimates for coursework or assignments
	- Workload breakdown (reading, coding, math)
	- How to split work across days
	- "How long will this take?"
	- "What's the workload for this assignment?"
	- "How difficult is this?"
	
	This tool analyzes assignment descriptions using rule-based logic to provide consistent estimates.`,
	inputSchema: z.object({
		assignment_description: z
			.string()
			.describe("The description or details of the assignment/course to estimate workload for"),
	}),
	execute: async (input) => {
		try {
			// Get user ID from session (for future personalization)
			if (!session?.user?.id) {
				return {
					error: "User not authenticated. Please log in to get workload estimates.",
				};
			}

			// Estimate workload using the WorkloadEstimatorAgent
			const estimateResult = estimate(input.assignment_description);

			// Format response for user-friendly display
			return {
				estimated_hours: estimateResult.estimated_hours,
				difficulty_score: estimateResult.difficulty_score,
				difficulty_level: getDifficultyLevel(estimateResult.difficulty_score),
				task_type_breakdown: {
					reading: estimateResult.task_type_breakdown.reading,
					coding: estimateResult.task_type_breakdown.coding,
					math: estimateResult.task_type_breakdown.math,
				},
				recommended_split: estimateResult.recommended_split,
				days_needed: estimateResult.recommended_split.length,
				summary: formatWorkloadSummary(estimateResult),
			};
		} catch (error) {
			return {
				error:
					error instanceof Error
						? error.message
						: "An error occurred while estimating workload",
			};
		}
	},
});

/**
 * Convert difficulty score (1-10) to human-readable level
 */
function getDifficultyLevel(score: number): string {
	if (score <= 3) {
		return "Easy";
	} else if (score <= 5) {
		return "Moderate";
	} else if (score <= 7) {
		return "Challenging";
	} else if (score <= 9) {
		return "Difficult";
	} else {
		return "Very Difficult";
	}
}

/**
 * Format a user-friendly summary of the workload estimate
 */
function formatWorkloadSummary(estimate: {
	estimated_hours: number;
	difficulty_score: number;
	task_type_breakdown: { reading: number; coding: number; math: number };
	recommended_split: number[];
}): string {
	const parts: string[] = [];

	parts.push(
		`Estimated time: ${estimate.estimated_hours} hours (${estimate.recommended_split.length} days)`,
	);

	parts.push(`Difficulty: ${estimate.difficulty_score}/10`);

	const breakdown = estimate.task_type_breakdown;
	const breakdownParts: string[] = [];
	if (breakdown.reading > 0) {
		breakdownParts.push(`${breakdown.reading}h reading`);
	}
	if (breakdown.coding > 0) {
		breakdownParts.push(`${breakdown.coding}h coding`);
	}
	if (breakdown.math > 0) {
		breakdownParts.push(`${breakdown.math}h math`);
	}

	if (breakdownParts.length > 0) {
		parts.push(`Breakdown: ${breakdownParts.join(", ")}`);
	}

	return parts.join(". ");
}

