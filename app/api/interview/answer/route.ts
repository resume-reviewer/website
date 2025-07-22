import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
    try {
        const { jobDetails, answerPayload, history } = await request.json();
        const { question, transcribedAnswer, analysis } = answerPayload;
        if (!question || !transcribedAnswer || !analysis || !jobDetails) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are an expert interview coach. You are conducting a mock interview for a ${jobDetails.jobTitle} role.

        The current question was: "${question}"
        The candidate's transcribed answer is: "${transcribedAnswer}"

        Here is the analysis of their delivery:
        - Speech Pace: ${analysis.speechPace.toFixed(0)} words per minute.
        - Volume Level: ${analysis.volumeLevel.toFixed(2)} (normalized 0-1).
        - Eye Contact: Maintained for ${analysis.eyeContactDuration.toFixed(0)}% of the time.

        Instructions:
        1.  Provide immediate, concise feedback on BOTH the content of the answer AND their delivery (tone, pace, confidence inferred from data).
        2.  Generate a relevant follow-up question. If you have asked more than 4 questions, respond with "END_OF_INTERVIEW" for the next question.

        Return the response in JSON format:
        {
            "feedback": "Your concise feedback here.",
            "nextQuestion": "Your next question here or END_OF_INTERVIEW"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsedResponse = JSON.parse(text);

        return NextResponse.json(parsedResponse);
    } catch (error) {
        console.error('Error processing answer:', error);
        return NextResponse.json({ error: 'Failed to process answer' }, { status: 500 });
    }
}