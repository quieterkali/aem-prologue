function CQ_dam_addMultivalue(name, namespace, localPart, rows, width) {
    var wrapper = document.getElementById(namespace + "_" + localPart + "_rightcol");
    var fieldWrapper = document.createElement("div");
    var index = new Date().getTime();
    fieldWrapper.id = namespace + "_" + localPart + "_" + index + "_wrapper";
    fieldWrapper.className = "form_rightcol_wrapper";


    var field;
    if (rows == 1) {
        field = document.createElement("input");
        field.className = "text mv";
    }
    else {
        field = document.createElement("textarea");
        field.className = "mv";
        field.rows = rows;
    }
    field.name = name;
    if (width) field.style.width = width;

    var icon = document.createElement("span");
    icon.className = "mv_remove";
    icon.onclick = function() {
        CQ_dam_removeMultivalue(namespace, localPart, index);
    };
    icon.innerHTML = "&nbsp;[&ndash;]";

    fieldWrapper.appendChild(field);
    fieldWrapper.appendChild(icon);
    wrapper.appendChild(fieldWrapper);
}

/**
 * Remove a field from a multivalue text field
 * @param namespace
 * @param localPart
 * @param index
 */
function CQ_dam_removeMultivalue(namespace, localPart, index) {
    var wrapper = document.getElementById(namespace + "_" + localPart + "_rightcol");
    var fieldWrapper = document.getElementById(namespace + "_" + localPart + "_" + index + "_wrapper");
    wrapper.removeChild(fieldWrapper);
}
