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
if (app.scriptArgs.isDefined("idsCCServer")) {
    var idsCCServer = app.scriptArgs.getValue("idsCCServer");
} else {
    throw "idsCCServer argument is missing";
}

if (app.scriptArgs.isDefined("proxyJobId")){
    var proxyJobId = app.scriptArgs.getValue("proxyJobId");
}
else {
    throw "proxyJobId argument is missing";
}

try {
    var exportFolder = new Folder("tmp-" + proxyJobId);
    exportFolder.create();
    var sourceFolder = new Folder("tmpsrc-" + proxyJobId);
    sourceFolder.create();
    var extnIdx = resourcePath.lastIndexOf ('.');
    if (-1 === extnIdx) {
        fileName = resourcePath.substring (resourcePath.lastIndexOf ('/'));
    } else {
        fileName = resourcePath.substring (resourcePath.lastIndexOf ('/'), extnIdx);
    }
    var sourceFile = new File(sourceFolder.fullName + fileName + '.indd');

    app.consoleout('Fetching resource from CQ: ' + host + resourcePath + ' to ' + sourceFile);
    fetchResource (host,  credentials, resourcePath, sourceFile);

    if ('httpLinkConnectionManager' in app) {
        var decodedCredentials = Base64.decode(credentials);
        var credentialArray = decodedCredentials.split(":");
        var aemCredentials = '{"username":"' + credentialArray[0] + '","password":"' + credentialArray[1] + '"}';
        var instance = "aem://" + host;
        try {
            app.httpLinkConnectionManager.httpConnect(instance,aemCredentials);
        }
        catch (e) {
            app.consoleout('ERROR: Unable to connect to instance ' + instance);
            app.consoleout(''+e);
        }
    }

    if(app.scriptArgs.isDefined("isSnippet") && app.scriptArgs.getValue("isSnippet") == 'true') {
        app.consoleout('Input file is a Snippet. Started creating new InDesign document and place it in it...');

        // constants
        var NS_XMP_MM = "http://ns.adobe.com/xap/1.0/mm/";
        var URL_XMP_SEARCH = "/content/dam/dam:batch.xmp-search.json";

        // snippet data folder
        var snippetFolder = new Folder(sourceFolder.fullName + "/snippet");
        snippetFolder.create();

        // create new document and insert snippet
        var doc = app.documents.add();
        var page = doc.pages.item(0);
        page.marginPreferences.properties = { top : 0, left: 0, right: 0, bottom:0 };
        var snippet = page.place(sourceFile, [0, 0]);
        // get XMP IDs for all graphics
        var xmpIndex = {};
        var xmpIndexSize = 0;
        var relinked = {  };
        var relinkedSize = 0;
        for(var i = 0; i < page.allGraphics.length; i++) {
            try {
                var graphic = page.allGraphics[i];
                var instanceId = graphic.itemLink.linkXmp.getProperty(NS_XMP_MM, 'InstanceID');
                var documentId = graphic.itemLink.linkXmp.getProperty(NS_XMP_MM, 'DocumentID');
                var key = instanceId + '-' + documentId;
                if(xmpIndex[key] == undefined) {
                    xmpIndex[key] = {
                        documentId: documentId,
                        instanceId: instanceId,
                        itemLinks: [ graphic.itemLink ]
                    };
                    xmpIndexSize++;
                } else {
                    xmpIndex[key].itemLinks.push(graphic.itemLink);
                }
            } catch(e) {
                // error reading XMP data
                try {
                    // extract asset information from file path
                    var filePath = graphic.properties.itemLink.filePath.replace(/\\/g , '/');
                    var hostPrefix = filePath.substr(0, host.length + 2);
                    if (hostPrefix == '//' + host) {
                        var assetPath = filePath.substring(hostPrefix.length, filePath.length);
                        var assetFileName = assetPath.substring(assetPath.lastIndexOf('/') + 1, assetPath.length);
                        relinked['aemLink-' + relinkedSize++] = {
                            fileName: assetFileName,
                            path: assetPath,
                            documentId: 'unknown',
                            instanceId: 'unknown'
                        };
                    }
                } catch (e) {
                    app.consoleout('ERROR: Could not extract asset information from file path');
                    app.consoleout(''+e);
                }
            }
        }
        // get batch limit
        app.consoleout('Fetching Service Description from CQ: ' + host + URL_XMP_SEARCH);
        try {
            var limitObj = fetchJSONObjectByGET(host, credentials, URL_XMP_SEARCH);
            var maxBatchSize = limitObj.limit;
            // create batch request body
            var requestBody = "";
            var currentBatchSize = 0;
            var sumAllRequestedAssets = 0;
            for(var id in xmpIndex) {
                var xmp = xmpIndex[id];
                requestBody += 'xmp.iid=' + xmp.instanceId + '&xmp.did=' + xmp.documentId + '&';
                currentBatchSize++;
                sumAllRequestedAssets++;
                // check to execute request
                if(currentBatchSize == maxBatchSize || sumAllRequestedAssets == xmpIndexSize) {
                    app.consoleout('Fetching paths from CQ: ' + host + URL_XMP_SEARCH + ' for ' + currentBatchSize + ' assets');
                    var json = fetchJSONObjectByPOST(host, credentials, URL_XMP_SEARCH, requestBody);
                    for(var i = 0; i < json.assets.length; i++) {
                        // parse asset properties
                        var asset = json.assets[i];
                        var documentId = asset['xmpMM:DocumentID'];
                        var instanceId = asset['xmpMM:InstanceID'];
                        var key = instanceId + '-' + documentId;
                        if(!(key in relinked)) {
                            var assetPath = asset.path;
                            // get image resource
                            var assetFileName = 'related-snippet-' + relinkedSize;
                            var assetFile = new File(snippetFolder.fullName + '/' + assetFileName);
                            app.consoleout('Fetching resource from CQ: ' + host + assetPath + ' to ' + assetFile);
                            fetchResource(host, credentials, assetPath, assetFile);
                            // relink images
                            try {
                                var itemLinks = xmpIndex[key].itemLinks;
                                for(var itemLinksIndex = 0; itemLinksIndex < itemLinks.length; itemLinksIndex++) {
                                    var itemLink = itemLinks[itemLinksIndex];
                                    itemLink.relink(assetFile);
                                }
                                relinked[key] = {
                                    fileName: assetFileName,
                                    path: assetPath,
                                    documentId: documentId,
                                    instanceId: instanceId
                                };
                                relinkedSize++;
                            } catch(e) {
                                app.consoleout('Can\'t embed asset ' + assetFile + ': ' + e);
                            }
                        }
                    }
                    // reset request body
                    requestBody = "";
                    currentBatchSize = 0;
                }
            }
            // write linked assets into JSON
            var relinkedFile = new File(snippetFolder.fullName + '/related-assets.json');
            if(!relinkedFile.open('w')) {
                app.consoleout('Can\'t write embedded assets into ' + relinkedFile.fullName);
            } else {
                app.consoleout('Write embedded assets into ' + relinkedFile.fullName);
                relinkedFile.encoding = 'TEXT';
                var relinkedJson = JSON.stringify(relinked);
                relinkedFile.write(relinkedJson);
                relinkedFile.close();
                var relinkedTarget = resourcePath.substring (0, resourcePath.lastIndexOf ('/'))
                app.consoleout('Upload embedded assets to ' + relinkedTarget);
                putResource(host, credentials, relinkedFile, 'related-assets.json', 'application/json', relinkedTarget);
            }
        } catch(e) {
            app.consoleout('Can\'t embed assets in snippet: ' + e);
        }
        // resize image
        var group = page.pageItems.everyItem();
        var bound = new Array;
        try {
            group = page.groups.add(group);
            var bound = group.geometricBounds;
        } catch(e) {
            var bound = group.visibleBounds[0];
        }
        var width = bound[3] - bound[1]
        var height = bound[2] - bound[0]
        doc.documentPreferences.pageWidth = width;
        doc.documentPreferences.pageHeight = height;
        group.move([0, 0]);

        doc.save(sourceFile);
        app.consoleout('New document created and Snippet placed...');
    }

    var target = resourcePath.substring (0, resourcePath.lastIndexOf ('/')) + "/renditions";

    var document = app.open(sourceFile);