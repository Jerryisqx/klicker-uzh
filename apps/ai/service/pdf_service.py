from pathlib import Path
import PyPDF2
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self, pdf_dir: str = "tmp"):
        self.pdf_dir = Path(pdf_dir)
        self.pdf_dir.mkdir(exist_ok=True)

    def get_pdf_path(self, filename: str) -> Path:
        path = self.pdf_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"PDF {filename} not found in tmp directory")
        return path

    def list_pdfs(self) -> List[Dict]:
        """List all PDFs in the tmp directory with their info"""
        pdf_files = []
        for pdf_path in self.pdf_dir.glob("*.pdf"):
            try:
                info = self._get_pdf_info(pdf_path)
                pdf_files.append(info)
            except Exception as e:
                logger.error(f"Error processing {pdf_path}: {e}")
        return pdf_files

    def _get_pdf_info(self, pdf_path: Path) -> Dict:
        """Get information about a PDF file"""
        with open(pdf_path, 'rb') as f:
            pdf = PyPDF2.PdfReader(f)
            return {
                "filename": pdf_path.name,
                "page_count": len(pdf.pages),
                "file_size": pdf_path.stat().st_size
            }
