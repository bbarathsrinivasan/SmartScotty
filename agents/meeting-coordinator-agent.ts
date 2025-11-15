import { z } from "zod";
import type { Agent, AgentResult, TimeSlot } from "./types";
import { agentLogger } from "./logger";

/**
 * MeetingCoordinatorAgent - Coordinates group meetings and finds availability
 *
 * Purpose: Finds common available time slots among multiple participants,
 * schedules meetings, and coordinates group study sessions or project meetings.
 */

const meetingCoordinatorInputSchema = z.object({
	action: z.enum(["findAvailability", "scheduleMeeting", "proposeTimes"]),
	participants: z.array(
		z.object({
			userId: z.string(),
			name: z.string().optional(),
			availability: z.array(
				z.object({
					start: z.string(),
					end: z.string(),
					available: z.boolean(),
				}),
			),
		}),
	),
	meetingDetails: z
		.object({
			title: z.string(),
			duration: z.number(), // minutes
			preferredTimes: z.array(z.string()).optional(),
			location: z.string().optional(),
			description: z.string().optional(),
		})
		.optional(),
	dateRange: z
		.object({
			start: z.string(),
			end: z.string(),
		})
		.optional(),
});

const meetingCoordinatorOutputSchema = z.object({
	availableSlots: z
		.array(
			z.object({
				start: z.string(),
				end: z.string(),
				participants: z.array(z.string()),
				score: z.number().optional(), // preference score
			}),
		)
		.optional(),
	scheduledMeeting: z
		.object({
			id: z.string(),
			title: z.string(),
			start: z.string(),
			end: z.string(),
			participants: z.array(z.string()),
			location: z.string().optional(),
		})
		.optional(),
	proposedTimes: z
		.array(
			z.object({
				start: z.string(),
				end: z.string(),
				votes: z.number(),
				voters: z.array(z.string()),
			}),
		)
		.optional(),
	message: z.string(),
});

export type MeetingCoordinatorInput = z.infer<
	typeof meetingCoordinatorInputSchema
>;
export type MeetingCoordinatorOutput = z.infer<
	typeof meetingCoordinatorOutputSchema
>;

export const MeetingCoordinatorAgent: Agent<
	MeetingCoordinatorInput,
	AgentResult<MeetingCoordinatorOutput>
> = {
	name: "MeetingCoordinatorAgent",
	description:
		"Coordinates group meetings by finding common availability and scheduling optimal times",

	async execute(
		input: MeetingCoordinatorInput,
	): Promise<AgentResult<MeetingCoordinatorOutput>> {
		agentLogger.logStart("MeetingCoordinatorAgent", input);

		try {
			// Validate input
			const validatedInput = meetingCoordinatorInputSchema.parse(input);

			let mockOutput: MeetingCoordinatorOutput;

			switch (validatedInput.action) {
				case "findAvailability": {
					// Find overlapping available time slots
					const availableSlots: MeetingCoordinatorOutput["availableSlots"] = [];

					if (validatedInput.participants.length > 0) {
						// Simple mock: find first common slot
						const firstParticipant = validatedInput.participants[0];
						for (const slot of firstParticipant.availability) {
							if (!slot.available) continue;

							// Check if all participants are available at this time
							const allAvailable = validatedInput.participants.every((p) =>
								p.availability.some(
									(s) =>
										s.available &&
										s.start <= slot.start &&
										s.end >= slot.end,
								),
							);

							if (allAvailable) {
								availableSlots.push({
									start: slot.start,
									end: slot.end,
									participants: validatedInput.participants.map((p) => p.userId),
									score: 0.8, // Mock preference score
								});
								break; // Return first match for mock
							}
						}
					}

					mockOutput = {
						availableSlots,
						message:
							availableSlots.length > 0
								? `Found ${availableSlots.length} available time slot(s)`
								: "No common availability found",
					};
					break;
				}

				case "scheduleMeeting": {
					if (!validatedInput.meetingDetails) {
						throw new Error("Meeting details required for scheduleMeeting action");
					}

					// Mock: schedule at first available slot
					const firstSlot = validatedInput.participants[0]?.availability.find(
						(s) => s.available,
					);

					if (!firstSlot) {
						throw new Error("No available time slots found");
					}

					const start = new Date(firstSlot.start);
					const end = new Date(start.getTime() + validatedInput.meetingDetails.duration * 60 * 1000);

					mockOutput = {
						scheduledMeeting: {
							id: `meeting-${Date.now()}`,
							title: validatedInput.meetingDetails.title,
							start: start.toISOString(),
							end: end.toISOString(),
							participants: validatedInput.participants.map((p) => p.userId),
							location: validatedInput.meetingDetails.location,
						},
						message: "Meeting scheduled successfully",
					};
					break;
				}

				case "proposeTimes": {
					if (!validatedInput.meetingDetails) {
						throw new Error("Meeting details required for proposeTimes action");
					}

					// Mock: propose 3 time options
					const proposedTimes: MeetingCoordinatorOutput["proposedTimes"] = [
						{
							start: "2024-10-16T10:00:00Z",
							end: "2024-10-16T11:00:00Z",
							votes: 0,
							voters: [],
						},
						{
							start: "2024-10-16T14:00:00Z",
							end: "2024-10-16T15:00:00Z",
							votes: 0,
							voters: [],
						},
						{
							start: "2024-10-17T10:00:00Z",
							end: "2024-10-17T11:00:00Z",
							votes: 0,
							voters: [],
						},
					];

					mockOutput = {
						proposedTimes,
						message: "Time proposals generated",
					};
					break;
				}

				default:
					throw new Error(`Unknown action: ${validatedInput.action}`);
			}

			agentLogger.logSuccess("MeetingCoordinatorAgent", mockOutput);

			return {
				success: true,
				timestamp: new Date().toISOString(),
				agentName: "MeetingCoordinatorAgent",
				message: mockOutput.message,
				data: mockOutput,
			};
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			agentLogger.logError("MeetingCoordinatorAgent", errorMessage, { input });

			return {
				success: false,
				timestamp: new Date().toISOString(),
				agentName: "MeetingCoordinatorAgent",
				error: errorMessage,
			};
		}
	},
};

