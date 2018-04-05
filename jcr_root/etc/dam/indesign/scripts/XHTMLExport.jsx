//==============================================================================
// Export any Indesign document as XHTML
//==============================================================================

app.consoleout('Started Xhtml export...');
var exportFolderXhtml = new Folder(exportFolder.fullName + "/xhtml");
exportFolderXhtml.create();
var xhtmlOutputFile = new File(exportFolderXhtml.fullName + fileName + '.html');
try {
    with (document.htmlExportPreferences) {
        applyImageAlignmentToAnchoredObjectSettings = true;
        bulletExportOption = BulletListExportOption.AS_TEXT;

        // Check for the Server version to set the compatible paramter
        if (idsCCServer == 'true') {
            customImageSizeOption = ImageSizeOption.SIZE_RELATIVE_TO_TEXT_FLOW;    
        } else {
            customImageSizeOption = ImageSizeOption.SIZE_RELATIVE_TO_PAGE_WIDTH;
        }
        exportOrder = ExportOrder.LAYOUT_ORDER;
        exportSelection = false;
        gifOptionsInterlaced = true;
        gifOptionsPalette = GIFOptionsPalette.WINDOWS_PALETTE;
        ignoreObjectConversionSettings = true;
        imageAlignment = ImageAlignmentType.ALIGN_CENTER;
        imageConversion = ImageConversion.AUTOMATIC;
        imageExportOption = ImageExportOption.ORIGINAL_IMAGE;
        imageExportResolution = ImageResolution.PPI_150;
        imageSpaceAfter = 3;
        imageSpaceBefore = 3;
        includeCSSDefinition = true;
        jpegOptionsFormat = JPEGOptionsFormat.BASELINE_ENCODING;
        jpegOptionsQuality = JPEGOptionsQuality.HIGH;
        leftMargin = 36;
        rightMargin = 36;
        topMargin = 36;
        bottomMargin = 36;
        level = 5;  
        numberedListExportOption = NumberedListExportOption.AS_TEXT;
        preserveLayoutAppearence = true;
        preserveLocalOverride = true;
        viewDocumentAfterExport = false;    
    }
    document.exportFile(ExportFormat.HTML, xhtmlOutputFile);

    app.consoleout('Posting file ' + fileName + '.html to location: ' + target + '/jcr:content/renditions');
    putResource (host, credentials, xhtmlOutputFile, fileName+'.html', 'text/html', target);
    xhtmlOutputFile.remove();
    app.consoleout('Finished Xhtml export...');

    //==== send sub assets ====
    var subAssets = new Array();
    var subAssetTarget = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/subassets";

    collectSubAssets(exportFolderXhtml, subAssets);
    //post sub assets
    putMultipleResource(host,  credentials,  subAssets, subAssetTarget);

}
catch (err) {
    throw 'Unable to save XHtml ' + xhtmlOutputFile + ' for ' + sourceFile + ': ' + err.message;
}
finally {
    cleanup(exportFolderXhtml);
}
