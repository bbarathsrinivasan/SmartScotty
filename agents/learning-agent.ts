import { z } from "zod";
import type { Agent, AgentResult } from "./types";
import { agentLogger } from "./logger";
import type { CourseContext } from "./mock-assignments";

/**
 * LearningAgent (Anti-AIV) - Provides educational guidance without solutions
 *
 * Purpose: Helps students learn by providing hints, conceptual explanations,
 * guiding questions, and thought processes while strictly refusing to provide
 * solutions, final code, direct answers, or step-by-step solutions.
 *
 * ANTI-AIV RULES:
 * - NO solutions
 * - NO final code
 * - NO direct numeric answers
 * - NO step-by-step solutions to assignments
 * - ONLY provide: hints, concepts, guiding questions, thought processes
 * - ALWAYS ask user to attempt intermediate steps
 * - DENY even when user insists/forces
 */

const courseContextSchema = z.object({
	course_id: z.string().optional(),
	course_name: z.string().optional(),
	topic: z.string().optional(),
	assignment_type: z
		.enum(["homework", "project", "exam", "quiz", "mcq", "coding", "theory"])
		.optional(),
});

const learningAgentInputSchema = z.object({
	question: z.string().describe("Student's question or problem statement"),
	course_context: courseContextSchema.optional(),
	user_attempt: z.string().optional().describe("What the user has tried so far"),
});

const learningAgentOutputSchema = z.object({
	guidance: z.object({
		hints: z.array(z.string()).describe("Hints to guide thinking"),
		concepts: z.array(z.string()).describe("Relevant concepts to review"),
		guiding_questions: z.array(z.string()).describe("Questions to help the user think through the problem"),
		thought_process: z.string().describe("Recommended approach/thought process"),
		resources: z.array(z.string()).optional().describe("Recommended resources to review"),
	}),
	anti_aiv_enforcement: z.object({
		refused: z.boolean().describe("Whether any direct answer was refused"),
		refusal_reason: z.string().optional().describe("Reason for refusal if applicable"),
	}),
	next_steps: z.array(z.string()).describe("Suggested intermediate steps for the user to attempt"),
});

export type LearningAgentInput = z.infer<typeof learningAgentInputSchema>;
export type LearningAgentOutput = z.infer<typeof learningAgentOutputSchema>;
export type CourseContextType = z.infer<typeof courseContextSchema>;

/**
 * Detect if question requests a solution, answer, or code
 */
function detectAntiAIVViolation(question: string): {
	violation: boolean;
	type?: "solution" | "answer" | "code" | "step_by_step" | "mcq_answer" | "numeric";
	severity: "high" | "medium" | "low";
} {
	const questionLower = question.toLowerCase();

	// High severity violations - direct requests
	const directSolutionPatterns = [
		/give me the solution/i,
		/provide the solution/i,
		/show me the solution/i,
		/what is the solution/i,
		/solve this/i,
		/solve it/i,
		/complete solution/i,
		/full solution/i,
	];

	const directAnswerPatterns = [
		/give me the answer/i,
		/what is the answer/i,
		/tell me the answer/i,
		/provide the answer/i,
		/the answer is/i,
		/exact answer/i,
		/direct answer/i,
	];

	const codeSolutionPatterns = [
		/give me the code/i,
		/provide the code/i,
		/show me the code/i,
		/write.*complete.*code/i,
		/full code/i,
		/entire code/i,
		/complete.*implementation/i,
		/full.*implementation/i,
		/give me.*complete.*query/i,
		/provide.*complete.*query/i,
		/write.*complete.*query/i,
		/full.*query/i,
		/complete.*query/i,
	];

	const stepByStepPatterns = [
		/step-by-step/i,
		/step by step/i,
		/show me.*steps/i,
		/walk me through/i,
		/guide me through/i,
	];

	const mcqAnswerPatterns = [
		/which.*answer/i,
		/what.*option/i,
		/select.*option/i,
		/choose.*answer/i,
		/mcq.*answer/i,
		/multiple choice.*answer/i,
		/option [abcd]/i,
		/answer.*[abcd]/i,
	];

	const numericAnswerPatterns = [
		/calculate.*exact/i,
		/compute.*exact/i,
		/what.*value/i,
		/exact.*value/i,
		/numeric.*answer/i,
	];

	// Check for violations
	for (const pattern of directSolutionPatterns) {
		if (pattern.test(questionLower)) {
			return { violation: true, type: "solution", severity: "high" };
		}
	}

	for (const pattern of directAnswerPatterns) {
		if (pattern.test(questionLower)) {
			return { violation: true, type: "answer", severity: "high" };
		}
	}

	for (const pattern of codeSolutionPatterns) {
		if (pattern.test(questionLower)) {
			return { violation: true, type: "code", severity: "high" };
		}
	}

	for (const pattern of stepByStepPatterns) {
		if (pattern.test(questionLower)) {
			return { violation: true, type: "step_by_step", severity: "medium" };
		}
	}

	for (const pattern of mcqAnswerPatterns) {
		if (pattern.test(questionLower)) {
			return { violation: true, type: "mcq_answer", severity: "high" };
		}
	}

	for (const pattern of numericAnswerPatterns) {
		if (pattern.test(questionLower)) {
			return { violation: true, type: "numeric", severity: "high" };
		}
	}

	// Check for MCQ format (A) B) C) D) or similar)
	if (/[abcd]\)/i.test(questionLower) && /what.*answer|which.*option|select/i.test(questionLower)) {
		return { violation: true, type: "mcq_answer", severity: "high" };
	}

	return { violation: false, severity: "low" };
}

