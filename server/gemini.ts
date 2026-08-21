import { GoogleGenAI, Type } from '@google/genai';
import { AIAnalysis, SeverityLevel, PriorityLevel } from '../src/types';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function analyzeComplaintWithGemini(data: {
  title: string;
  description: string;
  category: string;
  location: { block: string; floor: string; specificLocation: string };
  imageBase64?: string;
}): Promise<AIAnalysis> {
  const ai = getAIClient();

  // Rule-based smart fallback in case Gemini key is not set or network fails
  const fallbackAnalysis: AIAnalysis = generateSmartFallback(data);

  if (!ai) {
    console.log('No GEMINI_API_KEY set, using smart heuristic triage engine.');
    return fallbackAnalysis;
  }

  try {
    const prompt = `You are the AI Triage Specialist for "CivicMind", an AI Campus Complaint-to-Resolution Platform.
Analyze the following student campus complaint and provide an accurate classification, severity assessment, SLA timeframes, and executive summary for administrators.

Complaint Details:
- Title: ${data.title}
- Description: ${data.description}
- Stated Category: ${data.category}
- Location: Building: ${data.location.block}, Floor: ${data.location.floor}, Exact Spot: ${data.location.specificLocation}

Rules:
1. Category must be one of: Water, Electricity, Cleanliness, Infrastructure, Hostel, Classroom, Laboratory, Wi-Fi/Internet, Transport, Canteen, Security, Other.
2. Severity must be one of: "Low", "Medium", "High", "Critical".
   - Critical: Immediate safety hazards, major power outage, flooding, live wire, structural collapse risk.
   - High: Active water leak, hostel heating failure, broken door locks, lab equipment hazard.
   - Medium: Broken fan, slow internet in common room, cleanliness issue, classroom light failure.
   - Low: Minor cosmetic defect, aesthetic notice board issue, non-urgent maintenance.
3. Priority must be: "P1 — Critical", "P2 — High", "P3 — Medium", or "P4 — Low".
4. Responsible Department should be specific (e.g., "Maintenance Department", "Electrical Wing", "IT & Network Operations", "Sanitation & Housekeeping", "Hostel Administration", "Estate Office", "Campus Security", "Transport Desk", "Canteen Committee").
5. Estimated Action Time: Realistic timeframe for initial response (e.g. "Expected action within 1 hour", "Expected action within 2 hours", "Expected action within 4 hours", "Expected action within 12 hours").
6. Estimated Resolution Time: Realistic timeframe for complete resolution (e.g. "Expected resolution within 6 hours", "Expected resolution within 24 hours", "Expected resolution within 48 hours").
7. AI Summary: Concise 1-2 sentence professional briefing highlighting the issue and why action is needed.`;

    const contents: any = [];

    if (data.imageBase64 && data.imageBase64.includes('base64,')) {
      const match = data.imageBase64.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/);
      if (match) {
        contents.push({
          parts: [
            {
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            },
            { text: prompt },
          ],
        });
      } else {
        contents.push(prompt);
      }
    } else {
      contents.push(prompt);
    }

    let responseText: string | undefined;

    // Try primary model: gemini-2.5-flash
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'Primary standardized category',
              },
              severity: {
                type: Type.STRING,
                enum: ['Low', 'Medium', 'High', 'Critical'],
                description: 'Severity level of the issue',
              },
              priority: {
                type: Type.STRING,
                enum: ['P1 — Critical', 'P2 — High', 'P3 — Medium', 'P4 — Low'],
                description: 'Operational priority',
              },
              responsibleDepartment: {
                type: Type.STRING,
                description: 'Department responsible for fixing this issue',
              },
              estimatedActionTime: {
                type: Type.STRING,
                description: 'Expected SLA for first response/triage',
              },
              estimatedResolutionTime: {
                type: Type.STRING,
                description: 'Expected SLA for total problem resolution',
              },
              aiSummary: {
                type: Type.STRING,
                description: 'Brief executive summary for admin review',
              },
            },
            required: [
              'category',
              'severity',
              'priority',
              'responsibleDepartment',
              'estimatedActionTime',
              'estimatedResolutionTime',
              'aiSummary',
            ],
          },
        },
      });
      responseText = response.text?.trim();
    } catch (primaryErr: any) {
      console.warn('Gemini 2.5 Flash busy or unavailable, attempting gemini-2.5-flash-lite fallback:', primaryErr?.message || primaryErr);
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-lite',
          contents,
          config: {
            responseMimeType: 'application/json',
          },
        });
        responseText = fallbackResponse.text?.trim();
      } catch (secondaryErr: any) {
        console.warn('Gemini secondary model also unavailable, utilizing smart heuristic triage:', secondaryErr?.message || secondaryErr);
        return fallbackAnalysis;
      }
    }

    if (!responseText) {
      return fallbackAnalysis;
    }

    const parsed = JSON.parse(responseText);
    return {
      category: parsed.category || data.category || 'Maintenance',
      severity: (['Low', 'Medium', 'High', 'Critical'].includes(parsed.severity)
        ? parsed.severity
        : fallbackAnalysis.severity) as SeverityLevel,
      priority: (['P1 — Critical', 'P2 — High', 'P3 — Medium', 'P4 — Low'].includes(parsed.priority)
        ? parsed.priority
        : fallbackAnalysis.priority) as PriorityLevel,
      responsibleDepartment: parsed.responsibleDepartment || fallbackAnalysis.responsibleDepartment,
      estimatedActionTime: parsed.estimatedActionTime || fallbackAnalysis.estimatedActionTime,
      estimatedResolutionTime: parsed.estimatedResolutionTime || fallbackAnalysis.estimatedResolutionTime,
      aiSummary: parsed.aiSummary || fallbackAnalysis.aiSummary,
    };
  } catch (error) {
    console.error('Gemini AI analysis error:', error);
    return fallbackAnalysis;
  }
}

