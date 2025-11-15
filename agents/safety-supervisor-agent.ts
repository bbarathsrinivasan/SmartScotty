import { z } from "zod";
import type { Agent, AgentResult } from "./types";
import { agentLogger } from "./logger";

/**
 * SafetySupervisorAgent - Monitors and enforces Anti-AIV rules on agent outputs
 *
 * Purpose: Acts as a safety layer that analyzes outputs from any agent (especially
 * LearningAgent) to detect violations like direct solutions, assignment answers,
 * full code, or step-by-step solutions. Rewrites violations into educational
 * guidance (hints, thought frameworks, conceptual explanations) and always ends
 * with a guiding question.
 *
 * REAL API INTEGRATION NOTES:
 * - Could integrate with LLM-based detection for more sophisticated violation detection
 * - Could learn from user feedback to improve detection accuracy
 * - Could maintain a violation log for monitoring and improvement
 */

const safetySupervisorInputSchema = z.object({
	response_text: z.string().describe("The text output from an agent to analyze"),
	agent_name: z.string().optional().describe("Name of the agent that produced the output"),
	source_context: z
		.object({
			question: z.string().optional(),
			course_id: z.string().optional(),
			assignment_type: z.enum(["homework", "project", "exam", "quiz", "mcq", "coding", "theory"]).optional(),
		})
		.optional()
		.describe("Context about the original question/request"),
});

const safetySupervisorOutputSchema = z.object({
	original_text: z.string().describe("The original response text"),
	violation_detected: z.boolean().describe("Whether a violation was detected"),
	violation_type: z
		.enum(["solution", "answer", "code", "step_by_step", "numeric", "none"])
		.optional()
		.describe("Type of violation if detected"),
	rewritten_text: z.string().describe("The rewritten text with educational guidance"),
	guiding_question: z.string().describe("A guiding question to end the response"),
	analysis: z
		.object({
			confidence: z.number().min(0).max(1).describe("Confidence in violation detection"),
			detected_patterns: z.array(z.string()).describe("Patterns that triggered detection"),
		})
		.optional(),
});

export type SafetySupervisorInput = z.infer<typeof safetySupervisorInputSchema>;
export type SafetySupervisorOutput = z.infer<typeof safetySupervisorOutputSchema>;

/**
 * Detect violations in response text
 */
function detectViolations(responseText: string): {
	violation: boolean;
	type?: "solution" | "answer" | "code" | "step_by_step" | "numeric";
	confidence: number;
	patterns: string[];
} {
	const textLower = responseText.toLowerCase();
	const patterns: string[] = [];
	let violation = false;
	let violationType: "solution" | "answer" | "code" | "step_by_step" | "numeric" | undefined;
	let confidence = 0;

	// Solution patterns
	const solutionPatterns = [
		/here.*solution/i,
		/the solution is/i,
		/answer.*is.*[abcd0-9]/i,
		/correct answer.*[abcd]/i,
		/option [abcd].*correct/i,
		/final answer/i,
		/the answer.*[abcd0-9]/i,
	];

	// Code patterns (complete implementations)
	const codePatterns = [
		/def\s+\w+\s*\([^)]*\):\s*[\s\S]{100,}/, // Python function with substantial body
		/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{100,}/, // JavaScript function
		/class\s+\w+[\s\S]{200,}/, // Class definition
		/import.*\n[\s\S]{150,}/, // Import followed by substantial code
		/```[\s\S]{200,}```/, // Code block with substantial content
	];

	// Step-by-step solution patterns
	const stepByStepPatterns = [
		/step\s*1.*step\s*2/i,
		/step\s*1:.*step\s*2:/i,
		/first.*then.*finally/i,
		/step-by-step/i,
		/step by step/i,
		/here.*steps.*solve/i,
		/follow.*steps/i,
		/here's how.*step/i,
	];

	// Numeric answer patterns
	const numericAnswerPatterns = [
		/the value is\s+[0-9.]+/i,
		/equals\s+[0-9.]+/i,
		/result.*[0-9.]+/i,
		/answer.*[0-9.]+/i,
		/p-value.*[0-9.]+/i,
		/probability.*[0-9.]+/i,
	];

	// Check for solution patterns
	for (const pattern of solutionPatterns) {
		if (pattern.test(textLower)) {
			violation = true;
			violationType = violationType || "solution";
			patterns.push(`Solution pattern: ${pattern.source}`);
			confidence = Math.max(confidence, 0.8);
		}
	}

	// Check for code patterns
	for (const pattern of codePatterns) {
		if (pattern.test(responseText)) {
			violation = true;
			violationType = violationType || "code";
			patterns.push(`Code pattern detected`);
			confidence = Math.max(confidence, 0.9);
		}
	}

	// Check for step-by-step patterns
	for (const pattern of stepByStepPatterns) {
		if (pattern.test(textLower)) {
			violation = true;
			violationType = violationType || "step_by_step";
			patterns.push(`Step-by-step pattern: ${pattern.source}`);
			confidence = Math.max(confidence, 0.7);
		}
	}

	// Check for numeric answers
	for (const pattern of numericAnswerPatterns) {
		if (pattern.test(textLower)) {
			violation = true;
			violationType = violationType || "numeric";
			patterns.push(`Numeric answer pattern: ${pattern.source}`);
			confidence = Math.max(confidence, 0.85);
		}
	}

	// Check for MCQ answer indicators (prioritize over solution)
	if (/option [abcd].*[is|equals|correct]/i.test(textLower) || /(the )?correct answer.*option [abcd]/i.test(textLower) || /answer.*is.*option [abcd]/i.test(textLower)) {
		violation = true;
		violationType = "answer"; // Override if already set to solution
		patterns.push("MCQ answer detected");
		confidence = Math.max(confidence, 0.9);
	}

	// Check for complete code blocks
	if (responseText.includes("```") && responseText.split("```").length >= 3) {
		const codeBlocks = responseText.split("```").filter((_, i) => i % 2 === 1);
		for (const block of codeBlocks) {
			if (block.length > 200 && !block.includes("//") && !block.includes("#")) {
				// Substantial code without comments
				violation = true;
				violationType = violationType || "code";
				patterns.push("Complete code block detected");
				confidence = Math.max(confidence, 0.95);
			}
		}
	}

	return {
		violation,
		type: violationType,
		confidence: violation ? confidence : 0,
		patterns,
	};
}

