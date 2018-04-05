app.consoleout('Started Catalog generation...');

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

if (app.scriptArgs.isDefined("resource")) {
    var resourcePath = app.scriptArgs.getValue("resource");
} else {
    throw "resource argument is missing";
}

if(app.scriptArgs.isDefined("formats")){
    var formats = app.scriptArgs.getValue("formats");
}

var addPageNumbering = false;
if (app.scriptArgs.isDefined("enablePageNumbering")) {
    addPageNumbering = app.scriptArgs.getValue("enablePageNumbering");
}
app.consoleout('addPageNumbering: '+ addPageNumbering);
var pages = "";
if(app.scriptArgs.isDefined("pages")){
    pages = app.scriptArgs.getValue("pages");
}

var asstExt = getAssetExt(resourcePath);
var fileList=[];
var exportFilesList=[];
var exportFolder = new Folder((new Date().getTime() - Math.floor((Math.random()*10000)+1) ) );
try{
    exportFolder.create();
    if(pages != null){
        var pageArray = pages.split(',');
        for(var i=0;i<pageArray.length-1;i++){
            var assetName = pageArray[i].substring(pageArray[i].lastIndexOf ('/')+1);
            var pageFileName = assetName.substring ( 0,assetName.lastIndexOf ('.')>0? assetName.lastIndexOf ('.') :assetName.length) + '.indd';
            var page = new File(exportFolder.fullName +'/'+ 'page'+(i)+'.indd');
            app.consoleout('Fetching resource from CQ (for Merge): ');
            app.consoleout('page[i]: ' + host + pageArray[i]+'/jcr:content/renditions/'+getINDDRenditionName(pageArray[i]) + ' to ' + page);
            fetchResource (host,  credentials, pageArray[i]+'/jcr:content/renditions/'+getINDDRenditionName(pageArray[i]) , page);
            fileList.push(page);
        }
    }
  var destination_doc = app.open(fileList[0]);

  // Set document face to false, for 1 page 1 spread
  destination_doc.documentPreferences.facingPages = false;

  /*
   * Indesign Script API REference: http://www.indesignjs.de/extendscriptAPI/indesign10/#Document.html
   * ADOBE INDESIGN CS6 SCRIPTING GUIDE : https://www.adobe.com/content/dam/Adobe/en/devnet/indesign/sdk/cs6/scripting/InDesign_ScriptingGuide_JS.pdf
   */

  var pageNo = destination_doc.pages.length+1;
  for ( var i = 1; i < fileList.length; i++ ) {
      app.consoleout("Merging File:"+i);
    var source_file = fileList[i];
    // making sure it’s an indesign file…
    if ( source_file instanceof File ) {
        var source_doc = app.open(source_file);
        // Set document face to false, for 1 page 1 spread
        source_doc.documentPreferences.facingPages = false;

        for ( var count = 0; count < source_doc.pages.length; count++ ) {
        var sourcePages = source_doc.pages.item(count);
        // break the master page items so they can be moved onto the new document.
        var masterItems = sourcePages.masterPageItems;
        if ( masterItems.length > 0 ) {
            for ( var j=0; j<masterItems.length; j++ ) {
                masterItems[j].override(sourcePages);
            }
        }
    // removing the applied master (this can mess up some files if not done)
    sourcePages.appliedMaster=null;
    // Start a new spread for next page, Due to limitation of 10 pages per spread
    destination_doc.spreads.add(LocationOptions.AT_END);
    destination_doc.spreads.lastItem ().appliedMaster = null;

   //Move page to Destination Document
    sourcePages.duplicate(LocationOptions.AFTER,destination_doc.pages[destination_doc.pages.length - 1]);
    }
    // closes the file that was opened without saving (to avoid memory problems)
    source_doc.close(SaveOptions.NO);
    }

  }

    // remove empty pages generated due to add spread
   removeEmptyPages(destination_doc)
    // re-number the pages
   renumberPages(destination_doc);

  var outputFilename = resourcePath.substring ( resourcePath.lastIndexOf ('/')) ;
  if (outputFilename.lastIndexOf('.')>0){
     outputFilename = outputFilename.substring(0,outputFilename.lastIndexOf('.'));
  }
  with (app.jpegExportPreferences) {
      // set this via soap options later?
      exportResolution = 150;
      jpegColorSpace = JpegColorSpaceEnum.RGB;
      jpegQuality = JPEGOptionsQuality.MEDIUM;
      jpegRenderingStyle = JPEGOptionsFormat.PROGRESSIVE_ENCODING;
      viewDocumentAfterExport = false;
  }
  // add pagenumbering
    if (addPageNumbering) {
        with (destination_doc.documentPreferences) facingPages = false;
        destination_doc = addPageFooter (destination_doc);
    }
  if (formats.indexOf("jpg")>= 0){
     app.consoleout('Started JPG generation...');
     var pageNo = 0;
     var pagetarget = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/subassets";
      for (var i = 0 ; i < destination_doc.pages.length ; ++i) {
          try {
              exportJPEGPage(destination_doc, i,pagetarget );
          }
          catch (err) {
              throw 'Unable to save JPEG page #' + i ;
          }
      }
     app.consoleout('Finished JPG generation...');
  }

  //export jpeg rendition of main doc for thumbnail generation, first page's rendition
    app.jpegExportPreferences.pageString = destination_doc.pages.item(0).name;
  var jpgFile = new File(exportFolder.fullName+ '/' + 'thumbnail.jpg');
  destination_doc.exportFile(ExportFormat.JPG, jpgFile);
  exportFilesList.push({'fileName': 'thumbnail.jpg', file: jpgFile});
  exportFilesList.push({'fileName': outputFilename+ '.jpg', file: jpgFile});

  if('.indd' == asstExt){
      if (formats.indexOf("indd")>= 0){
         app.consoleout('Started INDD generation...');
         var inddFile = new File(exportFolder.fullName + outputFilename+ '.indd');
         var target = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/renditions"
         destination_doc.save(inddFile);
         putResource (host, credentials,  inddFile,'original', 'application/x-indesign', target);
         app.consoleout('Finished INDD generation...');
     }

     if (formats.indexOf("pdf")>= 0){
         app.consoleout('Started PDF generation...');
         var pdfFile = new File((exportFolder.fullName + outputFilename+'.pdf'));
         with (app.pdfExportPreferences) {
          viewDocumentAfterExport = false;
         }
         //app.pdfExportPresets.item("[Press Quality]");
         destination_doc.exportFile(ExportFormat.pdfType, pdfFile);
         exportFilesList.push({'fileName': outputFilename + '.pdf', file: pdfFile});
         app.consoleout('Finished PDF generation...');
       }
  } else {
      if (formats.indexOf("pdf")>= 0){
         app.consoleout('Started PDF generation...');
         var pdfFile = new File((exportFolder.fullName + outputFilename+'.pdf'));
         var target = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/renditions"
          with (app.pdfExportPreferences) {
           viewDocumentAfterExport = false;
          }
          destination_doc.exportFile(ExportFormat.pdfType, pdfFile);
         putResource (host, credentials,  pdfFile,'original', 'application/pdf', target);
         app.consoleout('Finished PDF generation...');
      }
      if (formats.indexOf("indd")>= 0){
         app.consoleout('Started INDD generation...');
         var inddFile = new File(exportFolder.fullName + outputFilename+ '.indd');
         destination_doc.save(inddFile);
         exportFilesList.push({'fileName': outputFilename + '.indd', file: inddFile});
         app.consoleout('Finished INDD generation...');
      }
  }


  destination_doc.close();

  //==== send file to CQ ====

  app.consoleout('Posting to location: ' + target);

  putMultipleResource (host, credentials,  exportFilesList, target);

  }