/**
 * Extract topic/concepts from question
 */
function extractTopics(question: string, courseContext?: CourseContextType): string[] {
	const topics: string[] = [];

	// Use course context if available
	if (courseContext?.topic) {
		topics.push(courseContext.topic);
	}

	// Common ML topics
	const mlTopics = [
		"linear regression",
		"gradient descent",
		"backpropagation",
		"neural network",
		"overfitting",
		"underfitting",
		"regularization",
		"cross validation",
		"feature engineering",
		"data preprocessing",
		"loss function",
		"activation function",
	];

	// Common DB topics
	const dbTopics = [
		"sql",
		"query",
		"normalization",
		"indexing",
		"b+ tree",
		"transaction",
		"acid",
		"relational model",
	];

	// Common algorithm topics
	const algoTopics = [
		"dynamic programming",
		"graph algorithm",
		"dijkstra",
		"complexity",
		"time complexity",
		"space complexity",
		"recursion",
		"sorting",
	];

	// Common stats topics
	const statsTopics = [
		"hypothesis testing",
		"p-value",
		"t-test",
		"z-test",
		"confidence interval",
		"probability",
		"normal distribution",
		"statistical test",
	];

	const allTopics = [...mlTopics, ...dbTopics, ...algoTopics, ...statsTopics];
	const questionLower = question.toLowerCase();

	for (const topic of allTopics) {
		if (questionLower.includes(topic)) {
			topics.push(topic);
		}
	}

	return [...new Set(topics)]; // Remove duplicates
}

/**
 * Generate hints based on topic
 */
