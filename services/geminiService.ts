import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Define the response schema for note analysis
const noteAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise summary of the note content (max 3 sentences).",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Relevant tags for categorization (e.g., #meeting, #urgent, #idea).",
    },
    actionItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
          dueDate: { type: Type.STRING, description: "YYYY-MM-DD format if mentioned, else null" }
        },
        required: ["description", "priority"]
      },
      description: "Extracted actionable tasks from the note."
    },
    entities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Key people, projects, or companies mentioned."
    }
  },
  required: ["summary", "tags", "actionItems"]
};

export const analyzeNoteContent = async (text: string) => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following note content. Extract action items, generate a summary, identify entities, and suggest tags. 
      
      Note Content:
      "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: noteAnalysisSchema,
        systemInstruction: "You are an expert executive assistant. Analyze notes to extract structured productivity data."
      }
    });

    let resultText = response.text;
    if (!resultText) return null;
    
    // Clean up potential markdown formatting
    if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
    }
    
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

export const generateRetroInsights = async (notesText: string[]) => {
    if (!apiKey) return "API Key missing.";

    try {
        const combined = notesText.join("\n---\n");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Review the following set of notes from the past week. Provide a high-level strategic review of progress, recurring themes, and missed opportunities.
            
            Notes:
            ${combined}`,
            config: {
                systemInstruction: "You are a strategic productivity coach."
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating retro:", error);
        return "Could not generate insights at this time.";
    }
}