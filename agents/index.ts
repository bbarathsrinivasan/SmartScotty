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

export {
	PrioritizationAgent,
	prioritize,
	testPrioritizationAgent,
} from "./prioritization-agent";
export type {
	PrioritizationInput,
	PrioritizationOutput,
	PrioritizedTask,
	TaskInput,
} from "./prioritization-agent";

export {
	StudyPlannerAgent,
	generateDailyPlan,
	generateWeeklyPlan,
	testStudyPlannerAgent,
} from "./study-planner-agent";
export type {
	StudyPlannerInput,
	StudyPlannerOutput,
	StudyBlock,
	Availability,
} from "./study-planner-agent";

export { CalendarAgent } from "./calendar-agent";
export type { CalendarAgentInput, CalendarAgentOutput } from "./calendar-agent";

export { MeetingCoordinatorAgent } from "./meeting-coordinator-agent";
export type {
	MeetingCoordinatorInput,
	MeetingCoordinatorOutput,
} from "./meeting-coordinator-agent";

export {
	LearningAgent,
	guide,
	testLearningAgent,
} from "./learning-agent";
export type {
	LearningAgentInput,
	LearningAgentOutput,
	CourseContextType,
} from "./learning-agent";
export { mockAssignments, getMockAssignments } from "./mock-assignments";
export type { MockAssignment, AssignmentType, CourseContext } from "./mock-assignments";

export {
	SafetySupervisorAgent,
	enforce,
	testSafetyAgent,
} from "./safety-supervisor-agent";
export type {
	SafetySupervisorInput,
	SafetySupervisorOutput,
} from "./safety-supervisor-agent";

