
from pathlib import Path

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import (
    PdfPipelineOptions,
    TesseractCliOcrOptions,
)
from docling.document_converter import DocumentConverter, PdfFormatOption
import img2pdf


def main_pdf(pdf_file):
    data_folder = Path(pdf_file)
    input_doc_path = data_folder

    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_ocr = True
    pipeline_options.do_table_structure = True
    pipeline_options.table_structure_options.do_cell_matching = True

    ocr_options = TesseractCliOcrOptions(force_full_page_ocr=True)
    pipeline_options.ocr_options = ocr_options

    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=pipeline_options,
            )
        }
    )

    doc = converter.convert(input_doc_path).document
    md = doc.export_to_html()
    print(md)


def main_image(image_file):
    data_folder = Path(image_file)
    input_doc_path = data_folder

    pdf_file = "output.pdf"
    # Open the output PDF file in binary write mode
    with open(pdf_file, "wb") as f:
        # Convert the image to PDF bytes and write them to the file
        f.write(img2pdf.convert(image_file))
    
    return main_pdf(pdf_file)


if __name__ == "__main__":
    # main_pdf('./sample.pdf')
    main_image('./sample2.png')