import { NextRequest, NextResponse } from 'next/server';

// Dynamic import to avoid build-time issues
const getPdfParse = async () => {
  try {
    const pdf = await import('pdf-parse');
    return pdf.default;
  } catch (error) {
    console.error('Failed to import pdf-parse:', error);
    throw new Error('PDF parsing is not available');
  }
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      // Parse PDF
      try {
        const pdf = await getPdfParse();
        const data = await pdf(buffer);
        extractedText = data.text;
        console.log('Successfully parsed PDF, extracted', extractedText.length, 'characters');
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json(
          { error: 'Failed to parse PDF file. PDF parsing is currently unavailable. Please convert to text format.' },
          { status: 400 }
        );
      }
    } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      // Parse text file
      extractedText = buffer.toString('utf-8');
      console.log('Successfully parsed text file, extracted', extractedText.length, 'characters');
    } else {
      console.error('Unsupported file type:', file.type, 'Name:', file.name);
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or text file.' },
        { status: 400 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: extractedText });

  } catch (error) {
    console.error('File parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
