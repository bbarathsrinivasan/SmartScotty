import { z } from "zod";
import type { Agent, AgentResult } from "./types";
import { agentLogger } from "./logger";

/**
 * SafetySupervisorAgent - Monitors agent behavior and ensures safety constraints
 *
 * Purpose: Acts as a safety layer that monitors all agent operations, validates
 * outputs, checks for potential issues, and ensures agents operate within
 * defined safety constraints and ethical guidelines.
 */

const safetySupervisorInputSchema = z.object({
	action: z.enum(["validate", "monitor", "checkConstraints", "audit"]),
	agentName: z.string(),
	agentOutput: z.record(z.unknown()).optional(),
	operation: z.string().optional(),
	constraints: z
		.array(
			z.object({
				type: z.enum([
					"time_limit",
					"resource_limit",
					"data_privacy",
					"ethical",
					"academic_integrity",
				]),
				value: z.unknown(),
			}),
		)
		.optional(),
});

const safetySupervisorOutputSchema = z.object({
	approved: z.boolean(),
	violations: z
		.array(
			z.object({
				type: z.string(),
				severity: z.enum(["low", "medium", "high", "critical"]),
				description: z.string(),
				recommendation: z.string().optional(),
			}),
		)
		.optional(),
	warnings: z
		.array(
			z.object({
				type: z.string(),
				message: z.string(),
				action: z.string().optional(),
			}),
		)
		.optional(),
	auditLog: z
		.array(
			z.object({
				timestamp: z.string(),
				agentName: z.string(),
				operation: z.string(),
				status: z.enum(["approved", "rejected", "warning"]),
			}),
		)
		.optional(),
	message: z.string(),
});

export type SafetySupervisorInput = z.infer<typeof safetySupervisorInputSchema>;
export type SafetySupervisorOutput = z.infer<typeof safetySupervisorOutputSchema>;

export const SafetySupervisorAgent: Agent<
	SafetySupervisorInput,
	AgentResult<SafetySupervisorOutput>
> = {
	name: "SafetySupervisorAgent",
	description:
		"Monitors agent behavior, validates outputs, and ensures safety constraints are met",

	async execute(
		input: SafetySupervisorInput,
	): Promise<AgentResult<SafetySupervisorOutput>> {
		agentLogger.logStart("SafetySupervisorAgent", input);

		try {
			// Validate input
			const validatedInput = safetySupervisorInputSchema.parse(input);

			let mockOutput: SafetySupervisorOutput;

			switch (validatedInput.action) {
				case "validate": {
					if (!validatedInput.agentOutput) {
						throw new Error("Agent output required for validate action");
					}

					// Mock validation - check for common issues
					const violations: SafetySupervisorOutput["violations"] = [];
					const warnings: SafetySupervisorOutput["warnings"] = [];

					// Check for suspicious patterns (mock)
					if (
						JSON.stringify(validatedInput.agentOutput).includes("error") &&
						!JSON.stringify(validatedInput.agentOutput).includes("success")
					) {
						warnings.push({
							type: "error_pattern",
							message: "Agent output contains error indicators",
							action: "Review agent execution logs",
						});
					}

					mockOutput = {
						approved: violations.length === 0,
						violations: violations.length > 0 ? violations : undefined,
						warnings: warnings.length > 0 ? warnings : undefined,
						message:
							violations.length === 0
								? "Validation passed"
								: "Validation failed - violations detected",
					};
					break;
				}

				case "monitor": {
					// Mock monitoring
					mockOutput = {
						approved: true,
						message: "Monitoring active, no issues detected",
					};
					break;
				}

				case "checkConstraints": {
					if (!validatedInput.constraints) {
						throw new Error("Constraints required for checkConstraints action");
					}

					const violations: SafetySupervisorOutput["violations"] = [];

					// Mock constraint checking
					for (const constraint of validatedInput.constraints) {
						if (constraint.type === "time_limit") {
							// Mock: check if time limit exceeded
							if (typeof constraint.value === "number" && constraint.value > 3600) {
								violations.push({
									type: "time_limit",
									severity: "high",
									description: "Operation exceeded time limit",
									recommendation: "Optimize agent execution or break into smaller tasks",
								});
							}
						}
					}

					mockOutput = {
						approved: violations.length === 0,
						violations: violations.length > 0 ? violations : undefined,
						message:
							violations.length === 0
								? "All constraints satisfied"
								: "Constraint violations detected",
					};
					break;
				}

				case "audit": {
					// Mock audit log
					const auditLog: SafetySupervisorOutput["auditLog"] = [
						{
							timestamp: new Date().toISOString(),
							agentName: validatedInput.agentName,
							operation: validatedInput.operation || "unknown",
							status: "approved",
						},
					];

					mockOutput = {
						approved: true,
						auditLog,
						message: "Audit log generated",
					};
					break;
				}

				default:
					throw new Error(`Unknown action: ${validatedInput.action}`);
			}

			agentLogger.logSuccess("SafetySupervisorAgent", mockOutput);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "SafetySupervisorAgent",
				message: mockOutput.message,
				data: mockOutput,
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