function generateSmartFallback(data: {
  title: string;
  description: string;
  category: string;
  location: { block: string; floor: string; specificLocation: string };
}): AIAnalysis {
  const combined = `${data.title} ${data.description} ${data.category}`.toLowerCase();

  let severity: SeverityLevel = 'Medium';
  let priority: PriorityLevel = 'P3 — Medium';
  let department = 'Maintenance Department';
  let actionTime = 'Expected action within 4 hours';
  let resolutionTime = 'Expected resolution within 24 hours';

  if (combined.includes('leak') || combined.includes('pipe') || combined.includes('water') || combined.includes('drain')) {
    department = 'Maintenance Department (Plumbing Wing)';
    severity = combined.includes('flood') || combined.includes('slippery') || combined.includes('continuous') ? 'High' : 'Medium';
    priority = severity === 'High' ? 'P2 — High' : 'P3 — Medium';
    actionTime = 'Expected action within 2 hours';
    resolutionTime = 'Expected resolution within 24 hours';
  } else if (combined.includes('electric') || combined.includes('shock') || combined.includes('wire') || combined.includes('spark') || combined.includes('short circuit')) {
    department = 'Electrical Department';
    severity = 'Critical';
    priority = 'P1 — Critical';
    actionTime = 'Expected action within 1 hour';
    resolutionTime = 'Expected resolution within 12 hours';
  } else if (combined.includes('fan') || combined.includes('light') || combined.includes('ac') || combined.includes('switch')) {
    department = 'Electrical Department';
    severity = 'Medium';
    priority = 'P3 — Medium';
    actionTime = 'Expected action within 4 hours';
    resolutionTime = 'Expected resolution within 24 hours';
  } else if (combined.includes('wifi') || combined.includes('internet') || combined.includes('network') || combined.includes('lan') || combined.includes('router')) {
    department = 'IT & Network Operations';
    severity = combined.includes('exam') || combined.includes('lab') ? 'High' : 'Medium';
    priority = severity === 'High' ? 'P2 — High' : 'P3 — Medium';
    actionTime = 'Expected action within 3 hours';
    resolutionTime = 'Expected resolution within 24 hours';
  } else if (combined.includes('clean') || combined.includes('garbage') || combined.includes('trash') || combined.includes('dust') || combined.includes('smell') || combined.includes('hygiene')) {
    department = 'Sanitation & Housekeeping';
    severity = combined.includes('washroom') || combined.includes('canteen') ? 'High' : 'Medium';
    priority = 'P3 — Medium';
    actionTime = 'Expected action within 2 hours';
    resolutionTime = 'Expected resolution within 12 hours';
  } else if (combined.includes('hostel') || combined.includes('room') || combined.includes('bed') || combined.includes('warden')) {
    department = 'Hostel Administration';
    severity = 'Medium';
    priority = 'P3 — Medium';
    actionTime = 'Expected action within 4 hours';
    resolutionTime = 'Expected resolution within 24 hours';
  } else if (combined.includes('security') || combined.includes('theft') || combined.includes('lock') || combined.includes('gate') || combined.includes('stranger')) {
    department = 'Campus Security & Safety';
    severity = 'High';
    priority = 'P2 — High';
    actionTime = 'Expected action within 1 hour';
    resolutionTime = 'Expected resolution within 8 hours';
  } else if (combined.includes('bus') || combined.includes('van') || combined.includes('transport') || combined.includes('parking')) {
    department = 'Transport & Logistics';
    severity = 'Medium';
    priority = 'P3 — Medium';
    actionTime = 'Expected action within 6 hours';
    resolutionTime = 'Expected resolution within 24 hours';
  }

  const categoryName = data.category || 'General Maintenance';
  const aiSummary = `${data.title} reported at ${data.location.block}, ${data.location.floor} (${data.location.specificLocation}). Issue analyzed for ${department} attention.`;

  return {
    category: categoryName,
    severity,
    priority,
    responsibleDepartment: department,
    estimatedActionTime: actionTime,
    estimatedResolutionTime: resolutionTime,
    aiSummary,
  };
}