function generateHints(topics: string[], question: string, userAttempt?: string): string[] {
	const hints: string[] = [];

	if (topics.includes("linear regression")) {
		hints.push("Think about what the cost function represents and how it changes with each iteration.");
		hints.push("Consider the relationship between the learning rate and convergence.");
		hints.push("What happens to the gradient as you approach the minimum?");
	}

	if (topics.includes("gradient descent")) {
		hints.push("Remember that gradient descent moves in the direction opposite to the gradient.");
		hints.push("Consider how the learning rate affects the step size.");
		hints.push("Think about what conditions ensure convergence.");
	}

	if (topics.includes("overfitting") || topics.includes("underfitting")) {
		hints.push("Consider the relationship between model complexity and generalization.");
		hints.push("Think about the bias-variance tradeoff.");
		hints.push("What happens when your model performs well on training data but poorly on test data?");
	}

	if (topics.includes("neural network") || topics.includes("backpropagation")) {
		hints.push("Remember that backpropagation is about computing gradients using the chain rule.");
		hints.push("Think about how errors propagate backward through the network.");
		hints.push("Consider the role of activation functions in gradient flow.");
	}

	if (topics.includes("regularization")) {
		hints.push("Think about what L1 and L2 regularization do to the model parameters.");
		hints.push("Consider when you might want to use one over the other.");
		hints.push("What problem is regularization trying to solve?");
	}

	if (topics.includes("sql") || topics.includes("query")) {
		hints.push("Break down the query into smaller parts: what data do you need, from which tables?");
		hints.push("Consider using JOINs, WHERE clauses, and aggregations step by step.");
		hints.push("Think about the order of operations in SQL.");
	}

	if (topics.includes("normalization")) {
		hints.push("Think about functional dependencies and how they relate to normalization forms.");
		hints.push("Consider what anomalies each normal form prevents.");
		hints.push("What makes BCNF different from 3NF?");
	}

	if (topics.includes("dynamic programming")) {
		hints.push("Think about what subproblems you need to solve.");
		hints.push("Consider the base cases and how to build up from smaller problems.");
		hints.push("What information do you need to store in your DP table?");
	}

	if (topics.includes("graph algorithm") || topics.includes("dijkstra")) {
		hints.push("Think about what data structure helps you efficiently find the next node to process.");
		hints.push("Consider how you update distances as you explore the graph.");
		hints.push("What makes Dijkstra's algorithm different from BFS?");
	}

	if (topics.includes("hypothesis testing") || topics.includes("p-value")) {
		hints.push("Think about what the null hypothesis represents.");
		hints.push("Consider what a p-value tells you about the evidence against the null hypothesis.");
		hints.push("What does the significance level determine?");
	}

	if (topics.includes("probability") || topics.includes("normal distribution")) {
		hints.push("Think about how to standardize the distribution.");
		hints.push("Consider what the z-score or t-score represents.");
		hints.push("What tables or functions can help you find probabilities?");
	}

	// Generic hints if no specific topic matches
	if (hints.length === 0) {
		hints.push("Break the problem down into smaller, manageable parts.");
		hints.push("Think about what concepts from class relate to this problem.");
		hints.push("Consider what you already know and what information you're missing.");
	}

	// Add user-specific hints if they've attempted something
	if (userAttempt) {
		hints.push(`You mentioned you tried: "${userAttempt}". Think about what might be missing or what could be improved in that approach.`);
	}

	return hints;
}

/**
 * Generate guiding questions
 */
function generateGuidingQuestions(topics: string[], question: string): string[] {
	const questions: string[] = [];

	if (topics.includes("linear regression") || topics.includes("gradient descent")) {
		questions.push("What is the goal of the optimization process?");
		questions.push("How does the cost function relate to the model's predictions?");
		questions.push("What happens if the learning rate is too large or too small?");
	}

	if (topics.includes("overfitting") || topics.includes("regularization")) {
		questions.push("What is the difference between training error and generalization error?");
		questions.push("How does model complexity affect both?");
		questions.push("What techniques can help balance this tradeoff?");
	}

	if (topics.includes("neural network")) {
		questions.push("What is the purpose of each layer in the network?");
		questions.push("How do weights and biases affect the output?");
		questions.push("What role do activation functions play?");
	}

	if (topics.includes("sql") || topics.includes("query")) {
		questions.push("What data do you need to retrieve?");
		questions.push("Which tables contain this data?");
		questions.push("How are the tables related?");
		questions.push("What conditions or filters do you need to apply?");
	}

	if (topics.includes("dynamic programming")) {
		questions.push("What are the subproblems in this problem?");
		questions.push("How do smaller subproblems relate to larger ones?");
		questions.push("What is the base case?");
		questions.push("How do you combine solutions to subproblems?");
	}

	if (topics.includes("hypothesis testing")) {
		questions.push("What is your null hypothesis?");
		questions.push("What is your alternative hypothesis?");
		questions.push("What test statistic is appropriate?");
		questions.push("What does the p-value tell you?");
	}

	// Generic questions
	if (questions.length === 0) {
		questions.push("What is the problem asking you to find or determine?");
		questions.push("What information do you have?");
		questions.push("What information do you need?");
		questions.push("What concepts or techniques from class relate to this problem?");
	}

	return questions;
}

