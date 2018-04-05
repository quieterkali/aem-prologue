//==============================================================================
// Export any Indesign document as PDF
//==============================================================================
app.consoleout('Started Pdf export...');
var exportFolderPdf = new Folder(exportFolder.fullName + "/pdf");
exportFolderPdf.create();
var pdfOutputFile = new File(exportFolderPdf.fullName + fileName + '.pdf');
try {
    with (app.pdfExportPreferences) {
        viewDocumentAfterExport = false;
    }
    document.exportFile(ExportFormat.pdfType, pdfOutputFile);

    app.consoleout('Posting file ' + fileName + '.pdf to location: ' + target + '/jcr:content/renditions');
    putResource (host, credentials,  pdfOutputFile, fileName+'.pdf', 'application/pdf', target);
    app.consoleout('Finished PDF export...');
}
catch (err) {
    throw 'Unable to save PDF ' + pdfOutputFile + ' for ' + sourceFile + ': ' + err.message;
}
finally {
    cleanup(exportFolderPdf);
}