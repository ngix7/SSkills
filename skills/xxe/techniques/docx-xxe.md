# DOCX/OOXML XXE

## Summary
XXE via Office document upload.

## Technique
1. Extract .docx file (it's a ZIP)
2. Modify `word/document.xml` with XXE payload
3. Repackage and upload