/**
 * Generate thought process recommendation
 */
function generateThoughtProcess(topics: string[], question: string, userAttempt?: string): string {
	if (topics.includes("linear regression") || topics.includes("gradient descent")) {
		return `Start by understanding what the cost function measures. Then think about how gradient descent uses the gradient to update parameters. Consider the learning rate's role in convergence. Work through a simple example with 2-3 iterations to see the pattern.`;
	}

	if (topics.includes("overfitting") || topics.includes("regularization")) {
		return `First, understand the bias-variance tradeoff. Then think about how model complexity affects both training and test performance. Consider what techniques can help: regularization, cross-validation, early stopping. Think about when each technique is most appropriate.`;
	}

	if (topics.includes("neural network") || topics.includes("backpropagation")) {
		return `Start with the forward pass: how does input flow through the network? Then think about the backward pass: how do errors propagate? Consider the chain rule and how gradients are computed. Work through a simple 2-layer example step by step.`;
	}

	if (topics.includes("sql") || topics.includes("query")) {
		return `Break down the query: identify what data you need, which tables contain it, and how they're related. Start with a simple SELECT, then add JOINs, WHERE conditions, and aggregations. Test each part incrementally.`;
	}

	if (topics.includes("dynamic programming")) {
		return `Identify the subproblems and how they relate. Determine the base case(s). Think about what information you need to store (DP table). Consider the order of computation (bottom-up or top-down). Work through a small example to verify your approach.`;
	}

	if (topics.includes("hypothesis testing")) {
		return `First, clearly state your null and alternative hypotheses. Choose the appropriate test based on your data and assumptions. Calculate the test statistic. Determine the p-value or critical value. Interpret the result in context.`;
	}

	return `Break the problem into smaller parts. Identify what you know and what you need to find. Think about relevant concepts from class. Try a simple example or special case first. Build up to the full solution incrementally.`;
}

/**
 * Generate recommended resources
 */
function generateResources(topics: string[], courseContext?: CourseContextType): string[] {
	const resources: string[] = [];

	if (topics.includes("linear regression") || topics.includes("gradient descent")) {
		resources.push("Review lecture notes on optimization and gradient descent");
		resources.push("Textbook chapter on linear regression");
		resources.push("Practice problems on cost functions and derivatives");
	}

	if (topics.includes("neural network") || topics.includes("backpropagation")) {
		resources.push("Review lecture notes on neural networks");
		resources.push("Textbook chapter on backpropagation");
		resources.push("Visualization tools for understanding neural networks");
	}

	if (topics.includes("sql") || topics.includes("query")) {
		resources.push("SQL tutorial on JOINs and aggregations");
		resources.push("Database textbook chapter on query optimization");
		resources.push("Practice with sample databases");
	}

	if (topics.includes("dynamic programming")) {
		resources.push("Review lecture notes on dynamic programming");
		resources.push("Textbook chapter on DP patterns");
		resources.push("Practice problems on identifying DP subproblems");
	}

	if (topics.includes("hypothesis testing")) {
		resources.push("Review lecture notes on hypothesis testing");
		resources.push("Statistics textbook chapter on t-tests and z-tests");
		resources.push("Practice problems on interpreting p-values");
	}

	// Course-specific resources
	if (courseContext?.course_id === "10-601") {
		resources.push("10-601 course website and lecture materials");
	}

	if (courseContext?.course_id === "15-445") {
		resources.push("15-445 course website and lecture materials");
	}

	if (resources.length === 0) {
		resources.push("Review relevant lecture notes");
		resources.push("Check the course textbook");
		resources.push("Review practice problems from class");
	}

	return resources;
}

/**
 * Generate next steps for user to attempt
 */
