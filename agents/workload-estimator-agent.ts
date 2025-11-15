import { z } from "zod";
import type { Agent, AgentResult } from "./types";
import { agentLogger } from "./logger";

/**
 * WorkloadEstimatorAgent - Estimates time and effort required for tasks
 *
 * Purpose: Analyzes assignment descriptions using rule-based logic to estimate
 * workload, difficulty, task type breakdown, and recommended time distribution.
 *
 * REAL API INTEGRATION NOTES:
 * - Could be enhanced with ML models for more accurate estimates
 * - Could learn from user feedback to improve estimates over time
 * - Could integrate with time tracking tools to validate estimates
 */

const workloadEstimatorInputSchema = z.object({
	assignment_description: z.string().describe("Text description of the assignment"),
	userProfile: z
		.object({
			experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
			averagePace: z.number().optional(), // hours per task type
		})
		.optional(),
});

const workloadEstimatorOutputSchema = z.object({
	estimated_hours: z.number().describe("Total estimated hours to complete the assignment"),
	difficulty_score: z
		.number()
		.min(1)
		.max(10)
		.describe("Difficulty rating from 1 (easy) to 10 (very difficult)"),
	task_type_breakdown: z
		.object({
			reading: z.number().describe("Hours allocated to reading tasks"),
			coding: z.number().describe("Hours allocated to coding tasks"),
			math: z.number().describe("Hours allocated to math tasks"),
		})
		.describe("Breakdown of hours by task type"),
	recommended_split: z
		.array(z.number())
		.describe("Recommended hours per day (e.g., [2, 3, 2, 1] for 4 days)"),
});

export type WorkloadEstimatorInput = z.infer<typeof workloadEstimatorInputSchema>;
export type WorkloadEstimatorOutput = z.infer<typeof workloadEstimatorOutputSchema>;

/**
 * Keyword lists for task type detection
 */
const CODING_KEYWORDS = [
	"implement",
	"code",
	"program",
	"function",
	"algorithm",
	"debug",
	"test",
	"api",
	"database",
	"sql",
	"class",
	"method",
	"variable",
	"loop",
	"recursion",
	"data structure",
	"software",
	"application",
	"system",
	"interface",
	"framework",
	"library",
	"compile",
	"runtime",
	"error",
	"exception",
];

const MATH_KEYWORDS = [
	"calculate",
	"solve",
	"equation",
	"proof",
	"theorem",
	"statistics",
	"probability",
	"derivative",
	"integral",
	"matrix",
	"vector",
	"graph",
	"function",
	"formula",
	"algebra",
	"calculus",
	"linear",
	"optimization",
	"minimize",
	"maximize",
	"convergence",
	"limit",
];

const READING_KEYWORDS = [
	"read",
	"chapter",
	"article",
	"paper",
	"textbook",
	"summarize",
	"analyze",
	"discuss",
	"review",
	"literature",
	"research",
	"study",
	"understand",
	"comprehend",
	"interpret",
	"evaluate",
	"critique",
];

const COMPLEXITY_KEYWORDS = [
	"complex",
	"advanced",
	"comprehensive",
	"challenging",
	"difficult",
	"sophisticated",
	"intricate",
	"elaborate",
	"extensive",
];

const SIMPLE_KEYWORDS = [
	"simple",
	"basic",
	"introductory",
	"easy",
	"straightforward",
	"elementary",
	"fundamental",
];

/**
 * Counts occurrences of keywords in text (case-insensitive)
 */
function countKeywords(text: string, keywords: string[]): number {
	const lowerText = text.toLowerCase();
	return keywords.filter((keyword) => lowerText.includes(keyword.toLowerCase())).length;
}

/**
 * Estimates workload from assignment description using rule-based logic
 * This function is deterministic - same input always produces same output
 */