finally {
//==== remove the temp folder ====
    cleanup(exportFolder);
}

function exportJPEGPage(document, pageNo,pagetarget ) {
    var pageName = document.pages.item(pageNo).name;
    app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
	app.jpegExportPreferences.pageString = pageName;
    var fileName = 'page'+(pageNo+1);
    var pageFile = new File(exportFolder.fullName+ '/'+ fileName+ '.jpg');
	app.consoleout('Exporting JPG of page : ' + (pageNo+1));
    document.exportFile(ExportFormat.JPG, pageFile);
    putResource (host, credentials, pageFile, fileName + '.jpg', 'image/jpeg', pagetarget);
  //  fileList.push({'fileName': fileName + '.jpg', file: pageFile});
}


//remove empty pages, Generated due to add spread
function removeEmptyPages(document){
    for(var k=0;k < document.pages.length;k++){
        var page = document.pages[k];
        if(page.pageItems.length <= 0){
            page.remove();
        }
    }
}

//Re-Number the pages after merge

function renumberPages(document){
      var pageStart = 1;
      for(var p=0;p < document.sections.length;p++){
        document.sections[p].continueNumbering = false;
        document.sections[p].pageNumberStart = pageStart;
        pageStart = pageStart + destination_doc.sections[p].length;
      }
}

function getINDDRenditionName (asstpath){
    var assetName = asstpath.substring(asstpath.lastIndexOf ('/')+1);
    if ( assetName.substring ( assetName.lastIndexOf('.'),assetName.length )===('.indd'))
        return 'original';
     else
       return assetName.substring ( 0,
               assetName.lastIndexOf ('.')>0? assetName.lastIndexOf ('.') :assetName.length) + '.indd';
    }

function getAssetExt(resourcePath){
    if(resourcePath.lastIndexOf('.') > -1){
        return resourcePath.substring(resourcePath.lastIndexOf('.'));
    }
    return 'indd';
}

function addPageFooter (destination_doc){
	app.consoleout('Started Page Numbering...');
	var totalPages = destination_doc.pages.length;
    var currentPageNumber = 1;

    for (i = 0; i< totalPages ; i++) {

        var currentPage = destination_doc.pages[i];

        var textFramePageNumber = currentPage.textFrames.add();
		textFramePageNumber.textFramePreferences.verticalJustification = VerticalJustification.BOTTOM_ALIGN;
		//Set the bounds of the text frame
		textFramePageNumber.geometricBounds = getTextFrameBounds(currentPage);
		//Enter text in the text frame
		textFramePageNumber.contents = currentPageNumber.toString() ;
        textFramePageNumber.insertionPoints[0].justification=Justification.RIGHT_ALIGN;
        currentPageNumber ++;
    }

	app.consoleout('Finished Page Numbering... Total Pages = ' + totalPages );
    return destination_doc ;
    }
function getTextFrameBounds(myPage){

     	var myPageWidth = myPage.bounds[3] - myPage.bounds[1];
        var myPageHeight = myPage.bounds[2] - myPage.bounds[0]

        if(myPage.side == PageSideOptions.leftHand){
            var myX2 = myPage.marginPreferences.left;
            var myX1 = myPage.marginPreferences.right;
        }
        else{
            var myX1 = myPage.marginPreferences.left;
            var myX2 = myPage.marginPreferences.right;
        }
        var myY1 = myPage.marginPreferences.top;
        var myX2 = myPageWidth - myX2;
        var myY2 = myPageHeight - myPage.marginPreferences.bottom;

		app.consoleout( "["+ myY1+ ","+ myX1 +","+ myY2 +","+ myX2 +"]");
        return [myY1, myX1, myY2, myX2];
    }
