//==============================================================================
// HTTP get/post and some other helper methods
//==============================================================================


//==============================================================================
// Helper to encode/decode string to/from Base64
//==============================================================================
var Base64 = {
 
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
 
        input = Base64._utf8_encode(input);
 
        while (i < input.length) {
 
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
 
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
 
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
 
            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
        }
 
        return output;
    },
 
    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
 
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
        while (i < input.length) {
 
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
 
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
 
            output = output + String.fromCharCode(chr1);
 
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
 
        }
 
        output = Base64._utf8_decode(output);
 
        return output;
 
    },
 
    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
 
        for (var n = 0; n < string.length; n++) {
 
            var c = string.charCodeAt(n);
 
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
 
        }
 
        return utftext;
    },
 
    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
 
        while ( i < utftext.length ) {
 
            c = utftext.charCodeAt(i);
 
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
 
        }
 
        return string;
    }
 
}

//==============================================================================
// Fetch a JSON file from sling over http/basic auth by GET method
// param host - CQ host
// param credentials - Basic Base64 encoded credentials
// param resource - URI to fetch
//==============================================================================
function fetchJSONObjectByGET(host, credentials, resource) {
    connection = new Socket;
    var contextPath = "";
    if (host.indexOf('/')>0){
        var idx = host.indexOf('/');
        contextPath = host.substring (idx);
        host = host.substring (0,idx);
    }

    if (connection.open(host, 'UTF-8')) {
        var url = encodeURI(contextPath+resource);
        connection.write('GET ' + url + ' HTTP/1.0\n');
        connection.write('Authorization: Basic '+credentials + '\n');
        connection.write('\n');

        // skip header - Sling seems to always return proper headers
        // Works for now but needs to be improved
        var buffer = "";
        while (!connection.eof) {
            var ch = connection.read(1);
            if (ch.match("\n")) {
                if (buffer.length == 1) {
                    // start of message body
                    break;
                }
                buffer = "";
            } else {
                buffer = buffer + ch;
            }
        }
        connection.close();
        if(buffer === '') {
            throw 'No valid JSON response for host ' + host + ' and URL ' + url;
        }
        return JSON.parse(buffer);
    } else {
        throw 'Connection to host ' + host + ' could not be opened';
    }
}

//==============================================================================
// Do a sling post request
// param host - CQ host
// param credentials - Basic Base64 encoded credentials
// param resource - URI for post
// param params - request parameters
//==============================================================================
function postReqParams(host, credentials, resource, params) {
    connection = new Socket;
    var contextPath = "";
    if (host.indexOf('/')>0){
        var idx = host.indexOf('/');
        contextPath = host.substring (idx);
        host = host.substring (0,idx);
    }
    var body='';
    for (var property in params) {
        if (params.hasOwnProperty(property)) {
         body = body +Base64._utf8_encode(property) + '='+ params[property]+'&';
        }
    }

    body = body + Base64._utf8_encode('_charset_')+'=utf-8'
    if (connection.open(host, 'UTF-8')) {

        var url = encodeURI(contextPath+resource);
        connection.write('POST ' + url + ' HTTP/1.0\n');
        connection.write('Authorization: Basic '+credentials + '\n');
        connection.write('Content-Type: application/x-www-form-urlencoded\n');
        connection.write('Content-Length: ' + body.length + '\n');
        connection.write('\n');
        connection.write(body + '\n');

        // skip header - Sling seems to always return proper headers
        // Works for now but needs to be improved
        var buffer = "";
        while (!connection.eof) {
            var ch = connection.read(1);
            if (ch.match("\n")) {
                if (buffer.length == 1) {
                    // start of message body
                    break;
                }
                buffer = "";
            } else {
                buffer = buffer + ch;
            }
        }
        connection.close();
        app.consoleout("done");
        if(buffer === '') {
            throw 'No valid JSON response for host ' + host + ' and URL ' + url;
        }
        return JSON.parse(buffer);
    } else {
        throw 'Connection to host ' + host + ' could not be opened';
    }
}

//==============================================================================
// Fetch a JSON file from sling over http/basic auth by POST method
// param host - CQ host
// param credentials - Basic Base64 encoded credentials
// param resource - URI to fetch
// param body - POST body
//==============================================================================
function fetchJSONObjectByPOST(host, credentials, resource, body) {
    connection = new Socket;
    var contextPath = "";
    if (host.indexOf('/')>0){
        var idx = host.indexOf('/');
        contextPath = host.substring (idx);
        host = host.substring (0,idx);
    }

    if (connection.open(host, 'UTF-8')) {

        var url = encodeURI(contextPath+resource);
        connection.write('POST ' + url + ' HTTP/1.0\n');
        connection.write('Authorization: Basic '+credentials + '\n');
        connection.write('Content-Type: application/x-www-form-urlencoded\n');
        connection.write('Content-Length: ' + body.length + '\n');
        connection.write('\n');
        connection.write(body + '\n');

        // skip header - Sling seems to always return proper headers
        // Works for now but needs to be improved
        var buffer = "";
        while (!connection.eof) {
            var ch = connection.read(1);
            if (ch.match("\n")) {
                if (buffer.length == 1) {
                    // start of message body
                    break;
                }
                buffer = "";
            } else {
                buffer = buffer + ch;
            }
        }
        connection.close();
        if(buffer === '') {
            throw 'No valid JSON response for host ' + host + ' and URL ' + url;
        }
        return JSON.parse(buffer);
    } else {
        throw 'Connection to host ' + host + ' could not be opened';
    }
}

