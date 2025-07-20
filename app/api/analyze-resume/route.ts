import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Check if Google AI API key is available
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('Google AI API key is not configured');
      return NextResponse.json(
        { error: 'AI service is not properly configured. Please check your API key.' },
        { status: 500 }
      );
    }

    const { resumeText, jobDetails } = await request.json();

    if (!resumeText || !jobDetails) {
      return NextResponse.json(
        { error: 'Resume text and job details are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Please analyze this resume against the following job requirements and provide a detailed evaluation:

    JOB DETAILS:
    - Job Title: ${jobDetails.jobTitle}
    - Company: ${jobDetails.company}
    - Job Description: ${jobDetails.jobDescription}
    - Required Skills: ${jobDetails.requiredSkills}
    - Experience Level: ${jobDetails.experienceLevel}
    - Industry: ${jobDetails.industry}

    RESUME TEXT:
    ${resumeText}

    Please provide your analysis in the following JSON format:
    {
      "score": <number between 0-100>,
      "strengths": [
        "strength 1",
        "strength 2",
        "strength 3"
      ],
      "weaknesses": [
        "weakness 1",
        "weakness 2",
        "weakness 3"
      ],
      "feedbacks": [
        {
          "category": "Skills",
          "feedback": "detailed feedback about skills alignment"
        },
        {
          "category": "Experience",
          "feedback": "detailed feedback about experience relevance"
        },
        {
          "category": "Education",
          "feedback": "detailed feedback about educational background"
        },
        {
          "category": "Format & Presentation",
          "feedback": "detailed feedback about resume format and presentation"
        }
      ],
      "improvementSuggestions": [
        "specific suggestion 1",
        "specific suggestion 2",
        "specific suggestion 3"
      ]
    }

    Analyze the resume comprehensively, focusing on:
    1. Skills alignment with job requirements
    2. Experience relevance and depth
    3. Educational background fit
    4. Resume format and presentation quality
    5. Keywords optimization for ATS systems
    6. Overall competitiveness for the role

    Provide actionable, specific feedback that will help improve the resume's effectiveness for this specific job.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let analysisText = response.text();

    // Clean up the response to extract JSON
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const analysis = JSON.parse(analysisText);
      return NextResponse.json({ analysis });
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI analysis response' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
