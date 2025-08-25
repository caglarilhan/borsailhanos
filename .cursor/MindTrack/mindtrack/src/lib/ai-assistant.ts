import OpenAI from 'openai';

export interface AINoteRequest {
  clientName: string;
  sessionType: 'initial' | 'follow-up' | 'crisis' | 'termination';
  sessionFocus: string;
  clientPresentation: string;
  interventions: string;
  progress: string;
  nextSteps: string;
  noteType: 'SOAP' | 'BIRP' | 'DAP';
}

export interface AINoteResponse {
  note: string;
  suggestions: string[];
  riskFactors: string[];
  followUpQuestions: string[];
}

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

export async function generateAINote(request: AINoteRequest): Promise<AINoteResponse> {
  const client = getOpenAIClient();
  
  const prompt = `As a licensed therapist, create a professional ${request.noteType} note for a ${request.sessionType} session with ${request.clientName}.

Session Focus: ${request.sessionFocus}
Client Presentation: ${request.clientPresentation}
Interventions Used: ${request.interventions}
Progress Made: ${request.progress}
Next Steps: ${request.nextSteps}

Please format this as a proper ${request.noteType} note with clear sections. Also provide:
1. 3 clinical suggestions for next session
2. Any risk factors to monitor
3. 3 follow-up questions for the client

Keep the tone professional and clinical.`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a licensed mental health professional. Provide clinical, professional notes in the requested format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Parse the response to extract structured data
    const sections = response.split('\n\n');
    const note = sections[0] || response;
    
    const suggestions = extractSection(response, 'suggestions', 3);
    const riskFactors = extractSection(response, 'risk factors', 3);
    const followUpQuestions = extractSection(response, 'follow-up questions', 3);

    return {
      note,
      suggestions,
      riskFactors,
      followUpQuestions,
    };
  } catch (error) {
    console.error('AI note generation failed:', error);
    throw new Error('Failed to generate AI note');
  }
}

export async function transcribeAudio(audioFile: File): Promise<string> {
  const client = getOpenAIClient();
  
  try {
    // Convert File to Buffer for OpenAI API
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const transcription = await client.audio.transcriptions.create({
      file: buffer as unknown as File,
      model: "whisper-1",
      language: "en",
    });

    return transcription.text;
  } catch (error) {
    console.error('Audio transcription failed:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function enhanceNoteWithAI(existingNote: string, clientContext: string): Promise<string> {
  const client = getOpenAIClient();
  
  const prompt = `Please enhance and improve this therapy note while maintaining its clinical accuracy and professional tone. 

Client Context: ${clientContext}

Existing Note:
${existingNote}

Please:
1. Improve grammar and clarity
2. Add any missing clinical observations
3. Ensure proper ${getNoteType(existingNote)} format
4. Maintain professional clinical language`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a licensed mental health professional. Enhance therapy notes while maintaining clinical accuracy."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    return completion.choices[0]?.message?.content || existingNote;
  } catch (error) {
    console.error('AI note enhancement failed:', error);
    return existingNote; // Return original if enhancement fails
  }
}

function extractSection(text: string, sectionName: string, maxItems: number): string[] {
  const regex = new RegExp(`${sectionName}?[\\s\\S]*?([0-9]+\\.\\s*[^\\n]+(?:\\n[^0-9][^\\n]*)*)`, 'i');
  const match = text.match(regex);
  
  if (!match) return [];
  
  const section = match[1];
  const items = section.split(/\n\s*\d+\.\s*/).filter(Boolean);
  
  return items.slice(0, maxItems).map(item => item.trim());
}

function getNoteType(note: string): string {
  if (note.includes('Subjective') || note.includes('Objective') || note.includes('Assessment') || note.includes('Plan')) {
    return 'SOAP';
  } else if (note.includes('Behavior') || note.includes('Intervention') || note.includes('Response') || note.includes('Plan')) {
    return 'BIRP';
  } else if (note.includes('Data') || note.includes('Assessment') || note.includes('Plan')) {
    return 'DAP';
  }
  return 'SOAP'; // Default
}
