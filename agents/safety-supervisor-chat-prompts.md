# SafetySupervisorAgent Chat Integration - Example Prompts

## Overview

SafetySupervisorAgent has been integrated into the chat interface. This agent acts as a safety layer that analyzes responses from other agents (especially LearningAgent) to detect Anti-AIV violations and rewrite them into educational guidance.

## Integration Details

### Tool: `getSafetySupervision`

The tool accepts:
- `response_text`: The response text to analyze
- `agent_name`: Optional name of the agent that produced the response
- `source_context`: Optional context (question, course_id, assignment_type)

### What It Does

**Detects Violations:**
- Direct solutions
- Assignment answers (including MCQ)
- Full code implementations
- Step-by-step solutions
- Numeric answers

**Rewrites Into:**
- Hints and thought frameworks
- Conceptual explanations
- Educational guidance
- Always ends with a guiding question

## Example Chat Prompts

### Testing Safety Supervision

1. **"Check if this response is safe: The solution is to use gradient descent. Step 1: Initialize weights. Step 2: Calculate gradient. The answer is option B."**
   - **Expected**: Detects violations, rewrites into educational guidance

2. **"Analyze this response for violations: Here's the complete code: [code block]"**
   - **Expected**: Detects code violation, rewrites into hints

3. **"Check this response: The correct answer is option A. In linear regression, the cost function always decreases."**
   - **Expected**: Detects answer violation, rewrites into guidance

4. **"Is this response safe? Think about what the cost function represents. Consider the learning rate."**
   - **Expected**: No violations detected, adds guiding question if missing

5. **"Rewrite this to be educational: Step 1: Calculate the mean. Step 2: Calculate the variance. Step 3: The result is 0.05"**
   - **Expected**: Detects step-by-step and numeric violations, rewrites

### Testing with LearningAgent Outputs

6. **"I asked LearningAgent about linear regression and got this response: [response]. Check if it's safe."**
   - **Expected**: Analyzes the response for violations

7. **"Check this LearningAgent response for Anti-AIV violations: [response text]"**
   - **Expected**: Detects and rewrites any violations

8. **"Analyze this response from LearningAgent: The solution is option A. Here's the complete answer."**
   - **Expected**: Detects violations, provides rewritten version

### Testing Different Violation Types

9. **"Check this response: The p-value is 0.0234. The exact value equals 0.0234."**
   - **Expected**: Detects numeric answer violation

10. **"Analyze this: Here's how to solve this problem step by step: Step 1: ... Step 2: ... Step 3: ..."**
    - **Expected**: Detects step-by-step violation

11. **"Check this code response: [complete Python function with implementation]"**
    - **Expected**: Detects code violation

12. **"Is this safe? The correct answer is option B. Option B is the right choice."**
    - **Expected**: Detects MCQ answer violation

### Testing Safe Responses

13. **"Check this response: Think about what the cost function represents. Consider how gradient descent uses the gradient."**
    - **Expected**: No violations, may add guiding question

14. **"Analyze this: Here are some hints: 1) Consider the learning rate 2) Think about convergence"**
    - **Expected**: No violations, safe response

15. **"Check if this is educational: What happens to the cost function as you iterate? How does the learning rate affect convergence?"**
    - **Expected**: No violations, already has guiding questions

### Integration Testing

16. **"I got this response from LearningAgent. Check if it needs to be rewritten: [response with solution]"**
    - **Expected**: Detects violations, provides rewritten version

17. **"Analyze this agent output for safety: [response text from any agent]"**
    - **Expected**: Checks for violations, rewrites if needed

18. **"Check this response and rewrite it to be educational: [response with code/solution]"**
    - **Expected**: Detects violations, provides educational rewrite

## Expected Behavior

### When Violation Detected

1. **Agent detects violation** with confidence score
2. **Identifies violation type** (solution, answer, code, step_by_step, numeric)
3. **Rewrites response** into educational guidance:
   - Hints instead of solutions
   - Thought frameworks instead of answers
   - Conceptual explanations instead of code
   - Always ends with guiding question
4. **Returns analysis** with detected patterns and confidence

### When No Violation

1. **Agent confirms response is safe**
2. **May add guiding question** if response doesn't end with one
3. **Returns original response** (possibly enhanced)

## Example Responses

### Violation Detected Response

**Input:**
```
"The solution is to use gradient descent. Step 1: Initialize weights. Step 2: Calculate gradient. The answer is option B."
```

**Output:**
```
Violation detected: solution, answer
Confidence: 0.9

Rewritten Response:
"I can't provide direct solutions or answers, but I can help you think through gradient descent.

Instead of giving you the answer, let me guide your thinking:
- Consider what the problem is asking you to determine
- Think about the relevant concepts from class
- Work through a simple example first
- Build up to the full solution incrementally

What specific part of the problem are you finding most challenging?"

Guiding Question: "What happens to the cost function as you iterate through gradient descent, and why?"
```

### Safe Response

**Input:**
```
"Think about what the cost function represents. Consider the learning rate."
```

**Output:**
```
No violations detected.

Response (enhanced):
"Think about what the cost function represents. Consider the learning rate.

What happens to the cost function as you iterate through gradient descent, and why?"

Guiding Question: "What happens to the cost function as you iterate through gradient descent, and why?"
```

## Testing Scenarios

### Scenario 1: Direct Solution
**Prompt**: "Check this response: The solution is to implement linear regression using gradient descent. Here's how: Step 1..."

**Expected**: Violation detected, rewritten into hints

### Scenario 2: MCQ Answer
**Prompt**: "Analyze this: The correct answer is option A. In linear regression, the cost function decreases."

**Expected**: Answer violation detected, rewritten into conceptual guidance

### Scenario 3: Complete Code
**Prompt**: "Check this response: [Complete Python function implementation]"

**Expected**: Code violation detected, rewritten into implementation guidance

### Scenario 4: Step-by-Step Solution
**Prompt**: "Is this safe? Step 1: Calculate mean. Step 2: Calculate variance. Step 3: Apply formula."

**Expected**: Step-by-step violation detected, rewritten into thought process

### Scenario 5: Numeric Answer
**Prompt**: "Check this: The p-value is 0.0234. The exact value equals 0.0234."

**Expected**: Numeric violation detected, rewritten into calculation guidance

### Scenario 6: Safe Response
**Prompt**: "Analyze this: Think about what the cost function measures. Consider the learning rate's role."

**Expected**: No violations, response is safe (may add guiding question)

## Integration Notes

- **Primary Use**: Supervises other agents' outputs (especially LearningAgent)
- **Secondary Use**: Can be called directly to check specific responses
- **Automatic**: Could be integrated as post-processing step for all agent outputs
- **Manual**: Can be explicitly called by users to test responses

## Best Practices

1. **Test with various violation types** to ensure comprehensive detection
2. **Verify guiding questions** are always included
3. **Check that violations are properly rewritten** into educational guidance
4. **Test edge cases** like responses with multiple violation types
5. **Verify safe responses** pass through correctly

## Notes

- The agent is designed to be strict - it will detect violations even in subtle forms
- All violations are rewritten into educational guidance
- Every response ends with a guiding question
- Confidence scores help identify how certain the detection is
- Detected patterns are logged for monitoring and improvement