//==============================================================================
// Fetch a singe file from sling over http/basic auth
// param host - CQ host
// param credentials - Basic Base64 encoded credentials
// param resource - URI to fetch
// param file - Target file to be created with the data fetched from the server
//==============================================================================
function fetchResource(host, credentials, resource, file) {
    var success = file.open ("w");
    file.encoding = "BINARY";
    connection = new Socket;
    var contextPath = "";
    if (host.indexOf('/')>0){
        var idx = host.indexOf('/');
        contextPath = host.substring (idx);
        host = host.substring (0,idx);
    }


    if (connection.open (host, "binary")) {

        // very basic request to fetch a single resource
        connection.write ("GET "+ encodeURI(contextPath+resource) +" HTTP/1.0");
        connection.write ("\n");
        connection.write ("Authorization: Basic "+credentials);
        connection.write ("\n\n");

        // skip header - Sling seems to always return proper headers
        // Works for now but needs to be improved
        var buffer = "";
        while (!connection.eof) {
            var ch = connection.read(1);
            if (ch.match("\n")) {
                if (buffer.length == 1) {
                    // start of message body
                    break;
                }
                buffer = "";
            } else {
                buffer = buffer + ch;
            }
        }

        // write message body
        while (!connection.eof) {
            file.write(connection.read());
        }

        connection.close();
        if (file.error != "") {
            app.consoleout('Failed to open ' + file.error);
        }

        file.close();
    }
    else {
        file.close();
        throw 'Connection to host ' + host + ' could not be opened';
    }
}


//==============================================================================
// Put a singe file to sling over http/basic auth
// param host - CQ host
// param credentials - Basic Base64 encoded credentials
// param file - Source file to send
// param fileName - file name to be created on the server
// param contentType - optional, used if set.
// param target - uri where to put this file
// param requestParams - key/value pair of request parameters to be sent
//==============================================================================
function putResource(host, credentials, file, fileName, contentType, target, requestParams) {
    var contextPath = "";
    if (host.indexOf('/')>0){
        var idx = host.indexOf('/');
        contextPath = host.substring (idx);
        host = host.substring (0,idx);
    }
    var success = file.open ("r");
    file.encoding = "BINARY";
    var boundary = '----------V2ymHFg03ehbqgZCaKO6jy';
    connection = new Socket;
    if (connection.open (host, "binary")) {
        connection.write ("POST "+ encodeURI(contextPath+target) +" HTTP/1.0");
        connection.write ("\n");
        connection.write ("Authorization: Basic "+credentials);
        connection.write ("\n");
        connection.write ("User-Agent: Jakarta Commons-HttpClient/3.1");
        connection.write ("\n");
        connection.write ("Content-Type: multipart/form-data; boundary="+boundary);
        connection.write ("\n");
        var body = buildMultipartBody (boundary, file, fileName, contentType, requestParams);
        connection.write ("Content-Length: "+body.length);
        connection.write ("\r\n\r\n");
        //END of header
        connection.write (body);
        //Read responce before closing a connection
        // This is needed to make sure we do not return before sling writes the fine in to the repository.
        // write message body
        connection.read();
        while (!connection.eof) {
            connection.read();
        }
        connection.close();
    }
    else {
        file.close();
        throw 'Connection to host ' + host + ' could not be opened';
    }
}

function buildMultipartBody(boundary, file, fileName, contentType, requestParams) {
    var endBoundary = '\r\n--' + boundary + '--\r\n';
    var body;

    body = '--'+boundary+'\r\n';
    body = body + 'content-disposition: form-data; name="jcr:primaryType"';
    body = body + '\r\n\r\n';
    body = body + 'nt:unstructured';
    body = body + '\r\n';
    
	body = body + '--'+boundary+'\r\n';
            body = body + 'content-disposition: form-data; name="_charset_"';
            body = body + '\r\n\r\n';
            body = body + 'utf-8';
            body = body + '\r\n';
    
    // write other request parameters
    if (requestParams) {
        for (var key in requestParams) {
            body = body + '--'+boundary+'\r\n';
            body = body + 'content-disposition: form-data; name="'+ key +'"';
            body = body + '\r\n\r\n';
            body = body + requestParams[key];
            body = body + '\r\n';
        }
        //todo: FIX THIS: for now we just assume that its a request for a dam upload asset servlet
        body = body + '--'+boundary+'\r\n';
        body = body + 'content-disposition: form-data; name="file"; Filename="'+Base64._utf8_encode(fileName)+'"\r\n';
    } else {
        body = body + '--'+boundary+'\r\n';
        body = body + 'content-disposition: form-data; name="*"; Filename="'+Base64._utf8_encode(fileName)+'"\r\n';
    }

    if (contentType) {
        body = body + 'Content-Type: '+contentType+'\r\n';
    }
    // else, let sling determine the content type by file extension or body
    body = body + 'Content-Transfer-Encoding: binary\r\n';
    body = body + '\r\n';
    
    //write file contents
    var content;
    while ((content = file.read ()) != '') {
        body = body + content;
    }
    
    file.close();
    // todo: Sling doesnt seems to like it? or perhaps its a general error. 
    //body = body + '\r\n';

    body = body + endBoundary;
    return body;
}