function generateNextSteps(
	topics: string[],
	question: string,
	violation: boolean,
	userAttempt?: string,
): string[] {
	const steps: string[] = [];

	if (violation) {
		steps.push("Instead of asking for the solution, try working through the problem yourself first.");
		steps.push("Identify what specific part you're stuck on.");
		steps.push("Review the relevant concepts from class.");
	}

	if (topics.includes("linear regression") || topics.includes("gradient descent")) {
		steps.push("Write down the cost function for your problem.");
		steps.push("Calculate the gradient of the cost function.");
		steps.push("Implement one iteration of gradient descent manually.");
		steps.push("Test with a simple example (e.g., 2 data points).");
	}

	if (topics.includes("neural network")) {
		steps.push("Start with a simple 2-layer network.");
		steps.push("Implement the forward pass first.");
		steps.push("Then implement the backward pass for one layer.");
		steps.push("Test with a small example.");
	}

	if (topics.includes("sql") || topics.includes("query")) {
		steps.push("Identify which tables you need.");
		steps.push("Write a simple SELECT query first.");
		steps.push("Add JOINs one at a time.");
		steps.push("Add WHERE conditions and test incrementally.");
	}

	if (topics.includes("dynamic programming")) {
		steps.push("Identify the subproblems.");
		steps.push("Write down the recurrence relation.");
		steps.push("Determine the base case(s).");
		steps.push("Work through a small example manually.");
		steps.push("Implement the DP table and fill it step by step.");
	}

	if (topics.includes("hypothesis testing")) {
		steps.push("State your null and alternative hypotheses clearly.");
		steps.push("Choose the appropriate test statistic.");
		steps.push("Calculate the test statistic from your data.");
		steps.push("Determine the p-value or compare to critical value.");
		steps.push("Interpret the result in context.");
	}

	// Generic steps
	if (steps.length === 0) {
		steps.push("Break the problem into smaller parts.");
		steps.push("Work through a simple example first.");
		steps.push("Identify what concepts from class apply.");
		steps.push("Try a different approach if your first attempt doesn't work.");
	}

	return steps;
}

/**
 * Guide function - Main entry point for providing educational guidance
 */
export function guide(
	question: string,
	course_context?: CourseContextType,
	user_attempt?: string,
): LearningAgentOutput {
	// Detect Anti-AIV violations
	const violation = detectAntiAIVViolation(question);
	const refused = violation.violation;

	// Extract topics
	const topics = extractTopics(question, course_context);

	// Generate guidance components
	const hints = generateHints(topics, question, user_attempt);
	const concepts = topics.length > 0 ? topics : ["problem-solving", "critical thinking"];
	const guidingQuestions = generateGuidingQuestions(topics, question);
	const thoughtProcess = generateThoughtProcess(topics, question, user_attempt);
	const resources = generateResources(topics, course_context);
	const nextSteps = generateNextSteps(topics, question, refused, user_attempt);

	// Generate refusal reason if needed
	let refusalReason: string | undefined;
	if (refused) {
		switch (violation.type) {
			case "solution":
				refusalReason =
					"I can't provide solutions as that would prevent you from learning. Instead, I'll help you think through the problem.";
				break;
			case "answer":
			case "mcq_answer":
				refusalReason =
					"I can't give you the answer, even if you insist. Learning comes from working through problems yourself. Let me help you understand the concepts instead.";
				break;
			case "code":
				refusalReason =
					"I can't provide complete code solutions. Instead, I'll help you understand the concepts and guide your implementation.";
				break;
			case "step_by_step":
				refusalReason =
					"I can't provide step-by-step solutions. Instead, I'll help you develop your own approach.";
				break;
			case "numeric":
				refusalReason =
					"I can't provide exact numeric answers. Instead, I'll help you understand how to calculate it yourself.";
				break;
			default:
				refusalReason =
					"I can't provide direct answers. Instead, I'll help you learn by guiding your thinking.";
		}
	}

	return {
		guidance: {
			hints,
			concepts,
			guiding_questions: guidingQuestions,
			thought_process: thoughtProcess,
			resources,
		},
		anti_aiv_enforcement: {
			refused,
			refusal_reason: refusalReason,
		},
		next_steps: nextSteps,
	};
}

