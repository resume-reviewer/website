import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();

    const $ = cheerio.load(html);
    $('script, style, nav, footer, header').remove();
    const mainText = $('body').text().replace(/\s\s+/g, ' ').trim();
    
    const truncatedText = mainText.substring(0, 8000);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Based on the following text scraped from a job posting page, please extract the key information.

      SCRAPED TEXT:
      "${truncatedText}"

      Please extract the following details and return them in a clean JSON format. Do not include any other text or markdown characters.
      If a field cannot be found, return an empty string "" for it.

      JSON FORMAT:
      {
        "jobTitle": "The Job Title",
        "companyName": "The Company Name",
        "location": "The Job Location (e.g., 'Jakarta, Indonesia' or 'Remote')",
        "jobDescription": "A concise summary of the job description, responsibilities, and qualifications."
      }
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    let extractedText = aiResponse.text();

    extractedText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const extractedData = JSON.parse(extractedText);

    return NextResponse.json(extractedData);

  } catch (error) {
    console.error('Error scraping job details:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to scrape job details: ${errorMessage}` }, { status: 500 });
  }
}