export function estimate(
	assignment_description: string,
): WorkloadEstimatorOutput {
	// Handle empty or very short descriptions
	if (!assignment_description || assignment_description.trim().length < 10) {
		return {
			estimated_hours: 5,
			difficulty_score: 5,
			task_type_breakdown: {
				reading: 2,
				coding: 2,
				math: 1,
			},
			recommended_split: [2, 2, 1],
		};
	}

	const description = assignment_description.trim();

	// Count keywords for each task type
	const codingCount = countKeywords(description, CODING_KEYWORDS);
	const mathCount = countKeywords(description, MATH_KEYWORDS);
	const readingCount = countKeywords(description, READING_KEYWORDS);
	const complexityCount = countKeywords(description, COMPLEXITY_KEYWORDS);
	const simpleCount = countKeywords(description, SIMPLE_KEYWORDS);

	// Calculate base hours
	let baseHours = 5;

	// Add hours based on keyword counts
	baseHours += codingCount * 2; // Each coding keyword adds 2 hours
	baseHours += mathCount * 1.5; // Each math keyword adds 1.5 hours
	baseHours += readingCount * 0.5; // Each reading keyword adds 0.5 hours

	// Length-based adjustment (description length / 100, minimum 1x)
	const lengthMultiplier = Math.max(1, description.length / 100);
	baseHours *= lengthMultiplier;

	// Complexity adjustments
	if (complexityCount > 0) {
		baseHours += complexityCount * 3; // Each complexity keyword adds 3 hours
	}
	if (simpleCount > 0) {
		baseHours -= simpleCount * 2; // Each simple keyword subtracts 2 hours
		baseHours = Math.max(1, baseHours); // Ensure minimum 1 hour
	}

	// Round to 1 decimal place
	const estimated_hours = Math.round(baseHours * 10) / 10;

	// Calculate difficulty score (1-10)
	let difficulty_score = 5; // Base difficulty

	if (codingCount > 0) {
		difficulty_score += 2;
	}
	if (mathCount > 0) {
		difficulty_score += 1.5;
	}

	// Multiple task types increase difficulty
	const taskTypeCount = [codingCount, mathCount, readingCount].filter((c) => c > 0).length;
	if (taskTypeCount > 1) {
		difficulty_score += 1;
	}

	if (complexityCount > 0) {
		difficulty_score += complexityCount * 2;
	}
	if (simpleCount > 0) {
		difficulty_score -= simpleCount * 1.5;
	}

	// Clamp between 1 and 10
	difficulty_score = Math.max(1, Math.min(10, Math.round(difficulty_score * 10) / 10));

	// Calculate task type breakdown
	// Allocate hours proportionally based on keyword counts
	const totalKeywordCount = codingCount + mathCount + readingCount;

	let readingHours = 0;
	let codingHours = 0;
	let mathHours = 0;

	if (totalKeywordCount === 0) {
		// No keywords detected, use default distribution
		readingHours = estimated_hours * 0.4;
		codingHours = estimated_hours * 0.4;
		mathHours = estimated_hours * 0.2;
	} else {
		// Proportional allocation with minimum 0.5 hours per type
		const readingRatio = readingCount / totalKeywordCount;
		const codingRatio = codingCount / totalKeywordCount;
		const mathRatio = mathCount / totalKeywordCount;

		readingHours = estimated_hours * readingRatio;
		codingHours = estimated_hours * codingRatio;
		mathHours = estimated_hours * mathRatio;

		// Ensure minimum 0.5 hours for detected types
		if (readingCount > 0 && readingHours < 0.5) {
			readingHours = 0.5;
		}
		if (codingCount > 0 && codingHours < 0.5) {
			codingHours = 0.5;
		}
		if (mathCount > 0 && mathHours < 0.5) {
			mathHours = 0.5;
		}

		// Normalize to ensure total equals estimated_hours
		const currentTotal = readingHours + codingHours + mathHours;
		if (currentTotal > 0) {
			const scale = estimated_hours / currentTotal;
			readingHours = Math.round(readingHours * scale * 10) / 10;
			codingHours = Math.round(codingHours * scale * 10) / 10;
			mathHours = Math.round(mathHours * scale * 10) / 10;
		}
	}

	// Ensure at least one type has hours if all are zero
	if (readingHours === 0 && codingHours === 0 && mathHours === 0) {
		readingHours = estimated_hours;
	}

	// Calculate recommended split (assuming 4 hours per day)
	const hoursPerDay = 4;
	const daysNeeded = Math.ceil(estimated_hours / hoursPerDay);
	const recommended_split: number[] = [];

	if (daysNeeded === 0) {
		recommended_split.push(estimated_hours);
	} else {
		const baseHoursPerDay = Math.floor(estimated_hours / daysNeeded);
		const remainder = estimated_hours - baseHoursPerDay * daysNeeded;

		// Distribute evenly
		for (let i = 0; i < daysNeeded; i++) {
			recommended_split.push(baseHoursPerDay);
		}

		// Add remainder to last day
		if (remainder > 0 && recommended_split.length > 0) {
			recommended_split[recommended_split.length - 1] += remainder;
		}

		// Round to 1 decimal place
		recommended_split.forEach((hours, index) => {
			recommended_split[index] = Math.round(hours * 10) / 10;
		});
	}

	return {
		estimated_hours,
		difficulty_score,
		task_type_breakdown: {
			reading: Math.round(readingHours * 10) / 10,
			coding: Math.round(codingHours * 10) / 10,
			math: Math.round(mathHours * 10) / 10,
		},
		recommended_split,
	};
}

export const WorkloadEstimatorAgent: Agent<
	WorkloadEstimatorInput,
	AgentResult<WorkloadEstimatorOutput>
