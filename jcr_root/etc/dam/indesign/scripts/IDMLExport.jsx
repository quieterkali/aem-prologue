//==============================================================================
// Export Indesign document as IDML
//==============================================================================
app.consoleout('Started Idml export...');
var exportFolderIdml = new Folder(exportFolder.fullName + "/idml");
exportFolderIdml.create();
var idmlOutputFile = new File(exportFolderIdml.fullName + fileName + '.idml');
try {
    document.exportFile(ExportFormat.INDESIGN_MARKUP, idmlOutputFile);

    app.consoleout('Posting file ' + fileName + '.idml to location: ' + target + '/jcr:content/renditions');
    putResource (host, credentials,  idmlOutputFile, fileName+'.idml', 'application/epub+zip', target);

    app.consoleout('Finished IDML export...');
}
catch (err) {
    throw 'Unable to save IDML ' + idmlOutputFile + ' for ' + sourceFile + ': ' + err.message;
}
finally {
	cleanup(exportFolderIdml);
}
