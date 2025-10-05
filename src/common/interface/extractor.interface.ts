export interface Extractor {
    extractFromImage?(imagePath: string, mimetype: string): Promise<string>;
    extractFromPdf?(pdfPath: string, mimetype: string): Promise<string>;
    extractFromDocx?(docxPath: string): Promise<string>;
    isConfigured?(): boolean;
}
