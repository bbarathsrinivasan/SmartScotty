import { z } from "zod";

/**
 * Base type for all TartanOptimus agents.
 * Each agent must implement structured inputs and outputs.
 */
export type Agent<Input, Output> = {
  /**
   * Agent name for logging and identification
   */
  name: string;

  /**
   * Agent description/purpose
   */
  description: string;

  /**
   * Execute the agent with structured input and return structured output
   */
  execute(input: Input): Promise<Output>;
};

/**
 * Common agent result wrapper with metadata
 */
export const agentResultSchema = z.object({
  success: z.boolean(),
  timestamp: z.string(),
  agentName: z.string(),
  message: z.string().optional(),
});

export type AgentResult<T> = z.infer<typeof agentResultSchema> & {
  data?: T;
};

/**
 * Common error result
 */
export const agentErrorSchema = z.object({
  success: z.literal(false),
  timestamp: z.string(),
  agentName: z.string(),
  error: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type AgentError = z.infer<typeof agentErrorSchema>;

/**
 * Course information structure
 */
export const courseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  semester: z.string(),
  instructor: z.string().optional(),
});

export type Course = z.infer<typeof courseSchema>;

/**
 * Assignment structure
 */
export const assignmentSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string(),
  points: z.number().optional(),
  submitted: z.boolean(),
  grade: z.number().optional(),
});

export type Assignment = z.infer<typeof assignmentSchema>;

/**
 * Task structure for prioritization and planning
 */
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string(),
  estimatedHours: z.number(),
  priority: z.number().optional(),
  dependencies: z.array(z.string()).optional(),
  courseId: z.string().optional(),
});

export type Task = z.infer<typeof taskSchema>;

/**
 * Time slot structure
 */
export const timeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
  available: z.boolean(),
});

export type TimeSlot = z.infer<typeof timeSlotSchema>;

/**
 * Calendar event structure
 */
export const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.string(),
  end: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["class", "study", "meeting", "deadline", "other"]),
});

export type CalendarEvent = z.infer<typeof calendarEventSchema>;
