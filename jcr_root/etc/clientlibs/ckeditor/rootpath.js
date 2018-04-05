// the following MUST BE SET BEFORE ckeditor.js is loaded
// otherwise Sling's '/content/...' root path will be used
var CKEDITOR_BASEPATH = '/etc/clientlibs/ckeditor/';
var contextPath = CQ.shared.HTTP.getContextPath();

if (contextPath !== null && contextPath.length > 0) {
    CKEDITOR_BASEPATH = contextPath + CKEDITOR_BASEPATH;
}
