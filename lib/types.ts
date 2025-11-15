import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/artifact";
import type { createDocument } from "./ai/tools/create-document";
import type { getCanvasData } from "./ai/tools/get-canvas-data";
import type { getCourseWebsiteData } from "./ai/tools/get-course-website-data";
import type { getPrioritization } from "./ai/tools/get-prioritization";
import type { getStudyPlan } from "./ai/tools/get-study-plan";
import type { getWeather } from "./ai/tools/get-weather";
import type { getWorkloadEstimate } from "./ai/tools/get-workload-estimate";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { updateDocument } from "./ai/tools/update-document";
import type { Suggestion } from "./db/schema";
import type { AppUsage } from "./usage";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type getCanvasDataTool = InferUITool<ReturnType<typeof getCanvasData>>;
type getCourseWebsiteDataTool = InferUITool<
  ReturnType<typeof getCourseWebsiteData>
>;
type getWorkloadEstimateTool = InferUITool<
  ReturnType<typeof getWorkloadEstimate>
>;
type getPrioritizationTool = InferUITool<
  ReturnType<typeof getPrioritization>
>;
type getStudyPlanTool = InferUITool<ReturnType<typeof getStudyPlan>>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;

export type ChatTools = {
  getWeather: weatherTool;
  getCanvasData: getCanvasDataTool;
  getCourseWebsiteData: getCourseWebsiteDataTool;
  getWorkloadEstimate: getWorkloadEstimateTool;
  getPrioritization: getPrioritizationTool;
  getStudyPlan: getStudyPlanTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  usage: AppUsage;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