/**
 * Extract topic/concepts from text
 */
function extractTopics(text: string): string[] {
	const topics: string[] = [];
	const textLower = text.toLowerCase();

	const topicKeywords = [
		"linear regression",
		"gradient descent",
		"neural network",
		"backpropagation",
		"overfitting",
		"regularization",
		"sql",
		"query",
		"normalization",
		"indexing",
		"dynamic programming",
		"graph algorithm",
		"hypothesis testing",
		"p-value",
		"probability",
	];

	for (const topic of topicKeywords) {
		if (textLower.includes(topic)) {
			topics.push(topic);
		}
	}

	return [...new Set(topics)];
}

/**
 * Generate guiding question based on topic
 */
function generateGuidingQuestion(topics: string[], violationType?: string): string {
	if (topics.includes("linear regression") || topics.includes("gradient descent")) {
		return "What happens to the cost function as you iterate through gradient descent, and why?";
	}

	if (topics.includes("overfitting") || topics.includes("regularization")) {
		return "How does model complexity relate to both training error and generalization error?";
	}

	if (topics.includes("neural network") || topics.includes("backpropagation")) {
		return "How do errors propagate backward through a neural network, and what role does the chain rule play?";
	}

	if (topics.includes("sql") || topics.includes("query")) {
		return "What data do you need to retrieve, and which tables contain that data?";
	}

	if (topics.includes("dynamic programming")) {
		return "What are the subproblems in this problem, and how do they relate to each other?";
	}

	if (topics.includes("hypothesis testing") || topics.includes("p-value")) {
		return "What does the p-value tell you about the evidence against the null hypothesis?";
	}

	if (violationType === "code") {
		return "What are the key components you need to implement, and how do they work together?";
	}

	if (violationType === "answer" || violationType === "solution") {
		return "What concepts or principles can help you work through this problem yourself?";
	}

	return "What is the problem asking you to find, and what information do you need to solve it?";
}

/**
 * Rewrite violation into educational guidance
 */
function rewriteViolation(
	originalText: string,
	violationType: "solution" | "answer" | "code" | "step_by_step" | "numeric",
	topics: string[],
): string {
	const topicsStr = topics.length > 0 ? topics.join(", ") : "this problem";

	switch (violationType) {
		case "solution":
		case "answer": {
			return `I can't provide direct solutions or answers, but I can help you think through ${topicsStr}.

Instead of giving you the answer, let me guide your thinking:
- Consider what the problem is asking you to determine
- Think about the relevant concepts from class
- Work through a simple example first
- Build up to the full solution incrementally

What specific part of the problem are you finding most challenging?`;
		}

		case "code": {
			return `I can't provide complete code implementations, but I can help you understand the concepts behind ${topicsStr}.

Instead of showing you the full code, let me guide your implementation:
- Break down the problem into smaller components
- Think about what data structures or algorithms you need
- Consider the input/output requirements
- Test each component incrementally

What part of the implementation are you stuck on?`;
		}

		case "step_by_step": {
			return `I can't provide step-by-step solutions, but I can help you develop your own approach to ${topicsStr}.

Instead of walking you through each step, let me help you think about:
- What is the overall goal or objective?
- What are the key concepts or techniques involved?
- How might you break this into smaller problems?
- What would a simple example look like?

What approach have you tried so far, and where did you get stuck?`;
		}

		case "numeric": {
			return `I can't provide exact numeric answers, but I can help you understand how to calculate it yourself for ${topicsStr}.

Instead of giving you the number, let me guide your calculation:
- What formula or method should you use?
- What information do you have, and what do you need?
- How do you set up the calculation?
- What does the result mean in context?

What specific calculation step are you unsure about?`;
		}

		default: {
			return `I need to redirect this to educational guidance. Let me help you think through ${topicsStr}:
- What concepts from class relate to this problem?
- What have you tried so far?
- What part are you finding most challenging?

What would help you make progress on this problem?`;
		}
	}
}

