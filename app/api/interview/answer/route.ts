import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // LOG 1: Tampilkan semua data yang masuk dari frontend
    console.log("Received data on /api/interview/answer:", JSON.stringify(body, null, 2));

    const { jobDetails, answerPayload, history } = body;
    const { question, transcribedAnswer, analysis } = answerPayload;

    if (!question || !transcribedAnswer || !analysis || !jobDetails) {
      console.error("Validation failed: Missing required fields.", { question, transcribedAnswer, analysis, jobDetails });
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
      - Eye Contact: Maintained for ${analysis.eyeContactPercentage.toFixed(0)}% of the time.

      Instructions:
      1.  Provide immediate, concise feedback on BOTH the content of the answer AND their delivery (tone, pace, confidence inferred from data).
      2.  Generate a relevant follow-up question. If you have asked more than 4 questions, respond with "END_OF_INTERVIEW" for the next question.

      Return the response STRICTLY in the following JSON format, with no extra text or markdown:
      {
        "feedback": "Your concise feedback here.",
        "nextQuestion": "Your next question here or END_OF_INTERVIEW"
      }
    `;

    // LOG 2: Tampilkan prompt yang akan dikirim ke Gemini
    console.log("--- Sending Prompt to Gemini ---");
    console.log(prompt);
    console.log("--------------------------------");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // LOG 3: Tampilkan respons mentah dari Gemini SEBELUM di-parse
    console.log("--- Raw Response from Gemini ---");
    console.log(text);
    console.log("--------------------------------");

    // Bersihkan respons untuk mengekstrak JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedResponse = JSON.parse(text);
      return NextResponse.json(parsedResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Original Gemini text was:', text);
      return NextResponse.json({ error: 'AI response was not valid JSON.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in /api/interview/answer:', error);
    return NextResponse.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}