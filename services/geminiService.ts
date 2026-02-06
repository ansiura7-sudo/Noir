import { GoogleGenAI, Type } from "@google/genai";
import { CrimeCase, Suspect, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getCasePrompt = (lang: Language) => `
You are a Crime Novelist AI. Generate a unique, Noir-style murder mystery case in ${lang === 'ru' ? 'Russian' : 'English'}.
1. Create a victim and a crime scene.
2. Create 3 suspects.
3. EXACTLY ONE suspect must be the killer (\`isKiller\`: true).
4. The other two must have suspicious motives but valid alibis (or fake alibis that can be checked).
5. Give the killer a subtle slip-up in their alibi or motive.
6. Return purely JSON.
`;

const getInterrogationPrompt = (suspect: Suspect, lang: Language) => `
You are roleplaying a character in a murder mystery. The language of conversation is ${lang === 'ru' ? 'Russian' : 'English'}.
Name: ${suspect.name}
Role: ${suspect.role}
Bio: ${suspect.bio}
Is Killer: ${suspect.isKiller ? "YES" : "NO"}
Motive: ${suspect.motive}
Alibi: ${suspect.alibi}

The user is the Detective. They are asking you questions.
- Answer in character. Be defensive, nervous, or arrogant depending on the bio.
- If you are the killer, LIE about your crime, but leave subtle hints if pressed hard.
- If you are innocent, tell the truth but you might be hiding something else (like an affair or theft).
- Keep responses short (under 2-3 sentences).
`;

export const generateCase = async (lang: Language): Promise<CrimeCase> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a new murder mystery case in ${lang === 'ru' ? 'Russian' : 'English'}.`,
      config: {
        systemInstruction: getCasePrompt(lang),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            location: { type: Type.STRING },
            victim: { type: Type.STRING },
            timeOfDeath: { type: Type.STRING },
            clues: { type: Type.ARRAY, items: { type: Type.STRING } },
            suspects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  bio: { type: Type.STRING },
                  motive: { type: Type.STRING },
                  alibi: { type: Type.STRING },
                  isKiller: { type: Type.BOOLEAN }
                },
                required: ["name", "role", "bio", "motive", "alibi", "isKiller"]
              }
            }
          },
          required: ["title", "description", "location", "victim", "clues", "suspects"]
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) throw new Error("No response from AI");
    
    const data = JSON.parse(jsonStr);
    
    // Add IDs and avatars
    data.id = Math.random().toString(36).substring(7);
    data.suspects = data.suspects.map((s: any, i: number) => ({
      ...s,
      id: `suspect-${i}`,
      avatarSeed: Math.random().toString()
    }));

    return data as CrimeCase;

  } catch (error) {
    console.error("Failed to generate case:", error);
    throw error;
  }
};

export const interactWithSuspect = async (
  suspect: Suspect, 
  history: { role: string, parts: { text: string }[] }[], 
  userMessage: string,
  lang: Language
): Promise<string> => {
  
  const systemPrompt = getInterrogationPrompt(suspect, lang);

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: { systemInstruction: systemPrompt }
  });

  const result = await chat.sendMessage({ message: userMessage });
  return result.text || "...";
};