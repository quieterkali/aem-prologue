//==============================================================================
// Export the pages of any Indesign document as Jpeg
//==============================================================================

app.consoleout('Started Jpeg Pages export...');

if (app.scriptArgs.isDefined("credentials")) {
    var credentials = app.scriptArgs.getValue("credentials");
} else {
    throw "CQ host credentials argument is missing";
}

if (app.scriptArgs.isDefined("asset_path")) {
    var asset = app.scriptArgs.getValue("asset_path");
} else {
    throw "asset path argument is missing";
}
if (app.scriptArgs.isDefined("cqHost")) {
    var host = app.scriptArgs.getValue("cqHost");
} else {
    throw "cqHost argument is missing";
}
if (app.scriptArgs.isDefined("idTemplatePath")) {
    var idTemplatePath = app.scriptArgs.getValue("idTemplatePath");
} else {
    throw "idTemplatePath argument is missing";
}

if (app.scriptArgs.isDefined("resource")) {
    var resourcePath = app.scriptArgs.getValue("resource");
} else {
    throw "resource argument is missing";
}

var target = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/subassets";
var fileList = [];
app.serverSettings.imagePreview=true;
var exportFolder = new Folder((new Date().getTime() - Math.floor((Math.random()*10000)+1) ) );
exportFolder.create();
var fileName;
var extnIdx = idTemplatePath.lastIndexOf ('.');
if (-1 === extnIdx) {
    fileName = idTemplatePath.substring (idTemplatePath.lastIndexOf ('/'));
} else {
    fileName = idTemplatePath.substring (idTemplatePath.lastIndexOf ('/'), extnIdx);
}
var sourceFile = new File(exportFolder.fullName  + '/template.indd');

app.consoleout('Fetching resource from CQ (for IDSPrint): ' + host + idTemplatePath + ' to ' + sourceFile);
fetchResource (host,  credentials, idTemplatePath, sourceFile);


var document = app.open(sourceFile);
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
            exportJPEGPage(document, i,fileList);
        }
        catch (err) {
            throw 'Unable to save JPEG page #' + i + ' for ' + sourceFile + ': ' + err.message;
        }
    }

    var rendtarget = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/renditions";
     // export first page as cover page
    app.jpegExportPreferences.pageString = document.pages.item(0).name;
    var jpgFile = new File(exportFolder.fullName + fileName + '.jpg');
    document.exportFile(ExportFormat.JPG, jpgFile);
    putResource (host, credentials, jpgFile, 'thumbnail.jpg', 'image/jpeg', rendtarget);

    //==== send file to CQ ====

    app.consoleout('Posting to location: ' + target);

    app.consoleout('Retrieving page info for tags');

    putMultipleResource (host, credentials,  fileList, target);
    var root = document.xmlElements[0];
    var reqParams = {};
    processElement (root, '',reqParams)
    postReqParams(host,credentials,asset+'/jcr:content/renditions/cq-indesign-print/jcr:content',reqParams);
    app.consoleout('Page info for tags retrieved');

    //close the src doc
    document.close();
}
finally {
    cleanup(exportFolderJpeg);
}

function exportJPEGPage(document, pageNo,fileList ) {
    var pageName = document.pages.item(pageNo).name;
    app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
	app.jpegExportPreferences.pageString = pageName;
    var fileName = 'page'+(pageNo+1);
    var pageFile = new File(exportFolder.fullName +'/'+ fileName+ '.jpg');
	app.consoleout('Writing page ' + pageNo + ' to ' + fileName);
    document.exportFile(ExportFormat.JPG, pageFile);
    fileList.push({'fileName': fileName + '.jpg', file: pageFile});
}

function processElement(element, prefix, map){
   if (element.xmlElements.length ==0  ){
      var docPos = element.xmlContent;
        if ('insertionPoints' in docPos){
           docPos = docPos.insertionPoints[0].parentTextFrames[0] 
        }
        map[prefix + element.markupTag.name + '_pageNo'] =  docPos.parentPage.name;
   }
   else {
       var j =0;
       for (j=0; j<element.xmlElements.length; j++) {
           processElement (element.xmlElements[j], prefix+element.markupTag.name+'/', map)
           }
       }
}
