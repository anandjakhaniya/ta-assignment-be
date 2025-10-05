import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as mammoth from 'mammoth';
import { Extractor } from '../../common/interface/extractor.interface';

@Injectable()
export class DocxExtractor implements Extractor {
  async extractFromDocx(docxPath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(docxPath);
      const result = await mammoth.extractRawText({ buffer });

      return result.value;
    } catch (error) {
      console.error('Error extracting from DOCX:', error);
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
  }
}

