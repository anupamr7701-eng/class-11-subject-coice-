// Helper to generate and download PDF cleanly with the exact assessment title
export const ASSESSMENT_PDF_TITLE = 'অনুপম রায় দ্বারা তৈরি ক্যারিয়ার মূল্যায়ন (Career Assessment by Anupam Roy)';

export async function downloadResultAsPdf(elementId: string, candidateName: string = 'শিক্ষার্থী') {
  const element = document.getElementById(elementId);
  const originalTitle = document.title;
  
  // Set document title so print preview and PDF filename match user requirement
  document.title = ASSESSMENT_PDF_TITLE;
  const sanitizedName = candidateName.trim().replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '_') || 'শিক্ষার্থী';
  const filename = `${sanitizedName}_অনুপম_রায়_দ্বারা_তৈরি_ক্যারিয়ার_মূল্যায়ন.pdf`;

  try {
    if (!element) {
      window.print();
      return;
    }

    // Dynamic import of html2pdf.js
    // @ts-ignore
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = (html2pdfModule.default || html2pdfModule) as any;

    if (html2pdf) {
      const opt = {
        margin: [8, 8, 8, 8] as [number, number, number, number],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.offsetWidth,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as const,
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  } catch (err) {
    console.warn('html2pdf generation error, falling back to window.print():', err);
    window.print();
  } finally {
    // Restore document title after print dialog or download starts
    setTimeout(() => {
      document.title = originalTitle;
    }, 2500);
  }
}

// Dedicated print trigger using window.print() with the formatted title
export function printFormattedAssessment() {
  const originalTitle = document.title;
  document.title = ASSESSMENT_PDF_TITLE;
  window.print();
  setTimeout(() => {
    document.title = originalTitle;
  }, 2500);
}

