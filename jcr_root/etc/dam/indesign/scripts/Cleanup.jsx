}
catch (err) {
    throw 'An error occurred during media extraction: ' + (err.message ? err.message : err);
}
finally {
    // close the document
    document.close(SaveOptions.no);

    //==== remove the original resource file ====
    sourceFile.remove();
    cleanup(sourceFolder);
    cleanup(exportFolder);
}