/**
 * Mock Assignments for Testing LearningAgent (Anti-AIV)
 * 
 * Contains sample assignments from various courses including:
 * - Machine Learning (theory/MCQ + coding)
 * - Database Systems
 * - Algorithms
 * - Statistics
 */

export type AssignmentType = "homework" | "project" | "exam" | "quiz" | "mcq" | "coding" | "theory";

export type CourseContext = {
	course_id?: string;
	course_name?: string;
	topic?: string;
	assignment_type?: AssignmentType;
};

export type MockAssignment = {
	id: string;
	question: string;
	course_context: CourseContext;
	expected_guidance_type: "conceptual" | "hint" | "question" | "process";
};

export const mockAssignments: MockAssignment[] = [
	// Machine Learning - Theory/MCQ
	{
		id: "ml-001",
		question: "What is the answer to this MCQ: In linear regression, what happens to the cost function when we use gradient descent? A) It always decreases B) It may increase C) It stays constant D) It depends on learning rate",
		course_context: {
			course_id: "10-601",
			course_name: "Introduction to Machine Learning",
			topic: "linear regression",
			assignment_type: "mcq",
		},
		expected_guidance_type: "hint",
	},
	{
		id: "ml-002",
		question: "Explain the difference between overfitting and underfitting in machine learning models.",
		course_context: {
			course_id: "10-601",
			course_name: "Introduction to Machine Learning",
			topic: "overfitting",
			assignment_type: "theory",
		},
		expected_guidance_type: "conceptual",
	},
	{
		id: "ml-003",
		question: "What is the formula for calculating the gradient in backpropagation?",
		course_context: {
			course_id: "10-601",
			course_name: "Introduction to Machine Learning",
			topic: "neural networks",
			assignment_type: "theory",
		},
		expected_guidance_type: "process",
	},
	{
		id: "ml-004",
		question: "Which regularization technique is better: L1 or L2? Give me the answer.",
		course_context: {
			course_id: "10-601",
			course_name: "Introduction to Machine Learning",
			topic: "regularization",
			assignment_type: "mcq",
		},
		expected_guidance_type: "hint",
	},

	// Machine Learning - Coding
	{
		id: "ml-005",
		question: "Write a complete Python function to implement linear regression from scratch. Include the full code.",
		course_context: {
			course_id: "10-601",
			course_name: "Introduction to Machine Learning",
			topic: "linear regression",
			assignment_type: "coding",
		},
		expected_guidance_type: "process",
	},
	{
		id: "ml-006",
		question: "I need to implement gradient descent. Can you give me the solution code?",
		course_context: {
			course_id: "10-601",
			course_name: "Introduction to Machine Learning",
			topic: "gradient descent",
			assignment_type: "coding",
		},
		expected_guidance_type: "hint",
	},
	{
		id: "ml-007",
		question: "How do I preprocess data for a neural network? I've tried normalizing but it's not working.",
		course_context: {
			course_id: "10-601",
			course_name: "Introduction to Machine Learning",
			topic: "data preprocessing",
			assignment_type: "coding",
		},
		expected_guidance_type: "hint",
	},
	{
		id: "ml-008",
		question: "Show me step-by-step how to implement a neural network from scratch in Python.",
		course_context: {
			course_id: "10-601",
			course_name: "Introduction to Machine Learning",
			topic: "neural networks",
			assignment_type: "coding",
		},
		expected_guidance_type: "process",
	},

	// Database Systems
	{
		id: "db-001",
		question: "Write a SQL query to find all students who have enrolled in more than 3 courses. Give me the complete query.",
		course_context: {
			course_id: "15-445",
			course_name: "Database Systems",
			topic: "SQL queries",
			assignment_type: "coding",
		},
		expected_guidance_type: "hint",
	},
	{
		id: "db-002",
		question: "What is the answer: In database normalization, what is the difference between 3NF and BCNF? A) BCNF is stricter B) 3NF is stricter C) They are the same D) It depends",
		course_context: {
			course_id: "15-445",
			course_name: "Database Systems",
			topic: "normalization",
			assignment_type: "mcq",
		},
		expected_guidance_type: "hint",
	},
	{
		id: "db-003",
		question: "I'm trying to design an index for a table. What factors should I consider?",
		course_context: {
			course_id: "15-445",
			course_name: "Database Systems",
			topic: "indexing",
			assignment_type: "theory",
		},
		expected_guidance_type: "conceptual",
	},
	{
		id: "db-004",
		question: "Explain how a B+ tree index works. I need the complete explanation with examples.",
		course_context: {
			course_id: "15-445",
			course_name: "Database Systems",
			topic: "indexing",
			assignment_type: "theory",
		},
		expected_guidance_type: "conceptual",
	},

	// Algorithms
	{
		id: "algo-001",
		question: "Solve this dynamic programming problem: Given an array of coins and a target amount, find the minimum number of coins needed. Provide the complete solution.",
		course_context: {
			course_id: "15-451",
			course_name: "Algorithm Design and Analysis",
			topic: "dynamic programming",
			assignment_type: "coding",
		},
		expected_guidance_type: "process",
	},
	{
		id: "algo-002",
		question: "What is the time complexity of Dijkstra's algorithm? A) O(V) B) O(V log V) C) O(V^2) D) O(E log V)",
		course_context: {
			course_id: "15-451",
			course_name: "Algorithm Design and Analysis",
			topic: "graph algorithms",
			assignment_type: "mcq",
		},
		expected_guidance_type: "hint",
	},
	{
		id: "algo-003",
		question: "I'm stuck on implementing a graph traversal algorithm. Can you give me the code?",
		course_context: {
			course_id: "15-451",
			course_name: "Algorithm Design and Analysis",
			topic: "graph algorithms",
			assignment_type: "coding",
		},
		expected_guidance_type: "hint",
	},
	{
		id: "algo-004",
		question: "How do I analyze the complexity of a recursive algorithm? I've tried counting operations but I'm confused.",
		course_context: {
			course_id: "15-451",
			course_name: "Algorithm Design and Analysis",
			topic: "complexity analysis",
			assignment_type: "theory",
		},
		expected_guidance_type: "conceptual",
	},

	// Statistics
	{
		id: "stats-001",
		question: "What is the p-value for this hypothesis test? The test statistic is 2.5 and degrees of freedom is 10. Give me the exact answer.",
		course_context: {
			course_id: "36-200",
			course_name: "Reasoning with Data",
			topic: "hypothesis testing",
			assignment_type: "theory",
		},
		expected_guidance_type: "hint",
	},
	{
		id: "stats-002",
		question: "Explain when to use a t-test vs z-test. I need a complete step-by-step guide.",
		course_context: {
			course_id: "36-200",
			course_name: "Reasoning with Data",
			topic: "hypothesis testing",
			assignment_type: "theory",
		},
		expected_guidance_type: "conceptual",
	},
	{
		id: "stats-003",
		question: "What is the probability that X > 5 if X follows a normal distribution with mean 3 and standard deviation 2? Calculate the exact value.",
		course_context: {
			course_id: "36-200",
			course_name: "Reasoning with Data",
			topic: "probability distributions",
			assignment_type: "theory",
		},
		expected_guidance_type: "hint",
	},
	{
		id: "stats-004",
		question: "I'm trying to understand confidence intervals. What concepts should I review?",
		course_context: {
			course_id: "36-200",
			course_name: "Reasoning with Data",
			topic: "confidence intervals",
			assignment_type: "theory",
		},
		expected_guidance_type: "conceptual",
	},
];

/**
 * Get mock assignments by course or type
 */
export function getMockAssignments(
	filter?: { course_id?: string; assignment_type?: AssignmentType },
): MockAssignment[] {
	if (!filter) {
		return mockAssignments;
	}

	return mockAssignments.filter((assignment) => {
		if (filter.course_id && assignment.course_context.course_id !== filter.course_id) {
			return false;
		}
		if (
			filter.assignment_type &&
			assignment.course_context.assignment_type !== filter.assignment_type
		) {
			return false;
		}
		return true;
	});
}

