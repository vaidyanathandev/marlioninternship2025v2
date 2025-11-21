/**
 * AI Service Integration
 *
 * Note: DigitalOcean doesn't have a native AI API as of Jan 2025.
 * This implementation uses OpenAI-compatible API format which works with:
 * - OpenAI
 * - Anthropic Claude (via their API)
 * - Local models via Ollama
 * - Other OpenAI-compatible endpoints
 *
 * Configure the endpoint and API key via environment variables.
 */

import { getAIConfig } from "@marlion/config";
import type { InterviewEvaluation } from "@marlion/types";

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Make API request to AI service
 */
const makeAIRequest = async (
  messages: AIMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  } = {}
): Promise<string> => {
  const config = getAIConfig();

  // Use OpenAI API format (compatible with many providers)
  const response = await fetch(`${config.endpoint}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo-preview", // Adjust based on your provider
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API Error: ${response.status} - ${error}`);
  }

  const data: AIResponse = await response.json();
  return data.choices[0]?.message?.content ?? "";
};

/**
 * Generate general AI response
 */
export const generateAIResponse = async (
  prompt: string,
  systemInstruction?: string
): Promise<string> => {
  const messages: AIMessage[] = [];

  if (systemInstruction) {
    messages.push({
      role: "system",
      content: systemInstruction,
    });
  }

  messages.push({
    role: "user",
    content: prompt,
  });

  return await makeAIRequest(messages);
};

/**
 * Evaluate interview transcript
 */
export const evaluateInterview = async (transcript: string): Promise<InterviewEvaluation> => {
  const systemInstruction = `You are an expert interviewer evaluating a student's responses for an internship position.
Analyze the conversation and provide a detailed evaluation.

Return your response as valid JSON with this exact structure:
{
  "score": <number 0-100>,
  "summary": "<brief summary>",
  "decision": "<SELECT or REJECT>",
  "technicalScore": <number 0-100>,
  "passionScore": <number 0-100>,
  "curiosityScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "reasoning": "<detailed reasoning>"
}

Evaluation criteria:
- Technical Score: Understanding of concepts, problem-solving ability
- Passion Score: Enthusiasm, motivation, genuine interest
- Curiosity Score: Asking questions, desire to learn, exploration mindset
- Communication Score: Clarity, articulation, coherence

Overall score should be weighted average. Decision should be SELECT if score >= 60, REJECT otherwise.`;

  const prompt = `Interview Transcript:\n\n${transcript}\n\nProvide your evaluation in JSON format.`;

  const response = await makeAIRequest(
    [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt },
    ],
    { temperature: 0.3, jsonMode: true }
  );

  try {
    const evaluation: InterviewEvaluation = JSON.parse(response);
    return evaluation;
  } catch (error) {
    console.error("Failed to parse AI evaluation:", error);
    throw new Error("Failed to parse AI evaluation response");
  }
};

/**
 * Get course contextual help
 */
export const getCourseContextHelp = async (
  videoContext: string,
  query: string
): Promise<string> => {
  const systemInstruction = `You are a helpful teaching assistant for an internship bootcamp program.
You have access to the context of the video lecture the student is watching.
Provide clear, concise, and helpful explanations. Use examples when appropriate.
Encourage the student to think critically and explore further.`;

  const prompt = `Video Context: ${videoContext}

Student Question: ${query}

Provide a helpful response:`;

  return await makeAIRequest(
    [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt },
    ],
    { temperature: 0.7 }
  );
};

/**
 * Generate FAQ response (for home page chatbot)
 */
export const generateFAQResponse = async (question: string): Promise<string> => {
  const systemInstruction = `You are an AI assistant for Marlion Technologies Winter Internship 2025 program.

Program Details:
- FREE internship program
- Duration: 2-12 weeks (student's choice)
- Start Date: December 2, 2025
- Registration Deadline: November 30, 2025
- Office Hours: 10 AM - 5 PM (Mon-Sat)
- Location: Madurai, Tamil Nadu

4 Streams:
1. Immersive Tech (AR/VR)
2. Full Stack Development (Web & Mobile)
3. Agentic AI
4. Data Science (AI/ML)

Theme: Building assistive technologies and IEP for neurodiverse children

Process:
1. Register online
2. Complete AI interview (5 mins)
3. Wait for selection (24 hours)
4. Accept offer letter
5. Complete bootcamp modules
6. Work on assigned/proposed project
7. Receive certificate

Contact:
- Email: social@marliontech.com
- Phone: +91 9486734438
- Website: https://www.marliontech.com/

Answer questions clearly and encouragingly. Be helpful and enthusiastic about the program.`;

  return await makeAIRequest(
    [
      { role: "system", content: systemInstruction },
      { role: "user", content: question },
    ],
    { temperature: 0.7 }
  );
};