> = {
	name: "WorkloadEstimatorAgent",
	description:
		"Estimates time and effort required for assignments based on description text analysis",

	async execute(
		input: WorkloadEstimatorInput,
	): Promise<AgentResult<WorkloadEstimatorOutput>> {
		agentLogger.logStart("WorkloadEstimatorAgent", input);

		try {
			// Validate input
			const validatedInput = workloadEstimatorInputSchema.parse(input);

			// Estimate workload using rule-based analysis
			const estimateResult = estimate(validatedInput.assignment_description);

			agentLogger.logSuccess("WorkloadEstimatorAgent", estimateResult);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "WorkloadEstimatorAgent",
				message: "Successfully estimated workload",
				data: estimateResult,
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

/**
 * Test function for WorkloadEstimatorAgent
 * Tests with various assignment descriptions and verifies consistency
 */
export async function testWorkloadEstimator(): Promise<void> {
	console.log("=".repeat(80));
	console.log("Testing WorkloadEstimatorAgent");
	console.log("=".repeat(80));
	console.log();

	const testCases = [
		{
			name: "Coding-Heavy Assignment",
			description:
				"Implement a linear regression algorithm from scratch. You need to write code that handles data preprocessing, implements the gradient descent algorithm, and includes comprehensive testing. The program should handle edge cases and provide clear documentation.",
		},
		{
			name: "Math-Heavy Assignment",
			description:
				"Solve the following calculus problems: calculate derivatives and integrals for the given functions. Prove the convergence theorem and solve the optimization problem using linear algebra. Show all your work and provide detailed solutions.",
		},
		{
			name: "Reading-Heavy Assignment",
			description:
				"Read chapters 5-8 from the textbook and the assigned research papers. Summarize the key concepts, analyze the main arguments, and write a comprehensive review discussing the implications of the research findings.",
		},
		{
			name: "Mixed Assignment",
			description:
				"Read the assigned paper on machine learning algorithms, implement the described algorithm in Python, and solve the mathematical proofs related to convergence. Write a report analyzing your results.",
		},
		{
			name: "Simple Assignment",
			description:
				"Write a simple function that calculates the sum of two numbers. This is a basic introductory exercise.",
		},
		{
			name: "Complex Project",
			description:
				"This is a comprehensive and advanced project requiring you to implement a complex database system with SQL queries, design sophisticated algorithms, solve challenging mathematical optimization problems, and write extensive documentation. The project involves multiple components and requires advanced understanding of computer science concepts.",
		},
		{
			name: "Empty Description",
			description: "",
		},
	];

	for (const testCase of testCases) {
		console.log(`Test: ${testCase.name}`);
		console.log("-".repeat(80));
		console.log(`Description: ${testCase.description || "(empty)"}`);
		console.log();

		const result = estimate(testCase.description);

		console.log("Results:");
		console.log(`  Estimated Hours: ${result.estimated_hours}`);
		console.log(`  Difficulty Score: ${result.difficulty_score}/10`);
		console.log("  Task Type Breakdown:");
		console.log(`    Reading: ${result.task_type_breakdown.reading} hours`);
		console.log(`    Coding: ${result.task_type_breakdown.coding} hours`);
		console.log(`    Math: ${result.task_type_breakdown.math} hours`);
		console.log(
			`  Recommended Split: ${result.recommended_split.length} day(s) - [${result.recommended_split.join(", ")}] hours/day`,
		);
		console.log();

		// Verify consistency - run twice and compare
		const result2 = estimate(testCase.description);
		const isConsistent =
			result.estimated_hours === result2.estimated_hours &&
			result.difficulty_score === result2.difficulty_score &&
			Math.abs(
				result.task_type_breakdown.reading - result2.task_type_breakdown.reading,
			) < 0.01 &&
			Math.abs(
				result.task_type_breakdown.coding - result2.task_type_breakdown.coding,
			) < 0.01 &&
			Math.abs(result.task_type_breakdown.math - result2.task_type_breakdown.math) <
				0.01;

		if (isConsistent) {
			console.log("  ✓ Consistency check passed (same input → same output)");
		} else {
			console.log("  ✗ Consistency check failed!");
		}
		console.log();
	}

	// Test consistency with similar descriptions
	console.log("=".repeat(80));
	console.log("Consistency Test: Similar Descriptions");
	console.log("=".repeat(80));
	console.log();

	const similar1 =
		"Implement a function to calculate the factorial of a number using recursion.";
	const similar2 =
		"Write a recursive function that computes the factorial of a given number.";

	const result1 = estimate(similar1);
	const result2 = estimate(similar2);

	console.log("Description 1:", similar1);
	console.log(`  Estimated Hours: ${result1.estimated_hours}`);
	console.log(`  Difficulty Score: ${result1.difficulty_score}`);
	console.log();
	console.log("Description 2:", similar2);
	console.log(`  Estimated Hours: ${result2.estimated_hours}`);
	console.log(`  Difficulty Score: ${result2.difficulty_score}`);
	console.log();

	const hoursDiff = Math.abs(result1.estimated_hours - result2.estimated_hours);
	const difficultyDiff = Math.abs(result1.difficulty_score - result2.difficulty_score);

	if (hoursDiff < 2 && difficultyDiff < 2) {
		console.log(
			`✓ Similar descriptions produce similar estimates (hours diff: ${hoursDiff.toFixed(1)}, difficulty diff: ${difficultyDiff.toFixed(1)})`,
		);
	} else {
		console.log(
			`✗ Estimates differ significantly (hours diff: ${hoursDiff.toFixed(1)}, difficulty diff: ${difficultyDiff.toFixed(1)})`,
		);
	}

	console.log();
	console.log("=".repeat(80));
}
