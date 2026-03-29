import { NextRequest, NextResponse } from 'next/server';

// Define the expected structure of the request body
interface GradeRequest {
  transcript: string;
  patientScenario: string;
  framework: string;
}

// Define the structure of the competency score
interface CompetencyScore {
  area: string;
  score: string;
  feedback: string;
  evidence: string[];
}

// Define the structure of the grading response
interface GradeResponse {
  overallScore: number;
  overallFeedback: string;
  competencyScores: CompetencyScore[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body: GradeRequest = await request.json();
    const { transcript, patientScenario, framework } = body;

    // Validate the request
    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 503 }
      );
    }

    // Prepare the prompt for the LLM
    const prompt = createGradingPrompt(transcript, patientScenario, framework);

    // Call the LLM API
    const gradingResult = await callLLMAPI(prompt, apiKey);

    // Parse and validate the LLM response
    const formattedResponse = formatLLMResponse(gradingResult);

    // Return the grading result
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error grading conversation:', error);
    return NextResponse.json(
      { error: 'Failed to grade conversation' },
      { status: 500 }
    );
  }
}

// Create a detailed prompt for the LLM to grade the conversation
function createGradingPrompt(
  transcript: string,
  patientScenario: string,
  framework: string
): string {
  return `
You are an expert in healthcare communication assessment. Your task is to evaluate a conversation between a healthcare provider and a patient based on evidence-based communication standards.

PATIENT SCENARIO:
${patientScenario || 'No specific scenario provided.'}

CONVERSATION TRANSCRIPT:
${transcript}

ASSESSMENT FRAMEWORK: ${framework}

Please evaluate the healthcare provider's communication skills using the Calgary-Cambridge Guide framework, adapted for this assessment across the following competency areas:

1. EMPATHY: Ability to understand and share the feelings of the patient, showing compassion and emotional support. This includes responding to verbal and non-verbal cues, acknowledging distress, and validating patient experiences.

2. CLARITY: Effectiveness in conveying information clearly, concisely, and in a way the patient can understand. This includes using plain language, avoiding jargon, checking understanding, and organizing information logically.

3. CULTURAL_SENSITIVITY: Awareness and respect for cultural differences, beliefs, and values that may impact healthcare decisions. This includes acknowledging cultural factors, avoiding stereotypes, and adapting communication style appropriately.

4. ACTIVE_LISTENING: Attentiveness to patient concerns, asking follow-up questions, and demonstrating understanding. This includes using open-ended questions, allowing patients to complete statements, and summarizing information to verify understanding.

5. MEDICAL_KNOWLEDGE: Accuracy and appropriateness of medical information provided to the patient. This includes providing evidence-based information, acknowledging limitations of knowledge, and correcting misconceptions.

6. PATIENT_EDUCATION: Ability to explain medical concepts, treatment options, and self-care instructions effectively. This includes assessing prior knowledge, using visual aids or analogies when appropriate, and confirming understanding.

7. RAPPORT_BUILDING: Skill in establishing a positive, trusting relationship with the patient through effective communication. This includes appropriate introductions, demonstrating respect, and creating a collaborative atmosphere.

8. PROFESSIONALISM: Maintaining appropriate boundaries, respect, and ethical conduct throughout the interaction. This includes respecting privacy, maintaining confidentiality, and demonstrating ethical decision-making.

For each competency area, provide:
1. A rating (EXCELLENT, GOOD, SATISFACTORY, NEEDS_IMPROVEMENT, or POOR)
2. Specific feedback explaining the rating
3. 2-3 direct quotes from the conversation as evidence supporting your assessment

Also provide an overall score (0-100) and comprehensive feedback summarizing the healthcare provider's communication strengths and areas for improvement.

Format your response as a JSON object with the following structure:
{
  "overallScore": number,
  "overallFeedback": "string",
  "competencyScores": [
    {
      "area": "EMPATHY",
      "score": "GOOD",
      "feedback": "string",
      "evidence": ["string", "string"]
    },
    // Repeat for all 8 competency areas
  ]
}
`;
}

// Call the LLM API with the prompt
async function callLLMAPI(prompt: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in healthcare communication assessment.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${response.status}):`, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

// Parse and validate the LLM response
function formatLLMResponse(llmResponse: string): GradeResponse {
  try {
    // Extract JSON from the response (in case the LLM added extra text)
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in LLM response');
    }

    const jsonStr = jsonMatch[0];
    const parsedResponse = JSON.parse(jsonStr);

    // Validate the response structure
    if (typeof parsedResponse.overallScore !== 'number') {
      throw new Error('Invalid overall score');
    }

    if (typeof parsedResponse.overallFeedback !== 'string') {
      throw new Error('Invalid overall feedback');
    }

    if (!Array.isArray(parsedResponse.competencyScores)) {
      throw new Error('Invalid competency scores');
    }

    // Ensure all competency areas are present
    const requiredAreas = [
      'EMPATHY',
      'CLARITY',
      'CULTURAL_SENSITIVITY',
      'ACTIVE_LISTENING',
      'MEDICAL_KNOWLEDGE',
      'PATIENT_EDUCATION',
      'RAPPORT_BUILDING',
      'PROFESSIONALISM'
    ];

    const missingAreas = requiredAreas.filter(
      area => !parsedResponse.competencyScores.some((score: any) => score.area === area)
    );

    if (missingAreas.length > 0) {
      console.warn(`Missing competency areas: ${missingAreas.join(', ')}`);
      
      // Add missing areas with default values
      missingAreas.forEach(area => {
        parsedResponse.competencyScores.push({
          area,
          score: 'SATISFACTORY',
          feedback: 'Not enough information to assess this area thoroughly.',
          evidence: ['Insufficient evidence available.']
        });
      });
    }

    // Validate each competency score
    parsedResponse.competencyScores.forEach((score: any) => {
      if (!score.area || !score.score || !score.feedback || !Array.isArray(score.evidence)) {
        throw new Error(`Invalid competency score: ${JSON.stringify(score)}`);
      }
    });

    return {
      overallScore: parsedResponse.overallScore,
      overallFeedback: parsedResponse.overallFeedback,
      competencyScores: parsedResponse.competencyScores
    };
  } catch (error) {
    console.error('Error parsing LLM response:', error);
    throw error;
  }
}
