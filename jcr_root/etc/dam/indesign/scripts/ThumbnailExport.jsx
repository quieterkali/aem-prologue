//==============================================================================
// Generate high quality jpeg thumbnail
//==============================================================================
app.consoleout('Started Thumbnail export...');
var exportFolderThumbnail = new Folder(exportFolder.fullName + "/thumbnail");
exportFolderThumbnail.create();
var thumbnailOutputFile = new File(exportFolderThumbnail.fullName + '/thumbnail.jpg');
try {
    with (app.jpegExportPreferences) {
        // set this via soap options later?
             exportResolution = 150;
             jpegColorSpace = JpegColorSpaceEnum.RGB;
             jpegQuality = JPEGOptionsQuality.MEDIUM;
             jpegRenderingStyle = JPEGOptionsFormat.PROGRESSIVE_ENCODING;
        viewDocumentAfterExport = false;
        pageString = document.pages.item(0).name;
        jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
    }
    document.exportFile(ExportFormat.JPG, thumbnailOutputFile);

    app.consoleout('Posting file thumbnail.jpg to location: ' + target + '/jcr:content/renditions');
    putResource (host, credentials, thumbnailOutputFile, 'thumbnail.jpg', 'image/jpeg', target);

    app.consoleout('Thumbnail created and posted successfully...');
}
catch (err) {
    throw 'Unable to save thumbnail ' + thumbnailOutputFile + ' for ' + sourceFile + ': ' + err.message;
}
finally {
	cleanup(exportFolderThumbnail);
}
