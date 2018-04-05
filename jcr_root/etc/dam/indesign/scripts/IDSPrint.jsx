//==============================================================================
// Merge tag xml data into any Indesign document and generate PDF
//==============================================================================

//==== get soap arguments ====
app.consoleout('Started IDSPrint Script - Export generation...');

if (app.scriptArgs.isDefined("credentials")) {
    var credentials = app.scriptArgs.getValue("credentials");
} else {
    throw "CQ host credentials argument is missing";
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

if (app.scriptArgs.isDefined("tagXml")) {
    var tagXml = app.scriptArgs.getValue("tagXml");
} else {
    throw "tagXml argument is missing";
}

if (app.scriptArgs.isDefined("resource")) {
    var resourcePath = app.scriptArgs.getValue("resource");
} else {
    throw "resource argument is missing";
}
var imageList = "";
if(app.scriptArgs.isDefined("imageList")){
    imageList = app.scriptArgs.getValue("imageList");
}
if(app.scriptArgs.isDefined("formats")){
    var formats = app.scriptArgs.getValue("formats");
}
if (app.scriptArgs.isDefined("styles")) {
    var styles = app.scriptArgs.getValue("styles");
    app.consoleout('styles...'+styles);
}
app.serverSettings.imagePreview=true;
var exportFolder = new Folder((new Date().getTime() - Math.floor((Math.random()*10000)+1) ) );
//
try {
    //==== create a temporary folder under InDesign server tmp directory to fetch and export ====
    // added randomness to the folder name
    exportFolder.create();
    var fileName;
    var extnIdx = idTemplatePath.lastIndexOf ('.');
    if (-1 === extnIdx) {
        fileName = idTemplatePath.substring (idTemplatePath.lastIndexOf ('/'));
    } else {
        fileName = idTemplatePath.substring (idTemplatePath.lastIndexOf ('/'), extnIdx);
    }
    var sourceFile = new File(exportFolder.fullName  + '/template.indd');
    var outFileName = getFileName(resourcePath);
    var dataFile = new File(exportFolder.fullName + fileName + '.xml');
    var success = dataFile.open ("w");
    dataFile.encoding = XMLFileEncoding.UTF8;
    dataFile.write(tagXml);
    dataFile.close();
    app.consoleout('Fetching resource from CQ (for IDSPrint): ' + host + idTemplatePath + ' to ' + sourceFile);
    fetchResource (host,  credentials, idTemplatePath, sourceFile);
    if(imageList != null){
        var imageListArray = imageList.split(',');
        for(var i=0;i<imageListArray.length-1;i++){
            var imageFile = new File(exportFolder.fullName + imageListArray[i].substring(imageListArray[i].lastIndexOf('/')));
            fetchResource (host,  credentials, imageListArray[i], imageFile);
        }
    }

    var document = app.open(sourceFile);
    var myXMLImportPreferences = document.xmlImportPreferences;
    myXMLImportPreferences.allowTransform = false;
    myXMLImportPreferences.createLinkToXML = false;
    myXMLImportPreferences.ignoreUnmatchedIncoming = true;
    myXMLImportPreferences.ignoreWhitespace = true;
    myXMLImportPreferences.importCALSTables = true;
    myXMLImportPreferences.importStyle = XMLImportStyles.mergeImport;
    myXMLImportPreferences.importTextIntoTables = false;
    myXMLImportPreferences.importToSelected = false;
    myXMLImportPreferences.removeUnmatchedExisting = false;
    myXMLImportPreferences.repeatTextElements = true;

    document.importXML (dataFile);
    var root = document.xmlElements[0];
    var reqParams = {};

    applyStyles (document,root, '',JSON.parse(styles))



    var fileList = [];
    var outXMLFile = new File(exportFolder.fullName + fileName + '_out.xml');
    if (formats.indexOf("xml")>= 0){
        app.consoleout('Started XML generation...');
        for(var j=document.textFrames.length-1; j>=0; j--){
		var frame = document.textFrames[j];
		if(frame && frame.overflows == true) { //mark all the overflow element
          if( frame.associatedXMLElement) frame.associatedXMLElement.xmlAttributes.add('overflow', 'true');
           }
       }
        document.exportFile(ExportFormat.xml, outXMLFile);
       fileList.push({'fileName': outFileName + '.xml', file: outXMLFile});
        app.consoleout('Finished XML generation...');
    }
    with (app.pdfExportPreferences) {
        viewDocumentAfterExport = false;
    }

    var target = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/renditions"
    if (formats.indexOf("pdf")>= 0){
        app.consoleout('Started PDF generation...');
        var pdfFile = new File(exportFolder.fullName + fileName + '.pdf');

    //app.pdfExportPresets.item("[Press Quality]");
        document.exportFile(ExportFormat.pdfType, pdfFile);
        fileList.push({'fileName': outFileName + '.pdf', file: pdfFile});
        app.consoleout('Finished PDF generation...');
    }
    if (formats.indexOf("jpg")>= 0){
         app.consoleout('Started JPG generation...');
         with (app.jpegExportPreferences) {
             // set this via soap options later?
             exportResolution = 150;
             jpegColorSpace = JpegColorSpaceEnum.RGB;
             jpegQuality = JPEGOptionsQuality.MEDIUM;
             jpegRenderingStyle = JPEGOptionsFormat.PROGRESSIVE_ENCODING;
             viewDocumentAfterExport = false;
         }
        var pagetarget = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/subassets";
         for (var i = 0 ; i < document.pages.length ; ++i) {
             try {
                  exportJPEGPage(document, i,pagetarget );
                  app.consoleout('Writing page ' + i );
             }
             catch (err) {
                 throw 'Unable to save JPEG page #' + i + ' for ' + sourceFile + ': ' + err.message;
             }
         }
         // export first page as cover page
        app.jpegExportPreferences.pageString = document.pages.item(0).name;
        var jpgFile = new File(exportFolder.fullName+ '/' + fileName + '.jpg');
        document.exportFile(ExportFormat.JPG, jpgFile);
        fileList.push({'fileName': outFileName + '.jpg', file: jpgFile});
        fileList.push({'fileName': 'thumbnail.jpg', file: jpgFile});
        app.consoleout('Finished JPG generation...');
    }
    if (formats.indexOf("indd")>= 0){
        app.consoleout('Started INDD generation...');
                var inddFile = new File(exportFolder.fullName  + '/orig.indd');
                 var links = [];
                links=document.links;
                for(var j=0;j<links.length;j++ )
                {
                    var link = links[j];

                    link.unlink(); // embedd the links inside the file

                }
                app.consoleout('INDD generation Finished... ');
                document.close(SaveOptions.yes, inddFile);
                putResource (host, credentials,  inddFile, 'original', 'application/x-indesign', target);
               // fileList.push({'fileName': outFileName + '.indd', file: inddFile});
    }
    // close the document



    //==== send file to CQ ====

    app.consoleout('Posting to location: ' + target);

    putMultipleResource (host, credentials,  fileList, target);


    //==== remove the original resource and send the export back to CQ ====
    sourceFile.remove();

    returnValue = "PDF exported and posted successfully";
}
finally {
//==== remove the temp folder ====
    cleanup(exportFolder);
}

app.consoleout('Finished IDSPrint Script - Export generation...');

function exportJPEGPage(document, pageNo,pagetarget ) {
    var pageName = document.pages.item(pageNo).name;
    app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
	app.jpegExportPreferences.pageString = pageName;
    var fileName = 'page'+(pageNo+1);
    var pageFile = new File(exportFolder.fullName+ '/' + fileName+ '.jpg');
	app.consoleout('Writing page ' + pageNo + ' to ' + fileName);
    document.exportFile(ExportFormat.JPG, pageFile);
    putResource (host, credentials, pageFile, fileName + '.jpg', 'image/jpeg', pagetarget);
   // fileList.push({'fileName': fileName + '.jpg', file: pageFile});
}

function getFileName (asstpath){
       return asstpath.substring (asstpath.lastIndexOf ('/')+1,
               asstpath.lastIndexOf ('.')>0? asstpath.lastIndexOf ('.') :asstpath.length) ;
}

function applyStyles(document, element, prefix, stylesmap){
   if (element.xmlElements.length ==0  ){
      var docPos = element.xmlContent;
      var tagName = prefix  + element.markupTag.name;
      var tagStyle = stylesmap[tagName+"__style"];
       app.consoleout("styles tagname "+ tagName+"__style");
        if (('insertionPoints' in docPos) && tagStyle){
           docPos = docPos.insertionPoints[0].parentTextFrames[0] ;
           var myTextObject = docPos.parentStory;
           var myCharacterStyle = document.characterStyles.add();
           myCharacterStyle.name = tagName.replace(/\//g,'_');
           if (tagStyle["font-weight"] == "bold" && tagStyle["font-style"]== "italic") {
               try {
                 myTextObject.fontStyle = "Bold Italic";
               } catch(e) {
                   app.consoleout(""+e.message);
               }
            }
            else if (tagStyle["font-weight"] == "bold"){
                try {
                       myTextObject.fontStyle = "Bold";
                } catch(e)  {
                    app.consoleout(""+e.message);
                }
            }
            else if (tagStyle["font-style"] == "italic"){
                try {
                    myTextObject.fontStyle = "Italic";
                } catch(e) {
                    app.consoleout(""+e.message);
                }
            }

            if (tagStyle["text-decoration"] == "underline") {


                myTextObject.underline = true;
                myTextObject.underlineColor =  "Text Color";
                myTextObject.underlineOffset = 3;
                myTextObject.underlineOverprint = true;
                myTextObject.underlineTint = 100;
                myTextObject.underlineType = document.strokeStyles.item("Solid");
                myTextObject.underlineWeight = 1;

           }
         //  element.applyCharacterStyle(myCharacterStyle, true);
            try {
                if(tagStyle["font-family"]) {
                    try{
                       myTextObject.appliedFont = app.fonts.item(tagStyle["font-family"]);
                    } catch(e){
                        app.consoleout(e.message+" : "+tagStyle["font-family"]);
                    }
                }

                if(tagStyle["font-size"]) {
                    myTextObject.pointSize = tagStyle["font-size"];
                }

                if(tagStyle["color"]) {
                    var color = tagStyle["color"].toString().split(',');
                    var colorVal = [110,150,10,0];
                    var newColorname = color.toString();
                    colorVal[0] = parseInt(color[0]);
                    colorVal[1] = parseInt(color[1]);
                    colorVal[2] = parseInt(color[2]);
                    colorVal[3] = 1;
                    try{
                        var colorSpace = ColorSpace.rgb;
                        if(myTextObject.fillColor.space == ColorSpace.cmyk){
                            app.consoleout("Color Space:"+'CMYK');
                        } else {
                            app.consoleout("Color Space:"+'RGB');
                        }
                        var myColorA = document.colors.add({name:newColorname, model:ColorModel.process, space:colorSpace,
                    colorValue:colorVal});
                    } catch(e){
                        app.consoleout("color error: "+e.message);
                    } finally {
                        app.consoleout("Text  color space:"+ myTextObject.fillColor.name);
                        app.consoleout("Text stroke color:"+myTextObject.strokeColor.name);
                        myTextObject.fillColor = document.colors.item(newColorname);
                        myTextObject.strokeColor = document.colors.item(newColorname);
                    }
                }

            } catch(e) {
                app.consoleout(""+e.message);
            }

        }
         
   }
   else {
       var j =0;
       for (j=0; j<element.xmlElements.length; j++) {
           applyStyles (document,element.xmlElements[j], prefix+element.markupTag.name+'/', stylesmap)
           
           }       
       }

}