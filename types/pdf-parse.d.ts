declare module 'pdf-parse' {
  interface PDFParseOptions {
    max?: number;
    pagerender?: (page: any) => Promise<string>;
    [key: string]: any;
  }

  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }

  function pdf(data: Buffer | Uint8Array, options?: PDFParseOptions): Promise<PDFParseResult>;
  export default pdf;
}