//==============================================================================
// Put multiple files to sling over http/basic auth
// param host - CQ host
// param credentials - Basic Base64 encoded credentials
// param fileList - List of files to be sent
// param target - uri where to put this file
// param requestParams - key/value pair of request parameters to be sent
//==============================================================================
function putMultipleResource(host, credentials, fileList, target, requestParams) {
    
    var boundary = '----------V2ymHFg03ehbqgZCaKO6jy';
    connection = new Socket;
    var contextPath ='';
      if (host.indexOf('/')>0){
        var idx = host.indexOf('/');
        contextPath = host.substring (idx);
        host = host.substring (0,idx);
    }
    if (connection.open (host, "binary")) {
        connection.write ("POST "+ encodeURI(contextPath + target) +" HTTP/1.0");
        connection.write ("\n");
        connection.write ("Authorization: Basic "+credentials);
        connection.write ("\n");
        connection.write ("User-Agent: Jakarta Commons-HttpClient/3.1");
        connection.write ("\n");
        connection.write ("Content-Type: multipart/form-data; boundary="+boundary);
        connection.write ("\n");
        var body = buildMultiFileMultipartBody(boundary, fileList, requestParams);
        connection.write ("Content-Length: "+body.length);
        connection.write ("\r\n\r\n");
        //END of header
        connection.write (body);
        //Read responce before closing a connection
        // This is needed to make sure we do not return before sling writes the fine in to the repository.
        // write message body
        connection.read();
        while (!connection.eof) {
            connection.read();
        }
        connection.close();
    }
    else {
        throw 'Connection to host ' + host + ' could not be opened';
    }
    delete connection;
}

function buildMultiFileMultipartBody(boundary, fileList, requestParams) {
    var endBoundary = '\r\n--' + boundary + '--\r\n';
    var body;
    


    body = '--'+boundary+'\r\n';
    body = body + 'content-disposition: form-data; name="jcr:primaryType"';
    body = body + '\r\n\r\n';
    body = body + 'nt:unstructured';
    body = body + '\r\n';
    
    body = body + '--'+boundary+'\r\n';
            body = body + 'content-disposition: form-data; name="_charset_"';
            body = body + '\r\n\r\n';
            body = body + 'utf-8';
            body = body + '\r\n';
    
    // write other request parameters
    if (requestParams) {
        for (var key in requestParams) {
            body = body + '--'+boundary+'\r\n';
            body = body + 'content-disposition: form-data; name="'+ key +'"';
            body = body + '\r\n\r\n';
            body = body + requestParams[key];
            body = body + '\r\n';
        }
    }
    for (var i=0; i<fileList.length; i++) {
          body = body + '--'+boundary+'\r\n';
          body = body + 'content-disposition: form-data; name="*"; Filename="'+Base64._utf8_encode(fileList[i].fileName)+'"\r\n';
          body = body + 'Content-Transfer-Encoding: binary\r\n';
          body = body + '\r\n';

          var success = fileList[i].file.open ("r");
          fileList[i].file.encoding = "BINARY";
          //write file contents
          var content;
          while ((content = fileList[i].file.read ()) != '') {
              body = body + content;
          }
          body = body + '\r\n';
          fileList[i].file.close();
    }
    
    
    // todo: Sling doesnt seems to like it? or perhaps its a general error. 
    //body = body + '\r\n';

    body = body + endBoundary;
    return body;
}

function cleanup(folder) {
    var files = folder.getFiles();
    if (files.length <= 0) {
        folder.remove();
    } else {
        for (index in files) {
            if (files[index] instanceof Folder) {
                cleanup(files[index]);
            } else {
                var file = new File(files[index].fullName);
                file.remove();
            }
        }
        folder.remove();
    }
}

function collectSubAssets(folder, subAssets) {

    var files = folder.getFiles();
    for (index in files) {
        if (files[index] instanceof Folder) {
            collectSubAssets(files[index], subAssets);
        } else {
            var outputFile = new File(files[index].fullName);

            // Avoid using fileName from the File Object as it got mashed up in the File Object due to default encoding.
            var fileName = files[index].fullName.substring(files[index].fullName.lastIndexOf ('/')+1);

            var ext = fileName.substring(fileName.lastIndexOf('.') +1);
            var ignorePattern = new RegExp('^related-snippet-');
            if (ext != 'html' && !ignorePattern.test(fileName)) {
                var subAsset = new Object();
                subAsset.fileName = fileName;
                subAsset.file = outputFile;
                subAssets.push(subAsset);
            }
        }
    }
}
