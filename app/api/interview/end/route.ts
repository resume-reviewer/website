import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { history } = await request.json(); // history now contains AnswerPayload[]

    if (!history || history.length === 0) {
      return NextResponse.json({ error: 'Interview history is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const historyText = history.map((h: any) => 
      `Q: ${h.question}\nAnswer: ${h.transcribedAnswer}\nDelivery Analysis: Pace ${h.analysis.speechPace.toFixed(0)} WPM, Volume ${h.analysis.volumeLevel.toFixed(2)}, Eye Contact ${h.analysis.eyeContactDuration}%`
    ).join('\n\n');

    const prompt = `
      Based on the following complete interview transcript and delivery analysis, provide a comprehensive summary of the candidate's performance.

      Transcript & Analysis:
      ${historyText}

      Provide feedback in JSON format, focusing on actionable advice for both content and delivery (tone, body language):
      {
        "overallFeedback": "A summary of the overall performance, including strengths and key improvement areas.",
        "strengths": ["Identified content strength 1", "Identified delivery strength 2"],
        "areasForImprovement": {
          "content": ["Specific advice on improving answer content 1.", "Suggestion for content 2."],
          "delivery": ["Advice on delivery, e.g., 'Try to speak a bit more slowly to sound more deliberate.'", "Advice on body language, e.g., 'Your eye contact was good, keep it up.'"]
        },
        "performanceMetrics": ${JSON.stringify(history.map((h: any) => ({ question: h.question, speechPace: h.analysis.speechPace, volumeLevel: h.analysis.volumeLevel })))}
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedResponse = JSON.parse(text);

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Error ending interview:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}