/**
 * Enforce function - Main entry point for safety supervision
 */
export function enforce(responseText: string, agentName?: string, sourceContext?: SafetySupervisorInput["source_context"]): SafetySupervisorOutput {
	// Detect violations
	const detection = detectViolations(responseText);
	const topics = extractTopics(responseText);

	// Generate guiding question
	const guidingQuestion = generateGuidingQuestion(topics, detection.type);

	let rewrittenText: string;

	if (detection.violation && detection.type) {
		// Rewrite violation into educational guidance
		rewrittenText = rewriteViolation(responseText, detection.type, topics);
	} else {
		// No violation, but ensure it ends with a guiding question
		if (!responseText.trim().endsWith("?") && !responseText.includes("?")) {
			rewrittenText = `${responseText}\n\n${guidingQuestion}`;
		} else {
			rewrittenText = responseText;
		}
	}

	return {
		original_text: responseText,
		violation_detected: detection.violation,
		violation_type: detection.type || "none",
		rewritten_text: rewrittenText,
		guiding_question: guidingQuestion,
		analysis: detection.violation
			? {
					confidence: detection.confidence,
					detected_patterns: detection.patterns,
				}
			: undefined,
	};
}

export const SafetySupervisorAgent: Agent<
	SafetySupervisorInput,
	AgentResult<SafetySupervisorOutput>
> = {
	name: "SafetySupervisorAgent",
	description:
		"Monitors and enforces Anti-AIV rules on agent outputs, rewriting violations into educational guidance",

	async execute(
		input: SafetySupervisorInput,
	): Promise<AgentResult<SafetySupervisorOutput>> {
		agentLogger.logStart("SafetySupervisorAgent", input);

		try {
			// Validate input
			const validatedInput = safetySupervisorInputSchema.parse(input);

			// Enforce safety rules
			const result = enforce(
				validatedInput.response_text,
				validatedInput.agent_name,
				validatedInput.source_context,
			);

			// Log if violation was detected
			if (result.violation_detected) {
				agentLogger.logAction(
					"SafetySupervisorAgent",
					"VIOLATION_DETECTED",
					`Detected ${result.violation_type} violation`,
					{
						agent_name: validatedInput.agent_name,
						violation_type: result.violation_type,
						confidence: result.analysis?.confidence,
					},
				);
			}

			agentLogger.logSuccess("SafetySupervisorAgent", result);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "SafetySupervisorAgent",
				message: result.violation_detected
					? "Violation detected and rewritten"
					: "No violations detected, response is safe",
				data: result,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			agentLogger.logError("SafetySupervisorAgent", errorMessage, { input });

			return {
				success: false,
				timestamp: new Date().toISOString(),
				agentName: "SafetySupervisorAgent",
				error: errorMessage,
			};
		}
	},
};

/**
 * Test function for SafetySupervisorAgent
 * Tests various violation scenarios and verifies enforcement
 */
