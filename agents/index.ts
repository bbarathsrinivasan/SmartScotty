/**
 * TartanOptimus Agent System
 *
 * Central export point for all agents.
 * Each agent is standalone but can be chained together.
 */

export * from "./types";
export * from "./logger";

// Agent exports
export { CanvasAgent, testCanvasAgent } from "./canvas-agent";
export type {
	CanvasAgentInput,
	CanvasAgentOutput,
	NormalizedAssignment,
} from "./canvas-agent";

export {
	CourseWebsiteCrawlerAgent,
	testCrawlerAgent,
} from "./course-website-crawler-agent";
export type {
	CourseWebsiteCrawlerInput,
	CourseWebsiteCrawlerOutput,
} from "./course-website-crawler-agent";

export {
	WorkloadEstimatorAgent,
	estimate,
	testWorkloadEstimator,
} from "./workload-estimator-agent";
export type {
	WorkloadEstimatorInput,
	WorkloadEstimatorOutput,
} from "./workload-estimator-agent";

export { PrioritizationAgent } from "./prioritization-agent";
export type { PrioritizationInput, PrioritizationOutput } from "./prioritization-agent";

export { StudyPlannerAgent } from "./study-planner-agent";
export type { StudyPlannerInput, StudyPlannerOutput } from "./study-planner-agent";

export { CalendarAgent } from "./calendar-agent";
export type { CalendarAgentInput, CalendarAgentOutput } from "./calendar-agent";

export { MeetingCoordinatorAgent } from "./meeting-coordinator-agent";
export type {
	MeetingCoordinatorInput,
	MeetingCoordinatorOutput,
} from "./meeting-coordinator-agent";

export { LearningAgent } from "./learning-agent";
export type { LearningAgentInput, LearningAgentOutput } from "./learning-agent";

export { SafetySupervisorAgent } from "./safety-supervisor-agent";
export type {
	SafetySupervisorInput,
	SafetySupervisorOutput,
} from "./safety-supervisor-agent";

