import { z } from "zod";
import type { Agent, AgentResult, Task } from "./types";
import { agentLogger } from "./logger";

/**
 * StudyPlannerAgent - Creates study schedules and plans
 *
 * Purpose: Generates optimized study schedules that balance coursework,
 * breaks, and personal time, taking into account deadlines, workload,
 * and user preferences.
 */

const studyPlannerInputSchema = z.object({
	tasks: z.array(
		z.object({
			id: z.string(),
			title: z.string(),
			dueDate: z.string(),
			estimatedHours: z.number(),
			priority: z.number().optional(),
			type: z.enum(["assignment", "project", "exam", "reading", "other"]),
		}),
	),
	availability: z.array(
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
			startTime: z.string(), // HH:mm format
			endTime: z.string(), // HH:mm format
		}),
	),
	preferences: z
		.object({
			studySessionLength: z.number().default(2), // hours
			breakLength: z.number().default(0.25), // hours
			maxHoursPerDay: z.number().default(8),
			preferredStudyTimes: z.array(z.string()).optional(), // e.g., ["morning", "afternoon"]
		})
		.optional(),
});

const studyPlannerOutputSchema = z.object({
	schedule: z.array(
		z.object({
			date: z.string(),
			timeSlots: z.array(
				z.object({
					start: z.string(),
					end: z.string(),
					taskId: z.string(),
					taskTitle: z.string(),
					type: z.string(),
				}),
			),
			totalHours: z.number(),
		}),
	),
	summary: z.object({
		totalScheduledHours: z.number(),
		daysPlanned: z.number(),
		averageHoursPerDay: z.number(),
		completionDate: z.string(),
	}),
	recommendations: z.array(z.string()),
});

export type StudyPlannerInput = z.infer<typeof studyPlannerInputSchema>;
export type StudyPlannerOutput = z.infer<typeof studyPlannerOutputSchema>;

export const StudyPlannerAgent: Agent<
	StudyPlannerInput,
	AgentResult<StudyPlannerOutput>
> = {
	name: "StudyPlannerAgent",
	description:
		"Creates optimized study schedules balancing coursework, breaks, and personal time",

	async execute(
		input: StudyPlannerInput,
	): Promise<AgentResult<StudyPlannerOutput>> {
		agentLogger.logStart("StudyPlannerAgent", input);

		try {
			// Validate input
			const validatedInput = studyPlannerInputSchema.parse(input);

			const preferences = validatedInput.preferences || {
				studySessionLength: 2,
				breakLength: 0.25,
				maxHoursPerDay: 8,
			};

			// Sort tasks by priority and due date
			const sortedTasks = [...validatedInput.tasks].sort((a, b) => {
				const priorityDiff = (b.priority || 0) - (a.priority || 0);
				if (priorityDiff !== 0) return priorityDiff;
				return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
			});

			// Mock implementation - creates a simple schedule
			const schedule: StudyPlannerOutput["schedule"] = [];
			let currentDate = new Date();
			let taskIndex = 0;
			let totalScheduledHours = 0;

			// Plan for next 7 days
			for (let day = 0; day < 7 && taskIndex < sortedTasks.length; day++) {
				const date = new Date(currentDate);
				date.setDate(date.getDate() + day);
				const dateStr = date.toISOString().split("T")[0];

				const timeSlots: StudyPlannerOutput["schedule"][0]["timeSlots"] = [];
				let dayHours = 0;

				// Add tasks for this day
				while (
					taskIndex < sortedTasks.length &&
					dayHours + preferences.studySessionLength <= preferences.maxHoursPerDay
				) {
					const task = sortedTasks[taskIndex];
					const hoursNeeded = Math.min(
						task.estimatedHours,
						preferences.maxHoursPerDay - dayHours,
					);

					if (hoursNeeded > 0) {
						timeSlots.push({
							start: "09:00",
							end: `${9 + hoursNeeded}:00`,
							taskId: task.id,
							taskTitle: task.title,
							type: task.type,
						});

						dayHours += hoursNeeded;
						task.estimatedHours -= hoursNeeded;

						if (task.estimatedHours <= 0) {
							taskIndex++;
						}
					} else {
						break;
					}
				}

				if (timeSlots.length > 0) {
					schedule.push({
						date: dateStr,
						timeSlots,
						totalHours: dayHours,
					});
					totalScheduledHours += dayHours;
				}
			}

			const daysPlanned = schedule.length;
			const averageHoursPerDay =
				daysPlanned > 0 ? totalScheduledHours / daysPlanned : 0;

			const lastTask = sortedTasks[sortedTasks.length - 1];
			const completionDate = lastTask ? lastTask.dueDate : new Date().toISOString();

			const mockOutput: StudyPlannerOutput = {
				schedule,
				summary: {
					totalScheduledHours,
					daysPlanned,
					averageHoursPerDay: Math.round(averageHoursPerDay * 10) / 10,
					completionDate,
				},
				recommendations: [
					"Take regular breaks between study sessions",
					"Review your schedule daily and adjust as needed",
					"Start with high-priority tasks",
				],
			};

			agentLogger.logSuccess("StudyPlannerAgent", mockOutput);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "StudyPlannerAgent",
				message: "Successfully created study schedule",
				data: mockOutput,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			agentLogger.logError("StudyPlannerAgent", errorMessage, { input });

			return {
				success: false,
				timestamp: new Date().toISOString(),
				agentName: "StudyPlannerAgent",
				error: errorMessage,
			};
		}
	},
};