/**
 * Conduct interview conversation
 */
export const generateInterviewQuestion = async (
  conversation: Array<{ role: "ai" | "student"; content: string }>,
  progress: number
): Promise<string> => {
  const systemInstruction = `You are an AI interviewer for Marlion Technologies internship program.

Your goal is to assess:
1. Technical understanding and problem-solving ability
2. Passion and genuine interest in the field
3. Curiosity and desire to learn
4. Communication skills

Interview structure (5 minutes):
- Progress 0-25%: Introduction, background, why interested
- Progress 25-50%: Technical questions based on their stream
- Progress 50-75%: Problem-solving scenarios
- Progress 75-100%: Motivation, goals, wrap up

Be conversational, encouraging, and insightful. Ask follow-up questions based on their responses.
Keep responses concise (2-3 sentences max).

Current progress: ${progress}%`;

  const messages: AIMessage[] = [{ role: "system", content: systemInstruction }];

  conversation.forEach((msg) => {
    messages.push({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.content,
    });
  });

  if (conversation.length === 0) {
    messages.push({
      role: "user",
      content: "Start the interview.",
    });
  }

  return await makeAIRequest(messages, { temperature: 0.8, maxTokens: 150 });
};

/**
 * Evaluate knowledge check for bootcamp module
 */
export const evaluateKnowledgeCheck = async (
  moduleContext: string,
  studentResponse: string
): Promise<{
  score: number;
  passed: boolean;
  feedback: string;
}> => {
  const systemInstruction = `You are evaluating a student's understanding of a bootcamp module.
Assess their response and provide a score (0-100) and constructive feedback.

Return JSON:
{
  "score": <number 0-100>,
  "passed": <boolean, true if score >= 70>,
  "feedback": "<constructive feedback>"
}`;

  const prompt = `Module Context: ${moduleContext}

Student Response: ${studentResponse}

Evaluate the response:`;

  const response = await makeAIRequest(
    [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt },
    ],
    { temperature: 0.3, jsonMode: true }
  );

  try {
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to parse knowledge check evaluation:", error);
    throw new Error("Failed to parse evaluation response");
  }
};

/**
 * Generate certificate summary and feedback
 */
export const generateCertificateSummary = async (
  studentName: string,
  projectTitle: string,
  performance: {
    bootcampScore: number;
    projectProgress: number;
    dailyLogCount: number;
  }
): Promise<{
  summary: string;
  feedback: string;
}> => {
  const systemInstruction = `Generate a professional and encouraging certificate summary and feedback for an internship completion.

Return JSON:
{
  "summary": "<1-2 sentence journey summary>",
  "feedback": "<encouraging feedback with specific achievements and future directions>"
}`;

  const prompt = `Student: ${studentName}
Project: ${projectTitle}
Bootcamp Score: ${performance.bootcampScore}/100
Project Progress: ${performance.projectProgress}%
Daily Logs Submitted: ${performance.dailyLogCount}

Generate summary and feedback:`;

  const response = await makeAIRequest(
    [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt },
    ],
    { temperature: 0.7, jsonMode: true }
  );

  try {
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to parse certificate generation:", error);
    throw new Error("Failed to generate certificate content");
  }
};

/**
 * Detect copy-paste behavior
 */
export const detectCopyPaste = async (
  question: string,
  answer: string,
  responseTime: number
): Promise<{
  isSuspicious: boolean;
  confidence: number;
  reason: string;
}> => {
  const systemInstruction = `Analyze if a student's response seems to be copy-pasted from AI.

Indicators of copy-paste:
- Very fast response for complex answer (< 10 seconds for 100+ words)
- Overly formal or generic language
- Perfect grammar and structure
- Lacks personal voice

Return JSON:
{
  "isSuspicious": <boolean>,
  "confidence": <number 0-100>,
  "reason": "<brief explanation>"
}`;

  const prompt = `Question: ${question}

Answer: ${answer}

Response Time: ${responseTime} seconds

Analyze:`;

  const response = await makeAIRequest(
    [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt },
    ],
    { temperature: 0.2, jsonMode: true }
  );

  try {
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to parse copy-paste detection:", error);
    return { isSuspicious: false, confidence: 0, reason: "Analysis failed" };
  }
};
