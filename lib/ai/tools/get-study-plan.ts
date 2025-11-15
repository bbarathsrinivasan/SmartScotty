import { tool } from "ai";
import { z } from "zod";
import type { Session } from "next-auth";
import { generateWeeklyPlan, generateDailyPlan } from "@/agents/study-planner-agent";
import type { PrioritizedTask } from "@/agents/prioritization-agent";
import type { Availability } from "@/agents/study-planner-agent";

/**
 * Study Planner tool for creating optimized study schedules
 * 
 * This tool should be used when users ask about:
 * - Creating study schedules
 * - Planning study time
 * - Scheduling assignments
 * - Weekly/daily study plans
 */
export const getStudyPlan = ({ session }: { session: Session | null }) => tool({
	description: `Create optimized study schedules that split long tasks across multiple days and avoid busy hours.
	
	Use this tool when users ask about:
	- Creating a study schedule or plan
	- Planning when to study for assignments
	- Scheduling study time for tasks
	- Weekly or daily study plans
	- "Create a study schedule for my assignments"
	- "Plan my study time"
	- "When should I study for these tasks?"
	- "Help me schedule my assignments"
	
	This tool takes prioritized tasks and user availability to generate study blocks.
	Long tasks are automatically split across multiple days, and busy hours are avoided.`,
	inputSchema: z.object({
		prioritized_tasks: z
			.array(
				z.object({
					id: z.string().describe("Unique identifier for the task"),
					title: z.string().optional().describe("Task title or name"),
					deadline: z.string().describe("ISO 8601 format deadline"),
					estimated_hours: z.number().describe("Estimated hours to complete the task"),
					difficulty_score: z.number().min(1).max(10).describe("Difficulty rating from 1-10"),
					priority_score: z.number().describe("Priority score (from prioritization)"),
				}),
			)
			.describe("Array of prioritized tasks to schedule"),
		availability: z
			.array(
				z.object({
					day: z.enum([
						"monday",
						"tuesday",
						"wednesday",
						"thursday",
						"friday",
						"saturday",
						"sunday",
					]),
					start_time: z.string().describe("Start time in HH:mm format (e.g., '09:00')"),
					end_time: z.string().describe("End time in HH:mm format (e.g., '17:00')"),
					available: z.boolean().default(true).describe("true = available, false = busy"),
				}),
			)
			.optional()
			.describe("User availability schedule (optional, uses defaults if not provided)"),
		max_hours_per_day: z.number().default(6).optional().describe("Maximum study hours per day (default: 6)"),
		start_date: z.string().optional().describe("ISO 8601 date to start planning from (default: today)"),
		plan_type: z.enum(["weekly", "daily"]).default("weekly").describe("Generate weekly or daily plan"),
	}),
	execute: async (input) => {
		try {
			if (!session?.user?.id) {
				return {
					error: "User not authenticated. Please log in to create study plans.",
				};
			}

			const startDate = input.start_date ? new Date(input.start_date) : new Date();
			const tasks: PrioritizedTask[] = input.prioritized_tasks.map((t) => ({
				id: t.id,
				title: t.title,
				deadline: t.deadline,
				estimated_hours: t.estimated_hours,
				difficulty_score: t.difficulty_score,
				priority_score: t.priority_score,
				urgency_weight: 0, // Will be calculated by prioritization
				difficulty_weight: 0,
				hours_weight: 0,
			}));

			const availability: Availability[] | undefined = input.availability?.map((a) => ({
				day: a.day,
				start_time: a.start_time,
				end_time: a.end_time,
				available: a.available,
			}));

			let studyBlocks;
			if (input.plan_type === "daily") {
				// Generate daily plan for today
				studyBlocks = generateDailyPlan(
					startDate,
					tasks.map((t) => ({ ...t, remaining_hours: t.estimated_hours })),
					availability || [],
					input.max_hours_per_day || 6,
				);
			} else {
				// Generate weekly plan
				studyBlocks = generateWeeklyPlan(
					tasks,
					availability,
					input.max_hours_per_day || 6,
					startDate,
				);
			}

			// Calculate summary
			const totalHours = studyBlocks.reduce((sum, b) => sum + b.duration, 0);
			const uniqueDays = new Set(studyBlocks.map((b) => b.day));
			const daysCovered = uniqueDays.size;
			const averageHoursPerDay = daysCovered > 0 ? totalHours / daysCovered : 0;

			// Group blocks by day for easier display
			const blocksByDay: Record<string, typeof studyBlocks> = {};
			for (const block of studyBlocks) {
				if (!blocksByDay[block.day]) {
					blocksByDay[block.day] = [];
				}
				blocksByDay[block.day].push(block);
			}

			return {
				study_blocks: studyBlocks,
				blocks_by_day: Object.entries(blocksByDay).map(([day, blocks]) => ({
					day,
					blocks: blocks.map((b) => ({
						task_id: b.task_id,
						task_title: b.task_title || b.task_id,
						start_time: b.start_time,
						duration: b.duration,
						end_time: (() => {
							const startMins = parseInt(b.start_time.split(":")[0]) * 60 + parseInt(b.start_time.split(":")[1]);
							const endMins = startMins + b.duration * 60;
							const endHours = Math.floor(endMins / 60);
							const endMinsRem = endMins % 60;
							return `${endHours.toString().padStart(2, "0")}:${endMinsRem.toString().padStart(2, "0")}`;
						})(),
					})),
					total_hours: blocks.reduce((sum, b) => sum + b.duration, 0),
				})),
				summary: {
					total_blocks: studyBlocks.length,
					total_hours: Math.round(totalHours * 10) / 10,
					days_covered: daysCovered,
					average_hours_per_day: Math.round(averageHoursPerDay * 10) / 10,
					plan_type: input.plan_type,
				},
			};
		} catch (error) {
			return {
				error:
					error instanceof Error
						? error.message
						: "An error occurred while creating the study plan",
			};
		}
	},
});

