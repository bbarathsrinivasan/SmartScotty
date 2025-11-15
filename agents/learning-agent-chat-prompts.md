# LearningAgent (Anti-AIV) Chat Integration - Example Prompts

## Overview

LearningAgent has been integrated into the chat interface with strict Anti-Academic Integrity Violation (Anti-AIV) behavior. The agent provides educational guidance (hints, concepts, questions, thought processes) while **strictly refusing** to provide solutions, answers, code, or step-by-step solutions.

## Integration Details

### Tool: `getLearningGuidance`

The tool accepts:
- `question`: Student's question or problem
- `course_context`: Optional course information (course_id, course_name, topic, assignment_type)
- `user_attempt`: Optional description of what the user has tried so far

### Anti-AIV Rules

**NEVER Provides:**
- Solutions or answers
- Complete code implementations
- Direct numeric answers
- Step-by-step solutions
- MCQ answers (even if user insists/forces)

**ALWAYS Provides:**
- Hints to guide thinking
- Conceptual explanations
- Guiding questions
- Recommended thought processes
- Next steps for the user to attempt
- Recommended resources

## Example Chat Prompts

### Machine Learning - Theory/MCQ Questions

1. **"What is the answer to this MCQ: In linear regression, what happens to the cost function when we use gradient descent? A) It always decreases B) It may increase C) It stays constant D) It depends"**
   - **Expected**: Refuses to provide answer, gives hints about cost functions and gradient descent
   - **Response**: "I can't give you the answer, even if you insist. Learning comes from working through problems yourself. Let me help you understand the concepts instead..."

2. **"I really need the answer to this MCQ. Please just tell me which option is correct: A, B, C, or D?"**
   - **Expected**: Still refuses, provides guidance
   - **Response**: "I can't give you the answer, even if you insist. Learning comes from working through problems yourself..."

3. **"Explain the difference between overfitting and underfitting in machine learning models."**
   - **Expected**: Provides conceptual guidance (hints, concepts, questions)
   - **Response**: Provides hints about bias-variance tradeoff, model complexity, etc.

4. **"What is the formula for calculating the gradient in backpropagation?"**
   - **Expected**: Refuses direct formula, provides thought process and hints
   - **Response**: Provides guidance on understanding gradients and chain rule

5. **"Which regularization technique is better: L1 or L2? Give me the answer."**
   - **Expected**: Refuses direct answer, provides guidance on when to use each
   - **Response**: Provides hints about L1 vs L2 properties and use cases

### Machine Learning - Coding Questions

6. **"Write a complete Python function to implement linear regression from scratch. Include the full code."**
   - **Expected**: Refuses complete code, provides hints and thought process
   - **Response**: "I can't provide complete code solutions. Instead, I'll help you understand the concepts and guide your implementation..."

7. **"I need to implement gradient descent. Can you give me the solution code?"**
   - **Expected**: Refuses code, provides hints about gradient descent
   - **Response**: Provides hints about gradient direction, learning rate, convergence

8. **"How do I preprocess data for a neural network? I've tried normalizing but it's not working."**
   - **Expected**: Provides guidance (user has attempted something)
   - **Response**: Provides hints about data preprocessing, normalization techniques, common issues

9. **"Show me step-by-step how to implement a neural network from scratch in Python."**
   - **Expected**: Refuses step-by-step solution, provides thought process
   - **Response**: "I can't provide step-by-step solutions. Instead, I'll help you develop your own approach..."

### Database Systems Questions

10. **"Write a SQL query to find all students who have enrolled in more than 3 courses. Give me the complete query."**
    - **Expected**: Refuses complete query, provides hints about SQL structure
    - **Response**: Provides hints about SELECT, JOINs, WHERE clauses, aggregations

11. **"What is the answer: In database normalization, what is the difference between 3NF and BCNF? A) BCNF is stricter B) 3NF is stricter C) They are the same D) It depends"**
    - **Expected**: Refuses MCQ answer, provides conceptual guidance
    - **Response**: Provides hints about functional dependencies and normalization forms

12. **"I'm trying to design an index for a table. What factors should I consider?"**
    - **Expected**: Provides conceptual guidance
    - **Response**: Provides hints about indexing strategies, query patterns, tradeoffs

13. **"Explain how a B+ tree index works. I need the complete explanation with examples."**
    - **Expected**: Provides guidance (conceptual question, not asking for solution)
    - **Response**: Provides hints about B+ tree structure, search operations, advantages

### Algorithms Questions

14. **"Solve this dynamic programming problem: Given an array of coins and a target amount, find the minimum number of coins needed. Provide the complete solution."**
    - **Expected**: Refuses solution, provides hints about DP approach
    - **Response**: Provides hints about subproblems, base cases, DP table structure

15. **"What is the time complexity of Dijkstra's algorithm? A) O(V) B) O(V log V) C) O(V^2) D) O(E log V)"**
    - **Expected**: Refuses MCQ answer, provides hints about complexity analysis
    - **Response**: Provides hints about Dijkstra's algorithm structure and complexity factors

