/**
 * Test script for CanvasAgent
 * Run with: npx tsx agents/test-canvas.ts
 */

import { testCanvasAgent } from "./canvas-agent";

// Run the test
testCanvasAgent().catch((error) => {
	console.error("Test failed:", error);
	process.exit(1);
});

