import { tool } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import { enforce } from "@/agents/safety-supervisor-agent";

/**
 * Safety Supervision tool for analyzing and enforcing Anti-AIV rules on responses
 * 
 * This tool should be used to:
 * - Check if a response contains violations (solutions, answers, code)
 * - Rewrite violations into educational guidance
 * - Ensure all responses end with guiding questions
 */
export const getSafetySupervision = ({ session }: { session: Session | null }) => tool({
	description: `Analyze a response text for Anti-AIV violations and rewrite them into educational guidance.
	
	Use this tool to:
	- Check if a response contains direct solutions, answers, or code
	- Rewrite violations into hints, thought frameworks, and conceptual explanations
	- Ensure responses always end with guiding questions
	
	This tool detects:
	- Direct solutions
	- Assignment answers (including MCQ)
	- Full code implementations
	- Step-by-step solutions
	- Numeric answers
	
	And rewrites them into educational guidance that promotes learning.`,
	inputSchema: z.object({
		response_text: z.string().describe("The response text to analyze and potentially rewrite"),
		agent_name: z.string().optional().describe("Name of the agent that produced the response (e.g., 'LearningAgent')"),
		source_context: z.object({
			question: z.string().optional().describe("Original question that prompted the response"),
			course_id: z.string().optional().describe("Course ID if applicable"),
			assignment_type: z.enum(["homework", "project", "exam", "quiz", "mcq", "coding", "theory"]).optional().describe("Type of assignment if applicable"),
		}).optional().describe("Context about the original question/request"),
	}),
	execute: async (input) => {
		try {
			if (!session?.user?.id) {
				return {
					error: "User not authenticated. Please log in to use safety supervision.",
				};
			}

			const result = enforce(
				input.response_text,
				input.agent_name,
				input.source_context,
			);

			return {
				original_text: result.original_text,
				violation_detected: result.violation_detected,
				violation_type: result.violation_type,
				rewritten_text: result.rewritten_text,
				guiding_question: result.guiding_question,
				analysis: result.analysis ? {
					confidence: result.analysis.confidence,
					detected_patterns: result.analysis.detected_patterns,
				} : undefined,
				message: result.violation_detected
					? "Violation detected and response rewritten into educational guidance"
					: "No violations detected, response is safe",
			};
		} catch (error) {
			return {
				error:
					error instanceof Error
						? error.message
						: "An error occurred while analyzing the response",
			};
		}
	},
});

