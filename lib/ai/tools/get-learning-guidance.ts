import { tool } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import { guide } from "@/agents/learning-agent";
import type { CourseContextType } from "@/agents/learning-agent";

/**
 * Learning Guidance tool (Anti-AIV) for providing educational help
 * 
 * This tool should be used when users ask about:
 * - Understanding concepts
 * - Getting help with assignments (without solutions)
 * - Learning how to approach problems
 * - Getting hints or guidance
 */
export const getLearningGuidance = ({ session }: { session: Session | null }) => tool({
	description: `Provide educational guidance, hints, and conceptual explanations while strictly refusing to provide solutions, answers, or code.
	
	Use this tool when users ask about:
	- Understanding concepts or topics
	- Getting help with assignments or problems
	- Learning how to approach a problem
	- Getting hints or guidance
	- Questions about course material
	
	IMPORTANT: This tool NEVER provides:
	- Solutions or answers
	- Complete code implementations
	- Direct numeric answers
	- Step-by-step solutions
	- MCQ answers (even if user insists)
	
	This tool ALWAYS provides:
	- Hints to guide thinking
	- Conceptual explanations
	- Guiding questions
	- Recommended thought processes
	- Next steps for the user to attempt
	
	If a user asks for a solution, answer, or code, this tool will refuse and redirect to educational guidance.`,
	inputSchema: z.object({
		question: z.string().describe("The student's question or problem they need help with"),
		course_context: z.object({
			course_id: z.string().optional().describe("Course ID (e.g., '10-601', '15-445')"),
			course_name: z.string().optional().describe("Course name"),
			topic: z.string().optional().describe("Topic or subject area"),
			assignment_type: z.enum(["homework", "project", "exam", "quiz", "mcq", "coding", "theory"]).optional().describe("Type of assignment"),
		}).optional().describe("Course context to help provide relevant guidance"),
		user_attempt: z.string().optional().describe("What the user has tried so far (helps provide targeted hints)"),
	}),
	execute: async (input) => {
		try {
			if (!session?.user?.id) {
				return {
					error: "User not authenticated. Please log in to get learning guidance.",
				};
			}

			const courseContext: CourseContextType | undefined = input.course_context
				? {
						course_id: input.course_context.course_id,
						course_name: input.course_context.course_name,
						topic: input.course_context.topic,
						assignment_type: input.course_context.assignment_type,
					}
				: undefined;

			const guidance = guide(input.question, courseContext, input.user_attempt);

			// Format response for chat
			const response: {
				message: string;
				refused?: boolean;
				refusal_reason?: string;
				guidance: {
					hints: string[];
					concepts: string[];
					guiding_questions: string[];
					thought_process: string;
					resources?: string[];
				};
				next_steps: string[];
			} = {
				message: guidance.anti_aiv_enforcement.refused
					? "I can't provide direct solutions or answers, but I can help you learn by guiding your thinking."
					: "Here's some guidance to help you work through this problem:",
				guidance: {
					hints: guidance.guidance.hints,
					concepts: guidance.guidance.concepts,
					guiding_questions: guidance.guidance.guiding_questions,
					thought_process: guidance.guidance.thought_process,
					resources: guidance.guidance.resources,
				},
				next_steps: guidance.next_steps,
			};

			if (guidance.anti_aiv_enforcement.refused) {
				response.refused = true;
				response.refusal_reason = guidance.anti_aiv_enforcement.refusal_reason;
			}

			return response;
		} catch (error) {
			return {
				error:
					error instanceof Error
						? error.message
						: "An error occurred while providing learning guidance",
			};
		}
	},
});

