import { GoogleGenAI } from "@google/genai";

// Note: In a real deployment, ensure process.env.API_KEY is set. 
// Since we can't control env vars here, we assume the environment is configured correctly.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const generateAIResponse = async (prompt: string, systemInstruction?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the neural network right now. Please try again later.";
  }
};

export const evaluateInterview = async (transcript: string) => {
  const systemInstruction = `
    You are a senior talent scout at Marlion Technologies. 
    Analyze the following interview transcript where a student describes their project idea and vision.
    
    Evaluate based on:
    1. Clarity of Vision (Do they know what they want to build?)
    2. Passion/Inspiration (Are they genuinely interested?)
    3. Past Attempts (Have they tried to solve it, even non-technically?)
    4. Feasibility (Is it realistic for an internship?)
    
    Determine a score (0-100).
    Provide a JSON output with keys: score, summary, decision.
  `;
  
  try {
    // We request JSON for structured data processing
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: transcript,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json"
        }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Evaluation Error:", error);
    return { score: 50, summary: "Evaluation failed due to technical error.", decision: "REVIEW" };
  }
};

export const getCourseContextHelp = async (videoContext: string, query: string) => {
    const prompt = `Context: Video about ${videoContext}. User Query: ${query}`;
    return await generateAIResponse(prompt, "You are a helpful teaching assistant for a coding bootcamp.");
};