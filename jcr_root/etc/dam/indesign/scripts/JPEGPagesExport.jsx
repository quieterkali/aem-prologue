//==============================================================================
// Export the pages of any Indesign document as Jpeg
//==============================================================================

app.consoleout('Started Jpeg Pages export...');
var exportFolderJpeg = new Folder(exportFolder.fullName + "/jpeg");
exportFolderJpeg.create();
try {
    with (app.jpegExportPreferences) {
        // set this via soap options later?
             exportResolution = 150;
             jpegColorSpace = JpegColorSpaceEnum.RGB;
             jpegQuality = JPEGOptionsQuality.MEDIUM;
             jpegRenderingStyle = JPEGOptionsFormat.PROGRESSIVE_ENCODING;
        viewDocumentAfterExport = false;
    }
    for (var i = 0 ; i < document.pages.length ; ++i) {
        try {
            exportJPEGPage(document, i, exportFolderJpeg.fullName, fileName, resourcePath, host, credentials);
        }
        catch (err) {
            throw 'Unable to save JPEG page #' + i + ' for ' + sourceFile + ': ' + err.message;
        }
    }
    app.consoleout('Finished Jpeg Pages export...');
}
finally {
    cleanup(exportFolderJpeg);
}

function exportJPEGPage(document, pageNo, folderName, fileName, resourcePath, host, credentials) {
	var pageName = document.pages.item(pageNo).name;
    app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
	app.jpegExportPreferences.pageString = pageName;
    //The name of the exported files will be the base name + the 
    //page name + ".jpg". If the page name contains a colon (as it will 
    //if the document contains sections), then remove the colon.
    var regExp = /:/gi;
    pageName = pageName.replace(regExp, "_");
    var pageFileName = "page" + pageName + ".jpg";
    var filePath = folderName + '/' + pageFileName;
	app.consoleout('Writing page ' + pageNo + ' to ' + filePath);
    var outputFile = new File(filePath);
    document.exportFile(ExportFormat.JPG, outputFile);
    //==== send file to CQ ====
    var target = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/subassets";
    app.consoleout('Posting this file to CQ: ' + filePath);
    app.consoleout('Posting to location: ' + target);
    putResource (host, credentials, outputFile, pageFileName, 'image/jpeg', target);
}