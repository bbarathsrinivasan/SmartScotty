import { z } from "zod";
import type { Agent, AgentResult, CalendarEvent } from "./types";
import { agentLogger } from "./logger";

/**
 * CalendarAgent - Manages calendar events, scheduling, and conflicts
 *
 * Purpose: Handles calendar operations including creating events, checking
 * for conflicts, finding available time slots, and managing calendar
 * synchronization.
 */

const calendarAgentInputSchema = z.object({
	action: z.enum([
		"create",
		"update",
		"delete",
		"list",
		"checkConflicts",
		"findAvailable",
	]),
	event: z
		.object({
			id: z.string().optional(),
			title: z.string(),
			start: z.string(),
			end: z.string(),
			location: z.string().optional(),
			description: z.string().optional(),
			type: z.enum(["class", "study", "meeting", "deadline", "other"]),
		})
		.optional(),
	dateRange: z
		.object({
			start: z.string(),
			end: z.string(),
		})
		.optional(),
	existingEvents: z
		.array(
			z.object({
				id: z.string(),
				title: z.string(),
				start: z.string(),
				end: z.string(),
				type: z.string(),
			}),
		)
		.optional(),
});

const calendarAgentOutputSchema = z.object({
	events: z
		.array(
			z.object({
				id: z.string(),
				title: z.string(),
				start: z.string(),
				end: z.string(),
				location: z.string().optional(),
				description: z.string().optional(),
				type: z.enum(["class", "study", "meeting", "deadline", "other"]),
			}),
		)
		.optional(),
	conflicts: z
		.array(
			z.object({
				eventId: z.string(),
				conflictingEventId: z.string(),
				overlapStart: z.string(),
				overlapEnd: z.string(),
			}),
		)
		.optional(),
	availableSlots: z
		.array(
			z.object({
				start: z.string(),
				end: z.string(),
				duration: z.number(), // hours
			}),
		)
		.optional(),
	message: z.string(),
});

export type CalendarAgentInput = z.infer<typeof calendarAgentInputSchema>;
export type CalendarAgentOutput = z.infer<typeof calendarAgentOutputSchema>;

export const CalendarAgent: Agent<
	CalendarAgentInput,
	AgentResult<CalendarAgentOutput>
> = {
	name: "CalendarAgent",
	description:
		"Manages calendar events, scheduling, conflict detection, and available time slot finding",

	async execute(
		input: CalendarAgentInput,
	): Promise<AgentResult<CalendarAgentOutput>> {
		agentLogger.logStart("CalendarAgent", input);

		try {
			// Validate input
			const validatedInput = calendarAgentInputSchema.parse(input);

			let mockOutput: CalendarAgentOutput;

			switch (validatedInput.action) {
				case "create":
				case "update": {
					if (!validatedInput.event) {
						throw new Error("Event data required for create/update action");
					}
					mockOutput = {
						events: [
							{
								id: validatedInput.event.id || `event-${Date.now()}`,
								title: validatedInput.event.title,
								start: validatedInput.event.start,
								end: validatedInput.event.end,
								location: validatedInput.event.location,
								description: validatedInput.event.description,
								type: validatedInput.event.type,
							},
						],
						message: `Event ${validatedInput.action === "create" ? "created" : "updated"} successfully`,
					};
					break;
				}

				case "delete": {
					mockOutput = {
						message: "Event deleted successfully",
					};
					break;
				}

				case "list": {
					mockOutput = {
						events: validatedInput.existingEvents || [
							{
								id: "event-1",
								title: "Machine Learning Class",
								start: "2024-10-15T10:00:00Z",
								end: "2024-10-15T11:30:00Z",
								type: "class",
							},
							{
								id: "event-2",
								title: "Study Session",
								start: "2024-10-15T14:00:00Z",
								end: "2024-10-15T16:00:00Z",
								type: "study",
							},
						],
						message: "Events retrieved successfully",
					};
					break;
				}

				case "checkConflicts": {
					const conflicts: CalendarAgentOutput["conflicts"] = [];
					if (validatedInput.event && validatedInput.existingEvents) {
						const newStart = new Date(validatedInput.event.start);
						const newEnd = new Date(validatedInput.event.end);

						for (const existing of validatedInput.existingEvents) {
							const existingStart = new Date(existing.start);
							const existingEnd = new Date(existing.end);

							if (
								(newStart < existingEnd && newEnd > existingStart) ||
								(newStart >= existingStart && newStart < existingEnd) ||
								(newEnd > existingStart && newEnd <= existingEnd)
							) {
								const overlapStart = newStart > existingStart ? newStart : existingStart;
								const overlapEnd = newEnd < existingEnd ? newEnd : existingEnd;
								conflicts.push({
									eventId: validatedInput.event.id || "new-event",
									conflictingEventId: existing.id,
									overlapStart: overlapStart.toISOString(),
									overlapEnd: overlapEnd.toISOString(),
								});
							}
						}
					}

					mockOutput = {
						conflicts,
						message: conflicts.length > 0 ? "Conflicts detected" : "No conflicts found",
					};
					break;
				}

				case "findAvailable": {
					if (!validatedInput.dateRange) {
						throw new Error("Date range required for findAvailable action");
					}

					// Mock available slots
					mockOutput = {
						availableSlots: [
							{
								start: "2024-10-15T09:00:00Z",
								end: "2024-10-15T12:00:00Z",
								duration: 3,
							},
							{
								start: "2024-10-15T13:00:00Z",
								end: "2024-10-15T17:00:00Z",
								duration: 4,
							},
						],
						message: "Available time slots found",
					};
					break;
				}

				default:
					throw new Error(`Unknown action: ${validatedInput.action}`);
			}

			agentLogger.logSuccess("CalendarAgent", mockOutput);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "CalendarAgent",
				message: mockOutput.message,
				data: mockOutput,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			agentLogger.logError("CalendarAgent", errorMessage, { input });

			return {
				success: false,
				timestamp: new Date().toISOString(),
				agentName: "CalendarAgent",
				error: errorMessage,
			};
		}
	},
};

