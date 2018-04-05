//==============================================================================
// Export the pages of any Indesign document as PDF
//==============================================================================
app.consoleout('Started Pdf Pages export...');
var exportFolderPdfPages = new Folder(exportFolder.fullName + "/pdfpages");
exportFolderPdfPages.create();
try {
    with (app.pdfExportPreferences) {
        viewDocumentAfterExport = false;
    }
    for (var i = 0 ; i < document.pages.length ; ++i) {
        try {
            exportPDFPage(document, i, exportFolderPdfPages.fullName, fileName, resourcePath, host, credentials);
        }
        catch (err) {
            throw 'Unable to save PDF page #' + i + ' for ' + sourceFile + ': ' + err.message;
        }
    }
    app.consoleout('Finished Pdf Pages export...');
    }
finally {
	cleanup(exportFolderPdfPages);
}


function exportPDFPage(document, pageNo, folderName, fileName, resourcePath, host, credentials) {
    //app.pdfExportPresets.item("[Press Quality]");
	var pageName = document.pages.item(pageNo).name;
	app.pdfExportPreferences.pageRange = pageName;
    //The name of the exported files will be the base name + the 
    //page name + ".pdf". If the page name contains a colon (as it will 
    //if the document contains sections), then remove the colon.
    var regExp = /:/gi;
    pageName = pageName.replace(regExp, "_");
    var pageFileName = pageName + ".pdf";
    var filePath = folderName + '/' + pageFileName;
	app.consoleout('Writing page ' + pageNo + ' to ' + filePath);
    var outputFile = new File(filePath);
    document.exportFile(ExportFormat.pdfType, outputFile);
    //==== send file to CQ ====
    var target = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/subassets";
    app.consoleout('Posting this file to CQ: ' + filePath);
    app.consoleout('Posting to location: ' + target);
    putResource (host, credentials, outputFile, pageFileName, 'application/pdf', target);
}