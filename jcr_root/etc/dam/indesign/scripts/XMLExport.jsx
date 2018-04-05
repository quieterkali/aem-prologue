//==============================================================================
// Export any Indesign document as XML
//==============================================================================
app.consoleout('Started Xml export...');
var exportFolderXml = new Folder(exportFolder.fullName + "/xml");
exportFolderXml.create();
var xmlOutputFile = new File(exportFolderXml.fullName + fileName + '.xml');
try {
    with (document.xmlExportPreferences) {
        copyOriginalImages = true;
        viewDocumentAfterExport = false;
    }
    document.exportFile(ExportFormat.XML, xmlOutputFile);

    app.consoleout('Posting file ' + fileName + '.xml to location: ' + target + '/jcr:content/renditions');
    putResource (host, credentials, xmlOutputFile, fileName+'.xml', 'text/xml', target);
    xmlOutputFile.remove();
    app.consoleout('Finished Xml export...');

    //==== send sub assets ====
    var subAssets = new Array();
    var subAssetTarget = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/subassets";

    collectSubAssets(exportFolderXml, subAssets);
    //post sub assets
    putMultipleResource(host,  credentials,  subAssets, subAssetTarget);

}
catch (err) {
    throw 'Unable to save XML ' + xmlOutputFile + ' for ' + sourceFile + ': ' + err.message;
}
finally {
    cleanup(exportFolderXml);
}
