import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 500 });
    }

    const { jobDetails, language } = await request.json();

    if (!jobDetails || !jobDetails.jobTitle || !jobDetails.jobDescription) {
      return NextResponse.json({ error: 'Job details are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Based on the following job details, generate the first interview question.
      Job Title: ${jobDetails.jobTitle}
      Job Description: ${jobDetails.jobDescription}
      
      The question should be a common opening question for this role.
      IMPORTANT: Generate the question in this language: ${language === 'id' ? 'Indonesian' : 'English'}.

      Return the response in JSON format: {"question": "Your generated question here"}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedResponse = JSON.parse(text);

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Error starting interview:', error);
    return NextResponse.json({ error: 'Failed to start interview' }, { status: 500 });
  }
}