export const LearningAgent: Agent<
	LearningAgentInput,
	AgentResult<LearningAgentOutput>
> = {
	name: "LearningAgent",
	description:
		"Provides educational guidance (hints, concepts, questions) while strictly refusing solutions, answers, or code (Anti-AIV)",

	async execute(
		input: LearningAgentInput,
	): Promise<AgentResult<LearningAgentOutput>> {
		agentLogger.logStart("LearningAgent", input);

		try {
			// Validate input
			const validatedInput = learningAgentInputSchema.parse(input);

			// Get guidance
			const guidance = guide(
				validatedInput.question,
				validatedInput.course_context,
				validatedInput.user_attempt,
			);

			// Log if refusal occurred
			if (guidance.anti_aiv_enforcement.refused) {
				agentLogger.logAction(
					"LearningAgent",
					"ANTI_AIV_REFUSAL",
					"Refused to provide solution/answer",
					{
						question: validatedInput.question,
						refusal_reason: guidance.anti_aiv_enforcement.refusal_reason,
					},
				);
			}

			agentLogger.logSuccess("LearningAgent", guidance);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "LearningAgent",
				message: guidance.anti_aiv_enforcement.refused
					? "Provided guidance while refusing direct answer"
					: "Provided educational guidance",
				data: guidance,
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

/**
 * Test function for LearningAgent
 * Tests various question types and verifies Anti-AIV enforcement
 */
export async function testLearningAgent(): Promise<void> {
	console.log("=".repeat(80));
	console.log("Testing LearningAgent (Anti-AIV)");
	console.log("=".repeat(80));
	console.log();

	const testCases = [
		{
			name: "Direct Solution Request",
			question: "Solve this problem: implement linear regression from scratch. Give me the complete solution.",
			course_context: {
				course_id: "10-601",
				course_name: "Introduction to Machine Learning",
				topic: "linear regression",
				assignment_type: "coding" as const,
			},
			expected_refusal: true,
		},
		{
			name: "MCQ Answer Request",
			question: "What is the answer to this MCQ: In linear regression, what happens to the cost function? A) It decreases B) It increases C) It stays constant D) It depends",
			course_context: {
				course_id: "10-601",
				course_name: "Introduction to Machine Learning",
				topic: "linear regression",
				assignment_type: "mcq" as const,
			},
			expected_refusal: true,
		},
		{
			name: "MCQ Answer Request (User Insists)",
			question: "I really need the answer to this MCQ. Please just tell me which option is correct: A, B, C, or D?",
			course_context: {
				course_id: "10-601",
				course_name: "Introduction to Machine Learning",
				assignment_type: "mcq" as const,
			},
			expected_refusal: true,
		},
		{
			name: "Code Solution Request",
			question: "Write a complete Python function to implement gradient descent. Include the full code.",
			course_context: {
				course_id: "10-601",
				course_name: "Introduction to Machine Learning",
				topic: "gradient descent",
				assignment_type: "coding" as const,
			},
			expected_refusal: true,
		},
		{
			name: "Step-by-Step Solution Request",
			question: "Show me step-by-step how to implement a neural network from scratch.",
			course_context: {
				course_id: "10-601",
				course_name: "Introduction to Machine Learning",
				topic: "neural networks",
				assignment_type: "coding" as const,
			},
			expected_refusal: true,
		},
		{
			name: "Numeric Answer Request",
			question: "What is the exact p-value for this hypothesis test? Calculate the exact value.",
			course_context: {
				course_id: "36-200",
				course_name: "Reasoning with Data",
				topic: "hypothesis testing",
				assignment_type: "theory" as const,
			},
			expected_refusal: true,
		},
		{
			name: "Conceptual Question (Should Provide Guidance)",
			question: "I'm trying to understand overfitting. Can you explain the concept?",
			course_context: {
				course_id: "10-601",
				course_name: "Introduction to Machine Learning",
				topic: "overfitting",
				assignment_type: "theory" as const,
			},
			expected_refusal: false,
		},
		{
			name: "Question with User Attempt",
			question: "I'm stuck on implementing linear regression. I've tried using numpy but I'm getting errors.",
			course_context: {
				course_id: "10-601",
				course_name: "Introduction to Machine Learning",
				topic: "linear regression",
				assignment_type: "coding" as const,
			},
			user_attempt: "I've tried using numpy but I'm getting errors",
			expected_refusal: false,
		},
		{
			name: "SQL Query Request",
			question: "Write a SQL query to find all students enrolled in more than 3 courses. Give me the complete query.",
			course_context: {
				course_id: "15-445",
				course_name: "Database Systems",
				topic: "SQL queries",
				assignment_type: "coding" as const,
			},
			expected_refusal: true,
		},
		{
			name: "Dynamic Programming Solution Request",
			question: "Solve this DP problem: Given coins and target, find minimum coins. Provide the complete solution.",
			course_context: {
				course_id: "15-451",
				course_name: "Algorithm Design and Analysis",
				topic: "dynamic programming",
				assignment_type: "coding" as const,
			},
			expected_refusal: true,
		},
	];

	for (const testCase of testCases) {
		console.log(`Test: ${testCase.name}`);
		console.log("-".repeat(80));
		console.log(`Question: ${testCase.question}`);
		console.log();

		const result = guide(
			testCase.question,
			testCase.course_context,
			testCase.user_attempt,
		);

		// Check Anti-AIV enforcement
		const refused = result.anti_aiv_enforcement.refused;
		const expectedRefused = testCase.expected_refusal;

		if (refused === expectedRefused) {
			console.log(`✓ Anti-AIV enforcement: ${refused ? "REFUSED" : "ALLOWED"} (as expected)`);
		} else {
			console.log(
				`✗ Anti-AIV enforcement: ${refused ? "REFUSED" : "ALLOWED"} (expected ${expectedRefused ? "REFUSED" : "ALLOWED"})`,
			);
		}

		if (refused) {
			console.log(`  Refusal Reason: ${result.anti_aiv_enforcement.refusal_reason}`);
		}

		console.log();
		console.log("Guidance Provided:");
		console.log(`  Hints (${result.guidance.hints.length}):`);
		result.guidance.hints.slice(0, 2).forEach((hint, i) => {
			console.log(`    ${i + 1}. ${hint}`);
		});
		console.log(`  Concepts: ${result.guidance.concepts.join(", ")}`);
		console.log(`  Guiding Questions (${result.guidance.guiding_questions.length}):`);
		result.guidance.guiding_questions.slice(0, 2).forEach((q, i) => {
			console.log(`    ${i + 1}. ${q}`);
		});
		console.log(`  Thought Process: ${result.guidance.thought_process.slice(0, 100)}...`);
		console.log(`  Next Steps (${result.next_steps.length}):`);
		result.next_steps.slice(0, 2).forEach((step, i) => {
			console.log(`    ${i + 1}. ${step}`);
		});
		console.log();
	}

	console.log("=".repeat(80));
	console.log("Anti-AIV Enforcement Summary");
	console.log("=".repeat(80));
	const refusedCount = testCases.filter(
		(tc) => guide(tc.question, tc.course_context, tc.user_attempt).anti_aiv_enforcement.refused,
	).length;
	const expectedRefusedCount = testCases.filter((tc) => tc.expected_refusal).length;
	console.log(`Total test cases: ${testCases.length}`);
	console.log(`Cases that should be refused: ${expectedRefusedCount}`);
	console.log(`Cases actually refused: ${refusedCount}`);
	if (refusedCount === expectedRefusedCount) {
		console.log("✓ All Anti-AIV violations correctly detected and refused");
	} else {
		console.log(
			`✗ Mismatch: Expected ${expectedRefusedCount} refusals, got ${refusedCount}`,
		);
	}
	console.log();
	console.log("=".repeat(80));
}