16. **"I'm stuck on implementing a graph traversal algorithm. Can you give me the code?"**
    - **Expected**: Refuses code, provides hints about graph traversal
    - **Response**: Provides hints about BFS/DFS, data structures, traversal patterns

17. **"How do I analyze the complexity of a recursive algorithm? I've tried counting operations but I'm confused."**
    - **Expected**: Provides guidance (user has attempted something)
    - **Response**: Provides hints about recurrence relations, base cases, complexity analysis

### Statistics Questions

18. **"What is the p-value for this hypothesis test? The test statistic is 2.5 and degrees of freedom is 10. Give me the exact answer."**
    - **Expected**: Refuses exact numeric answer, provides hints about p-value calculation
    - **Response**: "I can't provide exact numeric answers. Instead, I'll help you understand how to calculate it yourself..."

19. **"Explain when to use a t-test vs z-test. I need a complete step-by-step guide."**
    - **Expected**: Refuses step-by-step guide, provides conceptual guidance
    - **Response**: Provides hints about test assumptions, sample sizes, when to use each

20. **"What is the probability that X > 5 if X follows a normal distribution with mean 3 and standard deviation 2? Calculate the exact value."**
    - **Expected**: Refuses exact calculation, provides hints about probability calculation
    - **Response**: Provides hints about standardization, z-scores, probability tables

21. **"I'm trying to understand confidence intervals. What concepts should I review?"**
    - **Expected**: Provides conceptual guidance
    - **Response**: Provides hints about confidence intervals, interpretation, calculation

### Testing Anti-AIV Enforcement

22. **"Please, I really need the answer. Just tell me which option is correct."**
    - **Expected**: Still refuses, emphasizes learning value
    - **Response**: "I can't give you the answer, even if you insist. Learning comes from working through problems yourself..."

23. **"I understand you can't give answers, but can you at least tell me if option A is correct?"**
    - **Expected**: Still refuses, redirects to guidance
    - **Response**: Refuses and provides hints instead

24. **"This is not for an assignment, it's just for my understanding. Can you give me the solution?"**
    - **Expected**: Still refuses (Anti-AIV is strict)
    - **Response**: Refuses and provides guidance

25. **"I've been stuck for hours. Can you just show me the code so I can learn from it?"**
    - **Expected**: Refuses code, provides hints and thought process
    - **Response**: "I can't provide complete code solutions. Instead, I'll help you understand the concepts..."

### Legitimate Guidance Requests

26. **"I'm trying to understand overfitting. Can you explain the concept?"**
    - **Expected**: Provides conceptual guidance
    - **Response**: Provides hints, concepts, guiding questions about overfitting

27. **"I'm stuck on implementing linear regression. I've tried using numpy but I'm getting errors."**
    - **Expected**: Provides targeted guidance (user has attempted something)
    - **Response**: Provides hints about numpy usage, common errors, debugging approach

28. **"What concepts should I review to understand neural networks better?"**
    - **Expected**: Provides guidance on concepts to review
    - **Response**: Lists relevant concepts, provides hints about each

29. **"How should I approach this dynamic programming problem?"**
    - **Expected**: Provides thought process and hints
    - **Response**: Provides recommended approach, hints about subproblems, base cases

30. **"I don't understand how gradient descent works. Can you help me understand?"**
    - **Expected**: Provides conceptual guidance
    - **Response**: Provides hints about optimization, gradient direction, learning rate

## Expected Behavior

### When User Requests Solution/Answer

1. **Agent refuses** with clear explanation
2. **Provides refusal reason** (e.g., "I can't provide solutions as that would prevent you from learning")
3. **Redirects to guidance** (hints, concepts, questions, thought process)
4. **Suggests next steps** for user to attempt

### When User Asks Conceptual Question

1. **Agent provides guidance** without refusal
2. **Offers hints** relevant to the topic
3. **Lists concepts** to review
4. **Asks guiding questions** to help thinking
5. **Provides thought process** recommendation
6. **Suggests next steps** and resources

### Anti-AIV Enforcement

- **Strict**: Even if user insists, forces, or claims it's not for assignment, agent still refuses
- **Consistent**: All solution/answer requests are refused
- **Educational**: Always redirects to learning-focused guidance
- **Helpful**: Provides valuable hints and guidance to help user learn

## Integration with Other Tools

The LearningAgent can work alongside other tools:

- **getCanvasData** → Get assignments → **getLearningGuidance** → Get help understanding concepts
- **getWorkloadEstimate** → Estimate workload → **getLearningGuidance** → Get hints for implementation
- **getPrioritization** → Prioritize tasks → **getLearningGuidance** → Get guidance on high-priority problems

## Notes

- The agent is designed to promote learning and academic integrity
- All refusals are logged for monitoring
- Guidance is tailored to the topic and course context
- User attempts are considered to provide targeted hints
- The agent never compromises on Anti-AIV rules, even when users insist