export async function testSafetyAgent(): Promise<void> {
	console.log("=".repeat(80));
	console.log("Testing SafetySupervisorAgent");
	console.log("=".repeat(80));
	console.log();

	const testCases = [
		{
			name: "Direct Solution Response",
			response_text: "The solution is to use gradient descent. Here's how: Step 1: Initialize weights. Step 2: Calculate gradient. Step 3: Update weights. Step 4: Repeat until convergence. The answer is option B.",
			agent_name: "LearningAgent",
			expected_violation: true,
			expected_type: "solution" as const,
		},
		{
			name: "Complete Code Response",
			response_text: `Here's the complete code:
\`\`\`python
def linear_regression(X, y):
    m, n = X.shape
    weights = np.zeros(n)
    bias = 0
    learning_rate = 0.01
    for i in range(1000):
        predictions = X.dot(weights) + bias
        error = predictions - y
        weights -= learning_rate * X.T.dot(error) / m
        bias -= learning_rate * np.mean(error)
    return weights, bias
\`\`\``,
			agent_name: "LearningAgent",
			expected_violation: true,
			expected_type: "code" as const,
		},
		{
			name: "MCQ Answer Response",
			response_text: "The correct answer is option A. In linear regression, the cost function always decreases when using gradient descent because we're moving in the direction of the negative gradient.",
			agent_name: "LearningAgent",
			expected_violation: true,
			expected_type: "answer" as const,
		},
		{
			name: "Step-by-Step Solution",
			response_text: "Here's how to solve this problem step by step:\nStep 1: Calculate the mean\nStep 2: Calculate the variance\nStep 3: Apply the formula\nStep 4: The result is 0.05",
			agent_name: "LearningAgent",
			expected_violation: true,
			expected_type: "step_by_step" as const,
		},
		{
			name: "Numeric Answer Response",
			response_text: "The p-value for this hypothesis test is 0.0234. The test statistic is 2.5 with 10 degrees of freedom, so the exact p-value equals 0.0234.",
			agent_name: "LearningAgent",
			expected_violation: true,
			expected_type: "numeric" as const,
		},
		{
			name: "Safe Educational Response",
			response_text: "To understand linear regression, think about how the cost function measures prediction error. Consider what happens when you adjust the model parameters. What role does the learning rate play in convergence?",
			agent_name: "LearningAgent",
			expected_violation: false,
		},
		{
			name: "Response with Hints (Should Pass)",
			response_text: "Here are some hints to help you:\n1. Think about what the cost function represents\n2. Consider the relationship between learning rate and convergence\n3. What happens to the gradient as you approach the minimum?",
			agent_name: "LearningAgent",
			expected_violation: false,
		},
		{
			name: "Response Missing Guiding Question",
			response_text: "Linear regression uses gradient descent to minimize the cost function. The gradient tells you the direction of steepest ascent.",
			agent_name: "LearningAgent",
			expected_violation: false,
		},
	];

	for (const testCase of testCases) {
		console.log(`Test: ${testCase.name}`);
		console.log("-".repeat(80));
		console.log(`Original Response (first 150 chars): ${testCase.response_text.slice(0, 150)}...`);
		console.log();

		const result = enforce(
			testCase.response_text,
			testCase.agent_name,
			testCase.expected_violation
				? {
						assignment_type: "homework",
						course_id: "10-601",
					}
				: undefined,
		);

		// Check violation detection
		const violationCorrect = result.violation_detected === testCase.expected_violation;
		const typeCorrect = !testCase.expected_violation || result.violation_type === testCase.expected_type;

		if (violationCorrect && typeCorrect) {
			console.log(`✓ Violation detection: ${result.violation_detected ? "DETECTED" : "NONE"} (as expected)`);
			if (result.violation_detected) {
				console.log(`  Type: ${result.violation_type}`);
				console.log(`  Confidence: ${result.analysis?.confidence || 0}`);
			}
		} else {
			console.log(
				`✗ Violation detection: ${result.violation_detected ? "DETECTED" : "NONE"} (expected ${testCase.expected_violation ? "DETECTED" : "NONE"})`,
			);
			if (testCase.expected_violation && result.violation_type !== testCase.expected_type) {
				console.log(`  Type mismatch: got ${result.violation_type}, expected ${testCase.expected_type}`);
			}
		}

		console.log();
		console.log("Rewritten Response:");
		console.log("-".repeat(80));
		console.log(result.rewritten_text.slice(0, 300));
		if (result.rewritten_text.length > 300) {
			console.log("...");
		}
		console.log();
		console.log(`Guiding Question: ${result.guiding_question}`);
		console.log();

		// Verify guiding question is present
		if (result.rewritten_text.includes(result.guiding_question) || result.rewritten_text.endsWith("?")) {
			console.log("✓ Guiding question included in response");
		} else {
			console.log("✗ Guiding question may be missing");
		}
		console.log();
	}

	console.log("=".repeat(80));
	console.log("Summary");
	console.log("=".repeat(80));
	const violationCount = testCases.filter((tc) => tc.expected_violation).length;
	const detectedCount = testCases.filter(
		(tc) =>
			enforce(tc.response_text, tc.agent_name).violation_detected === tc.expected_violation,
	).length;
	console.log(`Total test cases: ${testCases.length}`);
	console.log(`Cases with expected violations: ${violationCount}`);
	console.log(`Correctly detected: ${detectedCount}/${testCases.length}`);
	if (detectedCount === testCases.length) {
		console.log("✓ All violations correctly detected and handled");
	} else {
		console.log(`✗ Some violations may have been missed or incorrectly flagged`);
	}
	console.log();
	console.log("=".repeat(80));
}
