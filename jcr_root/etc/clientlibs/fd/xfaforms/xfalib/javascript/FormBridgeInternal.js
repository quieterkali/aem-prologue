/**
 * This should house all the internal APIs added tp FormBridge
 * Created by sasdutta on 12/23/2014.
 */

(function ($, _, formBridge) {
    formBridge.internal = {

        /**
         * Get SOM expressions of all the fields in the form, including master page fields
         *
         * @return {Array} of som expressions as strings.
         */
        getAllFieldsSom: function () {
            var fieldsSom = [];
            function getAllFieldsSomVisitor(target) {
                if (target instanceof xfalib.script.Field) {
                    fieldsSom.push(target.somExpression);
                }
            }

            formBridge._xfa.form._getRootSubform()._visitAllmoChildren(getAllFieldsSomVisitor);
            return fieldsSom;
        },

        /**
         * @param pageNum {int} scroll to specified pg no if available
         * @returns nothing
         * @private
         */
        scrollToPage: function (pageNum) {
            if (pageNum > 0 && pageNum <= formBridge.pagingManager().pageCount()) {
                formBridge.pagingManager()._makePage(pageNum);

                var $targetPg = $("#lcforms_xfaform_container .page").eq(pageNum - 1); // zero based index in JQ

                setTimeout(function () {
                    $(window).scrollTop($targetPg.offset().top); // newly added pages need time to render
                });
            }
        },

        resolveNode: function (somExpression) {
            return formBridge._xfa.resolveNode(somExpression);
        },

        pageCount: function () {
            return formBridge.pagingManager().pageCount();
        },

        page: function (fieldNode) {
            return formBridge._xfa.$layout.page(fieldNode);
        },

        normalizeSom: function (som) {
            // adding index and prefix to the som expression as obtained from designer
            if(!_.isString(som)) {
                return null;
            }
            som = som.replace(/\s/g, '');
            var xfaPrefix = "xfa[0].form[0].",
                normalizedSom = (som + ".").replace(/(\])?\./g, function ($0, $1) { return $1 ? $0 : '[0].'; }).slice(0, -1);

            if(normalizedSom.slice(0,xfaPrefix.length) !== xfaPrefix) {
                normalizedSom = xfaPrefix + normalizedSom;
            }
            return normalizedSom;
        }
    };
}($, _, window.formBridge));
