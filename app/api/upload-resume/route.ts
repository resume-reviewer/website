import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import PDFParser from 'pdf2json';
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll('filepond');
    
    if (!uploadedFiles || uploadedFiles.length < 2) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const uploadedFile = uploadedFiles[1]; // Get the actual file (index 1)
    
    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      );
    }

    console.log('Processing file:', uploadedFile.name, 'Size:', uploadedFile.size, 'Type:', uploadedFile.type);

    // Generate unique filename
    const fileName = uuidv4();
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `${fileName}.pdf`);

    try {
      // Convert file to buffer and save temporarily
      const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
      await fs.writeFile(tempFilePath, fileBuffer);

      console.log('File saved to:', tempFilePath);

      // Parse PDF using pdf2json
      const parsedText = await parsePDF(tempFilePath);

      // Clean up temp file
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }

      if (!parsedText || !parsedText.trim()) {
        return NextResponse.json(
          { error: 'No text could be extracted from the PDF' },
          { status: 400 }
        );
      }

      console.log('Successfully extracted', parsedText.length, 'characters from PDF');

      const response = new NextResponse(parsedText);
      response.headers.set('FileName', fileName);
      response.headers.set('Content-Type', 'text/plain');
      return response;

    } catch (fileError) {
      console.error('File processing error:', fileError);
      
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempFilePath);
      } catch {
        // Ignore cleanup errors
      }
      
      return NextResponse.json(
        { error: 'Failed to process PDF file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function parsePDF(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);
    let hasResolved = false;

    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        reject(new Error('PDF parsing timeout'));
      }
    }, 30000); // 30 second timeout

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(timeout);
        console.error('PDF parsing error:', errData.parserError);
        reject(new Error(`PDF parsing failed: ${errData.parserError}`));
      }
    });

    pdfParser.on('pdfParser_dataReady', () => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(timeout);
        try {
          const rawText = (pdfParser as any).getRawTextContent();
          console.log('PDF parsed successfully, text length:', rawText.length);
          resolve(rawText || '');
        } catch (extractError) {
          console.error('Text extraction error:', extractError);
          reject(new Error('Failed to extract text from parsed PDF'));
        }
      }
    });

    try {
      pdfParser.loadPDF(filePath);
    } catch (loadError) {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(timeout);
        console.error('PDF load error:', loadError);
        reject(new Error(`Failed to load PDF: ${loadError}`));
      }
    }
  });
}