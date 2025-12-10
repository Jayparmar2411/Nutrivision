import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysis, HistoryItem, UserProfile } from "../types";

// Helper to validate the environment variable
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key not found. Please ensure process.env.API_KEY is set.");
  }
  return key;
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GENERATION_CONFIG = {
  temperature: 0,
  topP: 1,
  topK: 1,
  seed: 42,
  responseMimeType: "application/json",
};

export const analyzeFoodImage = async (base64Image: string): Promise<FoodAnalysis> => {
  try {
    // Strip header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: `Analyze the food shown in this image with strict nutritional accuracy.
            
            1. Identify the main food item and all visible ingredients.
            2. Estimate the portion size strictly based on visual cues.
            3. Calculate Total Calories, Protein, Carbs, and Fat for this specific portion.
            
            CRITICAL CONSTRAINTS:
            - Use standard USDA nutritional data values for the identified food and portion.
            - Do not guess or output ranges. Return exact single integer values.
            - Output MUST be deterministic. Identical image inputs must yield identical outputs.
            - If the food is a common composite dish (e.g. Pizza, Burger), break it down by standard components to sum the calories.`
          }
        ]
      },
      config: {
        ...GENERATION_CONFIG,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING, description: "Name of the food identified" },
            calories: { type: Type.INTEGER, description: "Estimated calories (Standard Value)" },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.INTEGER, description: "Protein in grams" },
                carbs: { type: Type.INTEGER, description: "Carbohydrates in grams" },
                fat: { type: Type.INTEGER, description: "Fat in grams" }
              },
              required: ["protein", "carbs", "fat"]
            },
            ingredients: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "List of identified ingredients" 
            },
            healthTip: { type: Type.STRING, description: "A short, actionable health tip about this food" },
            confidenceScore: { type: Type.INTEGER, description: "Confidence score from 0 to 100" }
          },
          required: ["foodName", "calories", "macros", "ingredients", "healthTip", "confidenceScore"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as FoodAnalysis;
    // Sort ingredients to ensure deterministic behavior for future comparisons
    if (data.ingredients) data.ingredients.sort();
    else data.ingredients = [];
    
    return data;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze food image.");
  }
};

export const updateNutritionFromIngredients = async (
  foodName: string, 
  ingredients: string[], 
  base64Image?: string
): Promise<Partial<FoodAnalysis>> => {
  try {
    const parts: any[] = [];
    
    // Sort ingredients to ensure identical prompts yield identical results
    const sortedIngredients = [...ingredients].sort().join(", ");

    // Include image if available to maintain context of portion size
    if (base64Image) {
      const cleanBase64 = base64Image.split(',')[1] || base64Image;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64
        }
      });
    }

    const promptText = `
      Analyze the food shown in the image again with strict adherence to standard data.
      
      Primary Constraint: The ingredients list is CONFIRMED to be exactly: "${sortedIngredients}".
      Do not include any other ingredients in your calculation.
      
      Task: Calculate the Total Calories, Protein, Carbs, and Fat for the portion size visible in the image, composed ONLY of the listed ingredients.
      
      CRITICAL:
      - Use standard USDA nutritional data values.
      - Output MUST be deterministic. Identical inputs must yield identical outputs.
      
      Also provide a new brief health tip based on these specific ingredients.
    `;
    
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        ...GENERATION_CONFIG,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.INTEGER },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.INTEGER },
                carbs: { type: Type.INTEGER },
                fat: { type: Type.INTEGER }
              },
              required: ["protein", "carbs", "fat"]
            },
            healthTip: { type: Type.STRING }
          },
          required: ["calories", "macros", "healthTip"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Recalculation Error:", error);
    throw error;
  }
}

export const getNutritionAdvice = async (history: HistoryItem[], userProfile: UserProfile): Promise<string> => {
  try {
    const today = new Date().toDateString();
    const todaysLogs = history.filter(h => new Date(h.timestamp).toDateString() === today);
    
    if (todaysLogs.length === 0) {
      return "You haven't logged any meals today. Scan your breakfast to get started!";
    }

    const logsText = todaysLogs.map(l => 
      `- ${l.foodName}: ${l.calories}kcal, ${l.macros.protein}g protein, ${l.macros.carbs}g carbs, ${l.macros.fat}g fat`
    ).join('\n');

    const prompt = `
      You are an elite nutritionist AI. Analyze the user's nutrition for today based on these logs:
      ${logsText}
      
      User Daily Goals: ${userProfile.dailyCalorieGoal} calories, ${userProfile.dailyProteinGoal}g protein.
      
      Task:
      1. Briefly analyze their intake so far (balanced? high sugar? good protein?).
      2. Suggest a specific, healthy next meal or snack to help them balance their metrics.
      3. Keep the tone encouraging, futuristic, and concise (under 80 words).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2, 
        seed: 42
      }
    });
    
    return response.text || "Could not generate advice at this time.";
  } catch (error) {
    console.error("AI Advice Error:", error);
    return "Unable to connect to AI Coach. Please check your connection.";
  }
};