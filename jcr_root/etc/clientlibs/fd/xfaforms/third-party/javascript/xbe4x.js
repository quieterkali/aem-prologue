/**
 *    xbe4x is javascript implementation of the original ECMAScript for XML (E4X)
 *    Specification (ECMA-357) December 2005. This implementation is designed to emulate
 *    the implementation that is used in SpiderMonkey (Mozilla's JavaScript(TM) Engine)
 *    and therefore Firefox, Thunderbird, and most other Gecko based applications.
 *    Because the Mozilla implementation leaves out certain features of the
 *    specification, so does xbe4x. Please read the README file for a further
 *    explanation of these issues.
 *
 *
 *    @author Sam Shull <http://samshull.blogspot.com/>
 *    @version 0.1
 *
 *    @copyright Copyright (c) 2009 Sam Shull <http://samshull.blogspot.com/>
 *    @license <http://www.opensource.org/licenses/mit-license.html>
 *
 *    Permission is hereby granted, free of charge, to any person obtaining a copy
 *    of this software and associated documentation files (the "Software"), to deal
 *    in the Software without restriction, including without limitation the rights
 *    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *    copies of the Software, and to permit persons to whom the Software is
 *    furnished to do so, subject to the following conditions:
 *
 *    The above copyright notice and this permission notice shall be included in
 *    all copies or substantial portions of the Software.
 *
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *    THE SOFTWARE.
 *
 *
 *    CHANGES:
 */

//this doesn't load if window.XML is already defined
if (!this.XML)
{
    (function ()
    {
        /*
         *
         *
         */
        var undefined, p,
            window                       = this,
            dns                          = [],
            defaultNamespace             = "",
            ELEMENT_NODE                 = 1,
            ATTRIBUTE_NODE               = 2,
            TEXT_NODE                    = 3,
            CDATA_SECTION_NODE           = 4,
            ENTITY_REFERENCE_NODE        = 5,
            ENTITY_NODE                  = 6,
            PROCESSING_INSTRUCTION_NODE  = 7,
            COMMENT_NODE                 = 8,
            DOCUMENT_NODE                = 9,
            DOCUMENT_TYPE_NODE           = 10,
            DOCUMENT_FRAGMENT_NODE       = 11,
            NOTATION_NODE                = 12,
            isNSDef                      = /^xmlns:([\w\-]+)/i,
            toString                     = ({}).toString,
            propertyIsEnumerable         = ({}).propertyIsEnumerable,
            hasOwnProperty               = ({}).hasOwnProperty,
            defaultXMLProperties         = ",prototype,ignoreComments,ignoreProcessingInstructions,ignoreWhitespace," +
                "prettyPrinting,prettyIndent,settings,defaultSettings,setSettings,settings," +
                "propertyIsEnumerable,hasOwnProperty,_setDefaultNamespace,",
            defaultXMLPrototype          = ",_Class,_Name,_Parent,_Value,_InScopeNamespaces,_Attributes,_Children,_Node",
            defaultXMLListPrototype      = ",_Class,_Value,_Children,_TargetObject,_TargetProperty",
            xmlDoc                       = parse("<x/>"),
            piName                       = /^[\w\-]+\s*/,
            XSLT_NS                      = "http://www.w3.org/1999/XSL/Transform";

        /**
         *
         *
         *    @param String | XML $string
         *    @returns XML
         *    @throws SyntaxError
         */
        function XML ($string)
        {
            if (!(this instanceof XML))
            {
                return ToXML($string);
            }

            var x, i, l;

            this._Class = "text";

            this._Name = null;

            this._Value = null;

            this._Parent = null;

            this._InScopeNamespaces = {};

            this._DefaultNamespace = null;

            this._Attributes = {};

            this._Children = [];

            this[0] = this;

            /**
             *
             *
             *
             */
            switch (typeof($string))
            {
                case "undefined":
                case "null":
                    break;
                case "number":
                case "boolean":    $string = ToString($string);
                case "string":

                    x = ToXML(trim($string));
                    if (x)
                    {
                        if (x.length() ===1)
                        {
                            this._Class = x._Class;
                            this._Name = x._Name;
                            this._Value = x._Value;
                            this._InScopeNamespaces = x._InScopeNamespaces;
                            this._DefaultNamespace = x._DefaultNamespace;
                            this._Attributes = x._Attributes;

                            for (i = 0, l = x._Children.length; i < l; ++i)
                            {
                                this._Children[i] = x._Children[i];
                                this._Children[i]._Parent = this;
                            }

                            break;
                        }
                    }

                    throw new SyntaxError();
                    break;
                default:
                    if ($string instanceof XML)
                    {
                        if ($string.length() ===1)
                        {
                            x = $string;
                            this._Class = x._Class;
                            this._Name = x._Name;
                            this._Value = x._Value;
                            this._InScopeNamespaces = x._InScopeNamespaces;
                            this._DefaultNamespace = x._DefaultNamespace;
                            this._Attributes = x._Attributes;

                            for (i = 0, l = x._Children.length; i < l; ++i)
                            {
                                this._Children[i] = x._Children[i];
                                this._Children[i]._Parent = this;
                            }
                        }
                    }
                    break;
            }
        }

        /**
         *    Ignore XML comments. (Default: true.)
         *
         *    @static
         *    @param Namespace ns
         *    @returns void
         */
        XML.setDefaultNamespace = function (ns)
        {
            dns.unshift(defaultNamespace || "");
            defaultNamespace = Namespace(ns);
            return null;
        };

        /**
         *  Use this function to restore the default namespace
         *  to the previous namespace
         *
         */
        XML.restoreDefaultNamespace = function ()
        {
            defaultNamespace = dns.shift() || "";
            return null;
        };

        /**
         *
         *
         *
         */
        XML.load = function (pathToFile, onload)
        {
            var xhr = !!window.ActiveXObject && window.ActiveXObject("Microsoft.XMLHTTP") || new XMLHttpRequest(),
                async = ({}).toString.call(onload || {}) == "[object Function]";

            xhr.open("GET", pathToFile, async);

            if (async)
            {
                if (!!xhr.addEventListener)
                {
                    xhr.addEventListener("load", loaded, false);
                }
                else
                {
                    xhr.onreadystatechange = function ()
                    {
                        if (xhr.readyState == 4 && xhr.status == 200)
                        {
                            loaded();
                        }
                    };
                }
            }

            xhr.send(null);

            return async ? xhr : loaded(1);

            function loaded (ret)
            {
                var x = new XML((xhr.responseText||"").replace(/\s*<\?xml.*?\?>/,""));
                return ret ? x : onload(x);
            }
        };

        /**
         *    Ignore XML comments. (Default: true.)
         *
         *    @static
         *    @var Boolean
         */
        XML.ignoreComments = true;

        /**
         *    Ignore XML processing instructions. (Default: true.)
         *
         *    @static
         *    @var Boolean
         */
        XML.ignoreProcessingInstructions = true;

        /**
         *    Ignore whitespace. (Default: true.)
         *
         *    @static
         *    @var Boolean
         */
        XML.ignoreWhitespace = true;

        /**
         *    Pretty-print XML output with toXMLString() etc. (Default: true.)
         *
         *    @static
         *    @var Boolean
         */
        XML.prettyPrinting = true;

        /**
         *    Pretty indent level for child nodes. (Default: 2.)
         *
         *    @static
         *    @var Number
         */
        XML.prettyIndent = 2;

        //There are also three methods to more easily apply and restore settings for use, say, within a function.

        /**
         *    Get an Object containing the above settings.
         *
         *    @static
         *    @returns Object
         */
        XML.settings = function ()
        {
            return {
                ignoreComments:                 XML.ignoreComments,
                ignoreProcessingInstructions:   XML.ignoreProcessingInstructions,
                ignoreWhitespace:               XML.ignoreWhitespace,
                prettyPrinting:                 XML.prettyPrinting,
                prettyIndent:                   XML.prettyIndent
            };
        };

        /**
         *    Get an object containing the default settings.
         *
         *    @static
         *    @returns Object
         */
        XML.defaultSettings = function ()
        {
            return {
                ignoreComments:                 true,
                ignoreProcessingInstructions:   true,
                ignoreWhitespace:               true,
                prettyPrinting:                 true,
                prettyIndent:                   2
            };
        };

        /**
         *    Set XML settings from, e.g., an object returned by XML.settings().
         *
         *
         *    @static
         *    @param Object settings
         *    @returns void
         */
        XML.setSettings = function (settings)
        {
            var p;
            settings = settings || XML.settings();
            for (p in settings)
            {
                switch (p)
                {
                    case "ignoreComments":                   XML.ignoreComments = !!settings[p];
                    case "ignoreProcessingInstructions":     XML.ignoreProcessingInstructions = !!settings[p];
                    case "ignoreWhitespace":                 XML.ignoreWhitespace = !!settings[p];
                    case "prettyPrinting":                   XML.prettyPrinting = !!settings[p];
                    case "prettyIndent":                     XML.prettyIndent = parseInt(settings[p]) || 0;
                }
            }
            return null;
        };

        /**
         *
         *
         *    @static
         *    @param String name
         *    @returns Boolean
         */
        XML.hasOwnProperty = function (name)
        {
            return defaultXMLProperties.indexOf("," + name + ",") ===-1
                && hasOwnProperty.call(XML, name);
        };

        /**
         *
         *
         *    @static
         *    @param String name
         *    @returns Boolean
         */
        XML.propertyIsEnumerable = function (name)
        {
            return name !== "prototype"
                && name in XML
                && toString.call(XML[name]) != "[object Function]"
                && propertyIsEnumerable.call(XML, name);
        };

        /**
         *
         *
         *    @static
         *    @returns String
         */
        XML.toString = function ()
        {
            return "function XML() {\n [native code] \n}";
        };

        /**
         *
         *
         *    @param String | Namespace namespace
         *    @returns XML
         */
        XML.prototype.addNamespace = function (namespace)
        {
            AddInScopeNamespace.call(this, Namespace(namespace));
            return this;
        };

        /**
         *
         *
         *    @param String child
         *    @returns XML
         */
        XML.prototype.appendChild = function (child,isChildElement)
        {
            isChildElement = isChildElement !== undefined ? isChildElement : false;
            var children = Get.call(this, "*");
            children.Put(children.length(), child,isChildElement);
            return this;
        };

        /**
         *
         *
         *    @param String | AttributeName | QName attributeName
         *    @returns XML
         */
        XML.prototype.attribute = function (attributeName)
        {
            return Get.call(this, ToAttributeName(attributeName), true);
        };

        /**
         *
         *
         *    @returns XMLList
         */
        XML.prototype.attributes = function ()
        {
            return Get.call(this, ToAttributeName("*"));
        };

        /**
         *
         *
         *    @param String propertyName
         *    @returns XMLList
         */
        XML.prototype.child = function (propertyName)
        {
            var temporary;

            if (parseInt(propertyName)+"" == propertyName)
            {
                temporary = Get.call(this, "*");
                temporary = GetList.call(temporary, propertyName);
                return temporary || new XMLList();
            }

            temporary = ToXMLList( Get.call(this, propertyName) );

            return temporary;
        };

        /**
         *
         *
         *    @returns Number
         */
        XML.prototype.childIndex = function ()
        {
            var parent = this._Parent, q, l;

            if (!parent || this._Class === "attribute")
            {
                return -1;
            }

            for (q = 0, l = parent._Children.length; q < l; ++q)
            {
                if (parent._Children[q] === this)
                {
                    return q;
                }
            }

            return -1;
        };

        /**
         *
         *
         *    @returns XMLList
         */
        XML.prototype.children = function ()
        {
            return Get.call(this, "*");
        };

        /**
         *
         *
         *    @returns XMLList
         */
        XML.prototype.comments = function ()
        {
            var list = new XMLList(), i = 0, l = this._Children.length;
            list._TargetObject = this;
            list._TargetProperty = null;

            for (; i < l; ++i)
            {
                if (this._Children[i]._Class === "comment")
                {
                    list.Append(this._Children[i]);
                }
            }

            return list;
        };

        /**
         *
         *
         *    @param XML value
         *    @returns Boolean
         */
        XML.prototype.contains = function (value)
        {
            return this == value;
        };

        /**
         *
         *
         *    @returns XML
         */
        XML.prototype.copy = function ()
        {
            return DeepCopy.call(this);
        };

        /**
         *
         *
         *    @param String | QName name
         *    @returns XMLList
         */
        XML.prototype.descendants = function (name)
        {
            return Descendants.call(this, name || "*");
        };

        /**
         *
         *
         *    @param String | QName | AttributeName name
         *    @returns XMLList
         */
        XML.prototype.elements = function (name)
        {
            name = ToXMLName(name || "*");
            var list = new XMLList(), i = 0, l = this._Children.length;
            list._TargetObject = this;
            list._TargetProperty = name;

            for (; i < l; ++i)
            {
                if (
                    this._Children[i]._Class === "element"
                        && (name.localName === "*" || name.localName === this._Children[i]._Name.localName)
                        && (name.uri == null || name.uri === this._Children[i]._Name.uri)
                    )
                {
                    list.Append(this._Children[i]);
                }
            }

            return list;
        };

        /**
         *
         *
         *    @param String name
         *    @returns Boolean
         */
        XML.prototype.hasOwnProperty = function (name)
        {
            return HasProperty.call(this, name) || (defaultXMLPrototype.indexOf("," + name +",") === -1 && hasOwnProperty.call(this, name));
        };

        /**
         *
         *
         *    @returns Boolean
         */
        XML.prototype.hasComplexContent = function ()
        {
            if ((",attribute,comment,processing-instruction,text,").indexOf("," + this._Class + ",") > -1)
            {
                return false;
            }

            for (var i = 0, l = this._Children.length; i < l; ++i)
            {
                if (this._Children[i]._Class === "element")
                {
                    return true;
                }
            }

            return false;
        };

        /**
         *
         *
         *    @returns Boolean
         */
        XML.prototype.hasSimpleContent = function ()
        {
            if ((",comment,processing-instruction,").indexOf("," + this._Class + ",") > -1)
            {
                return false;
            }

            for (var i = 0, l = this._Children.length; i < l; ++i)
            {
                if (this._Children[i]._Class === "element")
                {
                    return false;
                }
            }

            return true;
        };

        /**
         *
         *
         *    @returns Array
         */
        XML.prototype.inScopeNamespaces = function ()
        {
            var y = this, inScopeNS = {}, p, a = [];

            while (y)
            {
                for (p in y._InScopeNamespaces)
                {
                    if (!inScopeNS[p])
                    {
                        inScopeNS[p] = y._InScopeNamespaces[p];
                    }
                }

                y = y.parent();
            }

            if (this._DefaultNamespace)
            {
                inScopeNS[""] = this._DefaultNamespace;
            }

            for (p in inScopeNS)
            {
                a[a.length] = inScopeNS[p];
            }

            return a;
        };

        /**
         *
         *
         *    @param XML child1
         *    @param XML child2
         *    @returns XML | null
         */
        XML.prototype.insertChildAfter = function (child1, child2)
        {
            if ((",attribute,comment,processing-instruction,text,").indexOf("," + this._Class + ",") > -1)
            {
                return null;
            }

            /*
             //this is disabled, because it doesn't work in
             //Firefox according to the spec
             if (!child2)
             {
             Insert.call(this, 0, child1);
             return this;
             }
             else if (!child1)
             {
             Insert.call(this, 0, child2);
             return this;
             }
             else
             */

            if (!child1){
                Insert.call(this, 0, child2);
                return this;
            }
            if (!child2){
                Insert.call(this, 0, child1);
                return this;
            }

            if (child1 instanceof XML)
            {
                Insert.call(this, child1.childIndex() + 1, child2);
                return this;
            }

            return null;
        };

        /**
         *
         *
         *
         *    @param XML child1
         *    @param XML child2
         *    @returns XML | null
         */
        XML.prototype.insertChildBefore = function (child1, child2)
        {
            if ((",attribute,comment,processing-instruction,text,").indexOf("," + this._Class + ",") > -1)
            {
                return null;
            }

            /*
             //this is disabled, because it doesn't work in
             //Firefox according to the spec
             if (!child1)
             {
             Insert.call(this, this._Children.length, child2);
             return this;
             }
             else if (!child2)
             {
             Insert.call(this, this._Children.length, child1);
             return this;
             }
             else
             */

            if (child1 instanceof XML)
            {
                Insert.call(this, child1.childIndex(), child2);
                return this;
            }

            return null;
        };

        /**
         *
         *
         *    @returns Number
         */
        XML.prototype.length = function ()
        {
            return 1;
        };

        /**
         *
         *
         *    @returns String | null
         */
        XML.prototype.localName = function ()
        {
            return this._Name === null ? null : this._Name.localName;
        };

        /**
         *
         *
         *    return QName
         */
        XML.prototype.name = function ()
        {
            return this._Name;
        };

        /**
         *
         *
         *    @param String prefix
         *    @returns Namespace
         */
        XML.prototype.namespace = function (prefix)
        {
            var y = this, inScopeNS = {}, p;

            while (y)
            {
                for (p in y._InScopeNamespaces)
                {
                    if (!inScopeNS[p])
                    {
                        inScopeNS[p] = y._InScopeNamespaces[p];
                    }
                }

                y = y.parent();
            }

            if (prefix === undefined)
            {
                if ((",comment,processing-instruction,text,").indexOf("," + this._Class + ",") > -1)
                {
                    return null;
                }

                return GetNamespace(this._Name, inScopeNS);
            }

            prefix = ToString(prefix);

            for (p in inScopeNS)
            {
                if (inScopeNS[p].prefix === prefix)
                {
                    return inScopeNS[p];
                }
            }

            return null;
        };

        /**
         *
         *
         *    @returns Array
         */
        XML.prototype.namespaceDeclarations = function ()
        {
            if ((",attribute,comment,processing-instruction,text,").indexOf("," + this._Class + ",") > -1)
            {
                return [];
            }

            var a = [], y = this._Parent, ancestorNS = {}, p;

            while (y)
            {
                for (p in y._InScopeNamespaces)
                {
                    if (!ancestorNS[p])
                    {
                        ancestorNS[p] = y._InScopeNamespaces[p];
                    }
                }

                y = y._Parent;
            }

            for (p in this._InScopeNamespaces)
            {
                if (p != "" && (!ancestorNS[p] || ancestorNS[p].uri != this._InScopeNamespaces[p]))
                {
                    a[a.length] = this._InScopeNamespaces[p];
                }
                else if(p === "" && !this._Parent)
                {
                    a[a.length] = this._InScopeNamespaces[p];
                }
            }

            return a;
        };

        /**
         *
         *
         *    @returns String
         */
        XML.prototype.nodeKind = function ()
        {
            return this._Class;
        };

        /**
         *
         *
         *    @returns XML
         */
        XML.prototype.normalize = function ()
        {
            for (var i = 0, l = this._Children.length; i < l;)
            {
                if (this._Children[i]._Class === "element")
                {
                    this._Children[i].normalize();
                    ++i;
                }
                else if (this._Children[i]._Class === "text")
                {
                    while (i+1 < this._Children.length && this._Children[i+1]._Class === "text")
                    {
                        this._Children[i]._Value = (this._Children[i]._Value || "") + (this._Children[i+1]._Value || "");
                        DeleteByIndex.call(this, i+1);
                    }

                    if (this._Children[i]._Value.length === 0)
                    {
                        DeleteByIndex.call(this, i);
                    }
                    else
                    {
                        ++i;
                    }
                }
                else
                {
                    ++i;
                }
            }

            return this;
        };

        /**
         *
         *
         *    @returns XML | null
         */
        XML.prototype.parent = function ()
        {
            return this._Parent;
        };

        /**
         *
         *
         *    @param String name
         *    @returns XMLList
         */
        XML.prototype.processingInstructions = function (name)
        {
            name = ToXMLName(name || "*");

            var list = new XMLList(), i = 0, l = this._Children.length;
            list._TargetObject = this;
            list._TargetProperty = null;

            for (; i < l; ++i)
            {
                if (this._Children[i]._Class === "processing-instruction"
                    && (name.localName === "*" || name.localName === this._Children[i]._Name.localName)
                    )
                {
                    list.Append(this._Children[i]);
                }
            }

            return list;
        };

        /**
         *
         *
         *    @param XML value
         *    @returns XML
         */
        XML.prototype.prependChild = function (value)
        {
            Insert.call(this, 0, value);
            return this;
        };


        XML.prototype.findFirstElement = function (value)
        {
            var list = [];
            list = this.elements(value)._Children;
            if(list.length == 0){
                var children = this.children();
                var xml;
                for(var i=0;i<children.length();i++){
                    xml = children[i];
                    var sublist = xml.findFirstElement(value);
                    if(sublist.length>0)
                        return sublist;
                }
            }
            return list;
        };


        /**
         *
         *
         *    @param String name
         *    @returns Boolean
         */
        XML.prototype.propertyIsEnumerable = function (name)
        {
            return name == "0";
        };

        /**
         *
         *
         *    @param Namespace | String namespace
         *    @returns XML
         */
        XML.prototype.removeNamespace = function (namespace)
        {
            if ((",attribute,comment,processing-instruction,text,").indexOf("," + this._Class + ",") > -1)
            {
                return this;
            }

            var ns = Namespace(namespace), thisNS = GetNamespace(this._Name, this._InScopeNamespaces), p, l;

            if (thisNS == ns)
            {
                return this;
            }

            /*
             //firefox does not remove the references to the
             //namespaces in attributes -- so we wont either
             for (p in this._Attributes)
             {
             if (GetNamespace(this._Attributes[p]._Name, this._InScopeNamespaces).uri == ns.uri)
             {
             this._Attributes[p]._Name = new QName(ns, this._Attributes[p].localName());
             }
             }
             //*/

            if (ns.prefix == undefined)
            {
                for (p in this._InScopeNamespaces)
                {
                    if (this._InScopeNamespaces[p].uri === ns.uri)
                    {
                        try{
                            this._InScopeNamespaces[p] = null;
                            delete this._InScopeNamespaces[p];
                        }catch(e){}
                    }
                }
            }
            else if (this._InScopeNamespaces[ns.prefix] && this._InScopeNamespaces[ns.prefix].uri === ns.uri)
            {
                try{
                    this._InScopeNamespaces[ns.prefix] = null;
                    delete this._InScopeNamespaces[ns.prefix];
                }catch(e){}
            }

            for (p = 0, l = this._Children.length; p < l; ++p)
            {
                if (this._Children[p]._Class === "element")
                {
                    this._Children[p].removeNamespace(ns);
                }
            }

            return this;
        };

        /**
         *
         *
         *    @param String propertyName
         *    @param XML value
         *    @returns XML
         */
        XML.prototype.replace = function (propertyName, value)
        {
            if ((",attribute,comment,processing-instruction,text,").indexOf("," + this._Class + ",") > -1)
            {
                return this;
            }

            var c = value instanceof XML ? DeepCopy.call(value) : ToString(value), n, i, k;

            if (parseInt(propertyName)+"" == propertyName)
            {
                Replace.call(this, propertyName, c);
                return this;
            }

            /*
             Basically Firefox does not appear to follow the rules set forth in the spec
             so, we are just going to fix this so that we do what firefox does
             if the propertyName is not an integer:
             if value is a XMLList setChildren
             otherwise do nothing
             */

            if (c instanceof XMLList)
            {
                this.setChildren(c);
            }

            return this;

            /*
             Leave the rest of these rules in place, just in case
             */

            n = QName(propertyName);
            k = this._Children.length;

            while (--k > -1)
            {
                if (
                    (n.localName === "*" || (this._Children[k]._Class === "element" && this._Children[k]._Name.localName===n.localName))
                        && (n.uri == null || (this._Children[k]._Class === "element" && n.uri === this._Children[k]._Name.uri ))
                    )
                {
                    if (i !== undefined)
                    {
                        DeleteByIndex.call(this, i);
                    }

                    i = k;
                }
            }

            if (i !== undefined)
            {
                Replace.call(this, i, c);
            }

            return this;
        };

        /**
         *
         *
         *    @param XML value
         *    @returns XML
         */
        XML.prototype.setChildren = function (value)
        {
            this.Put("*", value);
            return this;
        };

        /**
         *
         *
         *    @param String name
         *    @returns void
         */
        XML.prototype.setLocalName = function (name)
        {
            if ((",comment,text,").indexOf("," + this._Class + ",") > -1)
            {
                return null;
            }

            this._Name.localName = name instanceof QName ? name.localName : ToString(name);
        };

        /**
         *
         *
         *    @param QName | String name
         *    @returns null
         */
        XML.prototype.setName = function (name)
        {
            if ((",comment,text,").indexOf("," + this._Class + ",") > -1)
            {
                return null;
            }

            if (name instanceof QName && name.uri == null)
            {
                name = name.localName;
            }

            var n = QName(name);

            if (this._Class === "processing-instruction")
            {
                n.uri = "";
            }

            this._DefaultNamespace = new Namespace(n.prefix, n.uri);

            this._Name = n;

            if (this._Class === "attribute")
            {
                if (this._Parent)
                {
                    AddInScopeNamespace.call(this._Parent, this._DefaultNamespace);
                }
            }
            else if (this._Class === "element")
            {
                AddInScopeNamespace.call(this, this._DefaultNamespace);
            }
            else if ((",comment,text,processing-instruction,").indexOf("," + this._Class + ",") > -1)
            {
                return null;
            }

            this._Name = new QName(this._DefaultNamespace, this._Name.localName);

            return null;
        };

        /**
         *
         *
         *    @param Namespace | String ns
         *    @returns null
         */
        XML.prototype.setNamespace = function (ns)
        {
            //processing-instruction,
            if ((",comment,text,").indexOf("," + this._Class + ",") > -1)
            {
                return null;
            }

            this._DefaultNamespace = Namespace(ns);

            this._Name = new QName(this._DefaultNamespace, this._Name.localName);

            if (this._Class === "attribute")
            {
                if (this._Parent)
                {
                    AddInScopeNamespace.call(this._Parent, this._DefaultNamespace);
                }
            }
            else if (this._Class === "element")
            {
                AddInScopeNamespace.call(this, this._DefaultNamespace);
            }

            return null;
        };

        /**
         *
         *
         *    @returns XMLList
         */
        XML.prototype.text = function ()
        {
            var list = new XMLList(), i = 0, l = this._Children.length;
            list._TargetObject = this;
            list._TargetProperty = null;

            for (; i < l; ++i)
            {
                if (this._Children[i]._Class === "text")
                {
                    list.Append(this._Children[i]);
                }
            }

            return list;
        };

        /**
         *
         *
         *    @returns String
         */
        XML.prototype.toString = function ()
        {
            return ToString(this);
        };

        /**
         *
         *
         *    @returns String
         */
        XML.prototype.toXMLString = function ()
        {
            return ToXMLString(this);
        };

        /**
         *
         *
         *    @returns XML
         */
        XML.prototype.valueOf = function ()
        {
            return this;
        };

        /**
         *
         *
         *
         *    @access private
         *    @param String | QName PropertyName
         *    @param XML | String Value
         *    @returns null
         *    @throws TypeError
         */
        XML.prototype.Put = function (PropertyName, Value)
        {
            if (parseInt(PropertyName)+"" == PropertyName)
            {
                throw new TypeError();
            }

            if ((",text,comment,processing-instruction,attribute,").indexOf("," + this._Class + ",") > -1)
            {
                return null;
            }

            var c = (!(Value instanceof XML) || (",text,attribute,").indexOf("," + Value._Class+",") > -1)
                    ? ToString(Value)
                    : DeepCopy.call(Value),
                n = ToXMLName(PropertyName),
                s, i, l, a = null, primitiveAssign, k;

            if (n instanceof AttributeName)
            {
                if (!isXMLName(n._Name))
                {
                    return false;
                }

                if (c instanceof XMLList)
                {
                    if (c._Children.length === 0)
                    {
                        c = "";
                    }
                    else
                    {
                        s = ToString(c[0]);

                        for (i = 1, l = c._Children.length; i < l; ++i)
                        {
                            s += " " + ToString(c[i]);
                        }

                        c = s;
                    }
                }
                else
                {
                    c = ToString(c);
                }

                for (i in this._Attributes)
                {
                    if (
                        (n._Name.localName === this._Attributes[i]._Name.localName)
                            && (n._Name.uri === null || n._Name.uri === this._Attributes[i]._Name.uri)
                        )
                    {
                        if (a == null)
                        {
                            a = this._Attributes[i];
                        }
                        else
                        {
                            this.Delete(this._Attributes[i]._Name);
                        }
                    }
                }

                if (a == null)
                {
                    a = new XML();
                    a._Parent = this;
                    a._Class = "attribute";
                    a._Name = n._Name.uri == null
                        ? new QName(new Namespace(), n._Name)
                        : new QName(new Namespace(n._Name.uri), n._Name.localName);

                    this._Attributes[(a._Name._Prefix ? a._Name._Prefix + ":" : "") + a._Name.localName] = a;

                    AddInScopeNamespace.call(this, GetNamespace(a._Name));
                }

                a._Value = c;

                return null;
            }

            if (!isXMLName(n) && n.localName != "*")
            {
                return null;
            }

            i = undefined;

            primitiveAssign = !(c instanceof XML) && n.localName != "*";

            for (k = 0, l = this._Children.length; k < l; ++k)
            {
                if (
                    (n.localName === "*" || (this._Children[k]._Class === "element" && this._Children[k]._Name.localName===n.localName))
                        &&
                        (n.uri == null || (this._Children[k]._Class === "element" && n.uri === this._Children[k]._Name.uri))
                    )
                {
                    if (i != undefined)
                    {
                        DeleteByIndex.call(this, ToString(i));
                    }
                    else
                    {
                        i = k;
                    }
                }
            }

            if (i == undefined)
            {
                i = this._Children.length;

                if (primitiveAssign)
                {
                    a = new XML();
                    a._Class = "element";
                    a._Parent = this;
                    a._Name = n.uri == null
                        ? new QName(GetDefaultNamespace(), n)
                        : new QName(n);

                    Replace.call(this, ToString(i), a);

                    AddInScopeNamespace.call(a, GetNamespace(a._Name));
                }
            }

            if (primitiveAssign)
            {
                s = ToString(c);

                if (s != "")
                {
                    Replace.call(this._Children[i], "0", s);
                }
            }
            else
            {
                Replace.call(this, ToString(i), c);
            }

            return null;
        };

        /**
         *
         *
         *
         *    @access private
         *    @param String | QName PropertyName
         *    @returns null
         *    @throws TypeError
         */
        XML.prototype.Delete = function (PropertyName)
        {
            if (parseInt(PropertyName)+"" == PropertyName)
            {
                throw new TypeError();
            }

            var n = ToXMLName(PropertyName), k, dp = 0, q = 0, l;

            if (n instanceof AttributeName)
            {
                for (k in this._Attributes)
                {
                    if (
                        (n._Name.localName === "*" || n._Name.localName === this._Attributes[k]._Name.localName)
                            &&
                            (n._Name.uri == null || n._Name.uri === this._Attributes[k]._Name.uri)
                        )
                    {
                        this._Attributes[k]._Parent = null;
                        try{
                            delete this._Attributes[k];
                        }catch(e){}
                    }
                }

                return true;
            }

            for (l = this._Children.length; q < l; ++q)
            {
                if (
                    (n.localName === "*" || (this._Children[q]._Class === "element" && this._Children[q]._Name.localName === n.localName))
                        &&
                        (n.uri == null || (this._Children[q]._Class === "element" && n.uri === this._Children[q]._Name.uri))
                    )
                {
                    DeleteByIndex.call(this, q);
                    ++dp;
                }
                else if (dp > 0)
                {
                    this._Children[q - dp] = this._Children[q];
                }
            }


            return true;
        };

        /**
         *
         *
         *
         *    @access private
         *    @param XML Value
         *    @returns Boolean
         */
        XML.prototype.Equals = function (Value)
        {
            if (!(Value instanceof XML))
            {
                return false;
            }
            if (this._Class !== Value._Class)
            {
                return false;
            }
            if (this._Children.length !== Value._Children.length)
            {
                return false;
            }
            if (this._Value !== Value._Value)
            {
                return false;
            }
            if (this._Name !== null)
            {
                if (Value._Name === null)
                {
                    return false;
                }
                if (Value._Name.localName !== this._Name.localName)
                {
                    return false;
                }
                if (Value._Name.uri !== this._Name.uri)
                {
                    return false;
                }
            }
            else if (Value._Name !== null)
            {
                return false;
            }

            if (count(this._Attributes) !== count(Value._Attributes))
            {
                return false;
            }

            var a, b, k, l;

            for (k in this._Attributes)
            {
                a = this._Attributes[k];

                b = Value._Attributes[k];

                if (!b || b._Name.localName !== a._Name.localName || b._Name.uri !== a._Name.uri || b._Value !== a._Value)
                {
                    return false;
                }
            }

            for (k = 0, l = this._Children.length; k < l; ++k)
            {
                a = this._Children[k];

                b = Value._Children[k];

                if (!arguments.callee.call(a, b))
                {
                    return false;
                }
            }

            return true;
        };

        //extensions

        /*
         * e4x.js
         *
         * A JavaScript library that implements the optional E4X features described in
         * ECMA-357 2nd Edition Annex A if they are not already implemented.
         *
         * 2010-03-13
         *
         * By Elijah Grey, http://eligrey.com
         * License: The X11/MIT license (see COPYING.md)
         *
         * Changes:
         *    By Sam Shull, http://samshull.blogspot.com
         *    Just a litlle simplifying for implementation
         */

        /*global document, XML, XMLList, DOMParser, XMLSerializer, XPathResult */

        /*jslint undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true,
         newcap: true, immed: true, maxerr: 1000, maxlen: 90 */

        /**
         *
         *
         *
         */
        XML.prototype.domNode = function ()
        {
            return adoptNode(document, xmlToDomNode(this));
        };

        /**
         *
         *
         *
         */
        XML.prototype.domNodeList = function ()
        {
            if (this.length() < 0)
            {
                throw new Error();
            }

            return adoptNode(document, createDocumentFrom(this).documentElement).childNodes;
        };

        /**
         *
         *
         *
         */
        XML.prototype.xpath = function (xpathExp)
        {
            var res = new XMLList,
                i = 0, l = this.length(),
                xpr;

            if (l !== 1)
            {
                for (; i < l; ++i)
                {
                    res.Append(this[i].xpath(xpathExp));
                }

                return res;
            }

            xpr = evaluate(createDocumentFrom(this), xpathExp, this);

            for (l=xpr.length; i < l; ++i)
            {
                res.Append(ToXML(xpr[i]));
            }

            return res;
        };

        /**
         *
         *
         *
         */
        XML.prototype.transform = function (xslt, params)
        {
            if (!xslt instanceof XML)
            {
                throw new TypeError();
            }

            var doc, res, i, l = this.length(), c;

            if (l > 1)
            {
                res = new XMLList();
                for (i = 0; i < l; ++i)
                {
                    res.Append(this[i].transform(xslt, params));
                }
                return res;
            }

            return transform(this, xslt, params);
        };

        /**
         *
         *
         *    @returns XMLList
         */
        function XMLList ($string)
        {
            if (!(this instanceof XMLList))
            {
                return ToXMLList($string || "");
            }

            this._Class = "XMLList";

            this._Value = undefined;


            this._TargetObject = null;

            this._TargetProperty = null;

            this._Children = [];

            this[0] = null;

            if ($string)
            {
                var list = ToXMLList($string), i = 0, l = list._Children.length;
                this._Value = list._Value;

                for (;i < l; ++i)
                {
                    this._Children[i] = this[i] = list._Children[i];
                }
            }
        }

        /**
         *
         *
         *    @static
         *    @returns String
         *    @throws TypeError
         */
        XMLList.toString = function ()
        {
            return "function XMLList() {\n [native code] \n}";
        };

        XMLList.prototype = new XML();

        var ignore = {xpath:1,domNodeList:1,transform:1};

        for (p in XMLList.prototype)
        {
            if (ignore[p])
            {
                continue;
            }

            XMLList.prototype[p] = (function(p)
            {
                return function ()
                {
                    if (this._Children.length != 1)
                    {
                        throw new TypeError("cannot call " + p + " method on an XML list with " + this._Children.length + " elements");
                    }

                    return XML.prototype[p].apply(this[0], arguments);
                };
            })(p);
        }

        try{
            delete XMLList.prototype._Attributes;
            delete XMLList.prototype._InScopeNamespaces;
        }catch(e){}

        /**
         *
         *
         *    @param String | AttributeName attributeName
         *    @returns XMLList
         */
        XMLList.prototype.attribute = function (attributeName)
        {
            return GetList.call(this, ToAttributeName(attributeName));
        };

        /**
         *
         *
         *    @returns XMLList
         */
        XMLList.prototype.attributes = function ()
        {
            return GetList.call(this, ToAttributeName("*"));
        };

        /**
         *
         *
         *    @param String | QName propertyName
         *    @returns XMLList
         */
        XMLList.prototype.child = function (propertyName)
        {
            var list = new XMLList(), i = 0, l = this._Children.length, r;
            list._TargetObject = this;

            for (; i < l; ++i)
            {
                r = this[i].child(propertyName);

                if (r._Children.length > 0)
                {
                    list.Append(r);
                }
            }

            return list;
        };

        /**
         *
         *
         *    @returns XMLList
         */
        XMLList.prototype.children = function ()
        {
            return GetList.call(this, "*");
        };

        /**
         *
         *
         *    @returns XMLList
         */
        XMLList.prototype.comments = function ()
        {
            var list = new XMLList(), i = 0, l = this._Children.length, r;
            list._TargetObject = this;

            for (; i < l; ++i)
            {
                if (this[i]._Class === "element")
                {
                    r = this[i].comments();

                    if (r._Children.length > 0)
                    {
                        list.Append(r);
                    }
                }
            }

            return list;
        };

        /**
         *
         *
         *    @param XML value
         *    @returns Boolean
         */
        XMLList.prototype.contains = function (value)
        {
            for (var i = 0, l = this._Children.length; i < l; ++i)
            {
                if (this[i] == value)
                {
                    return true;
                }
            }

            return false;
        };

        /**
         *
         *
         *    @returns XMLList
         */
        XMLList.prototype.copy = function ()
        {
            return DeepCopyList.call(this);
        };

        /**
         *
         *
         *    @param String | QName name
         *    @returns XMLList
         */
        XMLList.prototype.descendants = function (name)
        {
            return DescendantsList.call(this, name || "*");
        };

        /**
         *
         *
         *    @param String | QName name
         *    @returns XMLList
         */
        XMLList.prototype.elements = function (name)
        {
            name = ToXMLName(name || "*");
            var list = new XMLList(), i = 0, l = this._Children.length, r;
            list._TargetObject = this;
            list._TargetProperty = name;

            for (; i < l; ++i)
            {
                if (this[i]._Class === "element")
                {
                    r = this[i].elements(name);

                    if (r._Children.length > 0)
                    {
                        list.Append(r);
                    }
                }
            }

            return list;
        };

        /**
         *
         *
         *    @param String name
         *    @returns Boolean
         */
        XMLList.prototype.hasOwnProperty = function (name)
        {
            return HasProperty.call(this, name)
                || (defaultXMLListProperties.indexOf("," + name + ",") === -1 && hasOwnProperty.call(this, name));
        };

        /**
         *
         *
         *    @returns Boolean
         */
        XMLList.prototype.hasComplexContent = function ()
        {
            if (this._Children.length === 0)
            {
                return false;
            }

            if (this._Children.length === 1)
            {
                return this[0].hasComplexContent();
            }

            for (var i = 0, l = this._Children.length; i < l; ++i)
            {
                if (this._Children[i]._Class === "element")
                {
                    return true;
                }
            }

            return false;
        };

        /**
         *
         *
         *    @returns Boolean
         */
        XMLList.prototype.hasSimpleContent = function ()
        {
            if (this._Children.length === 1)
            {
                return this[0].hasSimpleContent();
            }

            for (var i = 0, l = this._Children.length; i < l; ++i)
            {
                if (this._Children[i]._Class === "element")
                {
                    return false;
                }
            }

            return true;
        };

        /**
         *
         *
         *    @returns Number
         */
        XMLList.prototype.length = function ()
        {
            return this._Children.length;
        };

        /**
         *
         *
         *    @returns XMLList
         */
        XMLList.prototype.normalize = function ()
        {
            for (var i = 0, l = this._Children.length; i < l;)
            {
                if (this[i]._Class === "element")
                {
                    this[i].normalize();
                    ++i;
                }
                else if (this[i]._Class === "text")
                {
                    while (i+1 < this._Children.length && this[i+1]._Class === "text")
                    {
                        this[i]._Value = (this[i]._Value || "") + (this[i+1]._Value || "");
                        this.Delete(i+1);
                    }

                    if (this[i]._Value.length === 0)
                    {
                        this.Delete(i);
                    }
                    else
                    {
                        ++i;
                    }
                }
                else
                {
                    ++i;
                }
            }

            return this;
        };

        /**
         *
         *
         *    @returns XML | undefined
         */
        XMLList.prototype.parent = function ()
        {
            if (this._Children.length === 0)
            {
                return undefined;
            }

            for (var parent = this[0]._Parent, i = 1, l = this._Children.length; i < l; ++i)
            {
                if (this[i]._Parent != parent)
                {
                    return undefined;
                }
            }

            return parent;
        };

        /**
         *
         *
         *    @param String | QName name
         *    @returns XMLList
         */
        XMLList.prototype.processingInstructions = function (name)
        {
            name = ToXMLName(name || "*");
            var list = new XMLList(), i = 0, l = this._Children.length, r;
            list._TargetObject = this;

            for (; i < l; ++i)
            {
                if (this[i]._Class === "element")
                {
                    r = this[i].processingInstructions(name);

                    if (r._Children.length > 0)
                    {
                        list.Append(r);
                    }
                }
            }

            return list;
        };

        /**
         *
         *
         *    @param String | Number name
         *    @returns Boolean
         */
        XMLList.prototype.propertyIsEnumerable = function (name)
        {
            return parseInt(name) > 0 && parseInt(name) < this._Children.length;
        };

        /**
         *
         *
         *    @returns XMLList
         */
        XMLList.prototype.text = function ()
        {
            var list = new XMLList(), i = 0, l = this._Children.length, r;
            list._TargetObject = this;

            for (; i < l; ++i)
            {
                if (this[i]._Class === "element")
                {
                    r = this[i].text();

                    if (r._Children.length > 0)
                    {
                        list.Append(r);
                    }
                }
            }

            return list;
        };

        /**
         *
         *
         *    @returns String
         */
        XMLList.prototype.toString = function ()
        {
            return ToString(this);
        };

        /**
         *
         *
         *    @returns String
         */
        XMLList.prototype.toXMLString = function ()
        {
            return ToXMLString(this);
        };

        /**
         *
         *
         *    @returns XMLList
         */
        XMLList.prototype.valueOf = function ()
        {
            return this;
        };

        /**
         *
         *
         *
         *    @access private
         *    @param String | Number | QName PropertyName
         *    @param XML Value
         *    @param isElement
         *    @returns null
         */
        XMLList.prototype.Put = function (PropertyName, Value,isChildElement)
        {
            isChildElement = isChildElement !== undefined ? isChildElement : false;
            var i = parseInt(PropertyName), r, y, l, z, parent, c, j = 0, q, t;

            if (i+"" == PropertyName)
            {
                r = ResolveValue.call(this._TargetObject);
                /* Firefox doesn't do this
                 if (r == null)
                 {
                 return null;
                 }
                 */
                if (i >= this._Children.length)
                {
                    if (r instanceof XMLList)
                    {
                        if (r.length() != 1)
                        {
                            return null;
                        }

                        r = r[0];
                    }

                    /* Firefox doesn't do this
                     if (r._Class != "element")
                     {
                     return null;
                     }
                     */
                    y = new XML();
                    y._Parent = r;
                    y._Name = this._TargetProperty;
                    y._Attributes = {};

                    if (this._TargetProperty instanceof AttributeName)
                    {
                        if (!!r && Get.call(r, y._Name).length() > 0)
                        {
                            return null;
                        }

                        y._Class = "attribute";
                    }
                    else if (!isChildElement && (this._TargetProperty == null || this._TargetProperty.localName === "*"))
                    {
                        y._Name = null;
                        y._Class = "text";
                    }
                    else
                    {
                        y._Class = "element";
                    }

                    if (y._Class != "attribute")
                    {
                        if (r)
                        {
                            j = 0;

                            if (i > 0)
                            {
                                while (j < r._Children.length-1 && r[j] !== this[i-1])
                                {
                                    ++j;
                                }
                            }
                            else
                            {
                                j = r._Children.length - 1;
                            }

                            Insert.call(r, j+1, y);
                        }

                        if (Value instanceof XMLList)
                        {
                            y._Name = Value._TargetProperty;
                        }
                        else if (Value instanceof XML)
                        {
                            y._Name = Value._Name;
                        }
                    }

                    this.Append(y);
                }

                if (!(Value instanceof XML) || Value._Class === "text" || Value._Class === "attribute")
                {
                    Value = ToString(Value);
                }

                if (this[i]._Class === "attribute")
                {
                    z = ToAttributeName(this[i]._Name);
                    this[i]._Parent.Put(z, Value);
                    this[i] = this[i]._Parent.attribute(z)[0];
                }
                else if (Value instanceof XMLList)
                {
                    //shallow copy?
                    c = Value;
                    parent = this[i]._Parent;

                    if (parent)
                    {
                        q = this[i].childIndex();
                        Replace.call(parent, q, c);
                        for (j = 0, l = c._Children.length; j < l; ++j)
                        {
                            c._Children[j] = c[j] = parent._Children[q+j];
                        }
                    }

                    if (c._Children.length === 0)
                    {
                        for (j = i + 1, l = this._Children.length; j < l; ++j)
                        {
                            this._Children[j-1] = this[j-1] = this[j]
                        }
                    }
                    else
                    {
                        for (j = this._Children.length; j > i; --j)
                        {
                            z = ToString(j + c._Children.length - 1);
                            this._Children[z] = this[z] = this[j];
                        }
                    }

                    for (j = 0, l = c._Children.length; j < l; ++j)
                    {
                        this._Children[i+j] = this[i+j] = c[j];
                    }

                }
                else if (Value instanceof XML || (",text,comment,processing-instruction").indexOf("," + this[i]._Class+",") > -1)
                {
                    parent = !!this[i] && this[i]._Parent;

                    if(parent)
                    {
                        q = this[i].childIndex();
                        Replace.call(parent, q, Value);
                        Value = parent._Children[q];
                    }

                    if (toString.call(Value) === "[object String]")
                    {
                        t = ToXML(Value);
                        t._Parent = this;
                        this._Children[i] = this[i] = t;
                    }
                    else
                    {

                    }
                }
                else
                {
                    this.Append(XMLList(Value));
                }
            }
            /* Firefox doesn't do this
             else if (this.length() <= 1)
             {
             if (this.length() === 0)
             {
             r = ResolveValueList.call(this);

             if (r == null || r.length() != 1)
             {
             return null;
             }

             this.Append(r);
             }
             else
             {
             this[0].Put(PropertyName, Value);
             }
             }*/

            return null;
        };

        /**
         *
         *
         *
         *    @access private
         *    @param String | Number | QName PropertyName
         *    @returns null
         */
        XMLList.prototype.Delete = function (PropertyName)
        {
            var i = parseInt(PropertyName), parent, q, l;

            if (i+"" == PropertyName)
            {
                if (i >= this._Children.length)
                {
                    return true;
                }

                parent = this[i]._Parent;

                if (parent)
                {
                    if (this[i]._Class = "attribute")
                    {
                        parent.Delete(ToAttributeName(this[i]._Name));
                    }
                    else
                    {
                        DeleteByIndex.call(parent, this[i].childIndex());
                    }
                }

                try{
                    this._Children.splice(PropertyName,1);
                    delete this[PropertyName];
                }catch(e){}

                for (q = i + 1, l = this._Children.length; q < l; ++q)
                {
                    this._Children[q-1] = this[q-1] = this[q];
                }
                return true;
            }
            /* Firefox won't do this
             for (q = 0, l = this._Children.length; q < l; ++q)
             {
             if (this[q]._Class === "element")
             {
             this[q].Delete(PropertyName);
             }
             }
             */
            return true;
        };

        /**
         *
         *
         *
         *    @access private
         *    @param XML Value
         *    @returns null
         */
        XMLList.prototype.Append = function (Value)
        {
            if (!(Value instanceof XML))
            {
                return null;
            }

            var i = this._Children.length, n = 1, j = 0;

            if (Value instanceof XMLList)
            {
                n = Value._Children.length;

                if (n == 0)
                {
                    return null;
                }

                this._TargetObject = Value._TargetObject;
                this._TargetProperty = Value._TargetProperty;

                for (;j < n; ++j)
                {
                    this._Children[i+j] = this[i+j] = Value[j];
                }
            }
            else
            {
                this._Children[i] = this[i] = Value;
            }

            return null;
        };

        /**
         *
         *
         *
         *    @access private
         *    @param XML Value
         *    @returns Boolean
         */
        XMLList.prototype.Equals = function (Value)
        {
            if (Value == undefined && this._Children.length === 0)
            {
                return true;
            }
            else if (Value instanceof XMLList && Value._Children.length === this._Children.length)
            {
                for (var i = 0, l = this._Children.length; i < l; ++i)
                {
                    if (!this[i].Equals(Value[i]))
                    {
                        return false;
                    }
                }
            }
            else if (this._Children.length === 1)
            {
                return this[0].Equals(Value);
            }

            return false;
        };

        /**
         *
         *
         *
         *    @access private
         *    @returns XMLList
         */
        function ResolveValueList ()
        {
            if (this._Children.length > 0)
            {
                return this;
            }

            if (this._TargetObject == null
                || this._TargetProperty == null
                || this._TargetProperty instanceof AttributeName
                || this._TargetProperty.localName === "*"
                )
            {
                return null;
            }

            var base = ResolveValue.call(this._TargetObject), target;

            if (base == null)
            {
                return null;
            }

            target = Get.call(base, this._TargetProperty);

            if (target._Children.length === 0)
            {
                if (base instanceof XMLList && base._Children.length > 1)
                {
                    return null;
                }

                base.Put(this._TargetProperty, "");

                target = Get.call(base, this._TargetProperty);
            }

            return target;
        };

        /**
         *
         *
         *    @param String | Namespace | QName prefix
         *    @param String uri
         *    @returns Namespace
         *    @throws TypeError
         */
        function Namespace (prefix, uri)
        {
            if (!(this instanceof Namespace))
            {
                return prefix && prefix instanceof Namespace
                    ? prefix
                    : new Namespace(prefix, uri);
            }

            if (uri === undefined && prefix === undefined)
            {
                this.prefix = "";
                this.uri = "";
            }
            else if (uri === undefined)
            {
                uri = prefix;
                prefix = undefined;

                if (uri instanceof Namespace)
                {
                    this.prefix = uri.prefix;
                    this.uri = uri.uri;
                }
                else if (uri instanceof QName && uri.uri !== null)
                {
                    this.uri = uri.uri;
                }
                else
                {
                    this.uri = ToString(uri);

                    if (this.uri == "")
                    {
                        this.prefix = "";
                    }
                }
            }
            else
            {
                if (uri instanceof QName)
                {
                    this.uri = uri.uri;
                }
                else
                {
                    this.uri = ToString(uri);
                }

                if (this.uri === "")
                {
                    if (prefix === undefined || ToString(prefix) === "")
                    {
                        this.prefix = "";
                    }
                    else
                    {
                        throw new TypeError("cannot define the prefix for an empty uri");
                    }
                }
                else if (prefix === undefined)
                {
                    this.prefix = undefined;
                }
                else
                {
                    this.prefix = ToString(prefix);
                }
            }
        }

        /**
         *
         *
         *    @var String
         */
        Namespace.prototype.prefix = undefined;

        /**
         *
         *
         *    @var String
         */
        Namespace.prototype.uri = undefined;

        /**
         *
         *
         *    @returns String
         */
        Namespace.prototype.toString = function ()
        {
            return this.uri;
        };

        /**
         *
         *
         *    @param Namespace | String | QName NameSpace
         *    @param String
         *    @returns QName
         */
        function QName (NameSpace, Name)
        {
            if (!(this instanceof QName))
            {
                return NameSpace instanceof QName
                    ? NameSpace
                    : new QName(NameSpace, Name);
            }

            if (Name === undefined)
            {
                Name = NameSpace;
                NameSpace = undefined;
            }

            if (Namespace instanceof QName)
            {
                if (Name === undefined)
                {
                    Name = Name.localName;
                }
            }

            Name = Name === undefined || Name === null
                ? ""
                : ToString(Name);

            if (NameSpace === undefined)
            {
                NameSpace = Name === "*" ? null : GetDefaultNamespace();
            }

            this.localName = Name;

            if (NameSpace == null)
            {
                this.uri = null;
            }
            else
            {
                NameSpace = Namespace(NameSpace);
                this.uri = NameSpace.uri;
                this._Prefix = NameSpace.prefix;
            }
        }

        /**
         *
         *
         *    @var String
         */
        QName.prototype.localName = undefined;

        /**
         *
         *
         *    @var String
         */
        QName.prototype.uri = undefined;

        /**
         *
         *
         *    @param Object InScopeNamespaces
         *    @returns Namespace
         *    @throws TypeError
         */
        function GetNamespace (q, InScopeNamespaces)
        {
            if(!q)
                 return new Namespace();
            if (q.uri === null)
            {
                throw new TypeError();
            }

            InScopeNamespaces = InScopeNamespaces || {};

            var ns, p;

            for (p in InScopeNamespaces)
            {
                if (q.uri === InScopeNamespaces[p].uri)
                {
                    ns = InScopeNamespaces[p];

                    if (!!q._Prefix && q._Prefix === ns.prefix)
                    {
                        return ns;
                    }
                }
            }

            if (!ns)
            {
                ns = !!q._Prefix
                    ? new Namespace(q._Prefix, q.uri)
                    : new Namespace(q.uri);
            }

            return ns;
        };

        /**
         *
         *
         *    @returns String
         */
        QName.prototype.toString = function ()
        {
            return !!this.uri
                ? this.uri + "::" + this.localName
                : this.localName;
        };

        /**
         *
         *
         *    @param AttributeName | QName | String name
         *    @returns AttributeName
         */
        function AttributeName (name)
        {
            if (!(this instanceof AttributeName))
            {
                return name && (name instanceof AttributeName || name instanceof QName)
                    ? name
                    : new AttributeName(name);
            }

            this._Name = name instanceof QName
                ? name
                : new QName(new Namespace(GetDefaultNamespace()||undefined), name);
        }

        /**
         *
         *
         *    @var String
         */
        AttributeName.prototype.localName = undefined;

        /**
         *
         *
         *    @var String
         */
        AttributeName.prototype.uri = undefined;

        /**
         *
         *
         *    @returns String
         */
        AttributeName.prototype.toString = function ()
        {
            return "@" + (!!this._Name.uri
                ? this._Name.uri + "::" + this._Name.localName
                : this._Name.localName
                );
        };

        /**
         *
         *
         *
         */
        function AnyName ()
        {

        }

        /**
         *
         *
         *    @param mixed value
         *    @returns Boolean
         */
        function isXMLName (value)
        {
            if (value instanceof AttributeName)
            {
                return true;
            }

            try{
                var q = QName(value);
            }
            catch (e)
            {
                return false;
            }

            return !!q.localName && (!!q.localName.match(/^[\w\-]+$/i) || !!q.localName.match(/^[\w\-\:]+$/i));
        }

        /**
         *
         *
         *    @param mixed value
         *    @returns String
         *    @throws TypeError
         */
        function ToString (value)
        {
            var i = 0, l, s;

            if (value instanceof XMLList)
            {
                if (value.hasSimpleContent())
                {
                    s = "";

                    for (l = value.length(); i < l; ++i)
                    {
                        if (value[i]._Class != "comment" && value[i]._Class != "processing-instruction")
                        {
                            s += ToString(value[i]);
                        }
                    }

                    return s;
                }

                return ToXMLString(value);
            }
            else if (value instanceof XML)
            {
                if (value._Class === "attribute" || value._Class === "text")
                {
                    return value._Value;
                }

                if (value.hasSimpleContent())
                {
                    s = "";

                    for (l = value.length(); i < l; ++i)
                    {
                        if (value.child(i)._Class != "comment" && value.child(i)._Class != "processing-instruction")
                        {
                            s += ToString(value.child(i));
                        }
                    }

                    return s;
                }

                return ToXMLString(value);
            }
            else if (value instanceof AttributeName)
            {
                return "@" + ToString(value._Name);
            }

            return value === null || value === undefined
                ? ""
                : "" + value;
        }

        /**
         *
         *
         *    @param XML input
         *    @param Object AncestorNamespaces
         *    @param Number IndentLevel
         *    @returns String
         */
        function ToXMLString (input, AncestorNamespaces, IndentLevel)
        {
            var s = "", p = 0, temp, temp2, namespace, namespaceUnion,
                namespaceDeclarations = {}, attrAndNamespaces, prefixes, defaultSet;

            AncestorNamespaces = AncestorNamespaces || {};

            IndentLevel = Number(IndentLevel || 0);

            if (input instanceof XMLList)
            {
                temp = input.hasSimpleContent();

                temp2 = input.length();

                for (; p < temp2; ++p)
                {
                    if (p > 0)
                    {
                        s += "\r\n";
                    }

                    s += ToXMLString(input._Items, AncestorNamespaces);
                }

                return s;
            }
            else if (input instanceof XML)
            {
                if (XML.prettyPrinting)
                {
                    //s += new Array(IndentLevel+1).join(" ");
                    for (; p < IndentLevel; ++p)
                    {
                        s += " ";
                    }
                }

                switch (input._Class)
                {
                    case "text":
                        return s + EscapeElementValue(XML.prettyPrinting ? trim(input._Value) : input._Value);

                    case "attribute":
                        return s + EscapeAttributeValue(input._Value);

                    case "comment":
                        return s + "<!--" + input._Value + "-->";

                    case "processing-instruction":
                        return s + "<?" + input._Name.localName + " " + input._Value + "?>";

                    default:
                        namespaceUnion = extend({}, AncestorNamespaces);

                        for (p in input._InScopeNamespaces)
                        {
                            temp = input._InScopeNamespaces[p];

                            if (!AncestorNamespaces[(temp.prefix||"")] || AncestorNamespaces[(temp.prefix||"")].uri != temp.uri)
                            {
                                namespaceUnion[(temp.prefix||"")] = namespaceDeclarations[(temp.prefix||"")] = new Namespace(temp);
                            }
                        }

                        if (!input._Parent)
                        {
                            namespaceUnion[(input._DefaultNamespace.prefix||"")] =
                                namespaceDeclarations[(input._DefaultNamespace.prefix||"")] = new Namespace(input._DefaultNamespace);
                        }
                        /*
                         //firefox doesn't do this
                         for (p in input._Attributes)
                         {
                         namespace = GetNamespace(input._Attributes[p]._Name, namespaceUnion);

                         if (namespace.prefix === undefined)
                         {
                         do {
                         namespace.prefix = !namespaceUnion[""] ? "" : newPrefix();
                         }
                         while(!!namespaceUnion[namespace.prefix]);
                         }

                         namespaceUnion[namespace.prefix] = namespaceDeclarations[namespace.prefix] = namespace;
                         }
                         */

                        s += "<";

                        namespace = GetNamespace(input._Name, namespaceDeclarations);

                        if (namespace.prefix)
                        {
                            s += namespace.prefix + ":";
                        }

                        s += input._Name ? input._Name.localName : "";

                        attrAndNamespaces = extend({}, input._Attributes, namespaceDeclarations);

                        defaultSet = false;

                        for (p in attrAndNamespaces)
                        {
                            s += " ";

                            if (attrAndNamespaces[p] instanceof XML)
                            {
                                temp = GetNamespace(attrAndNamespaces[p]._Name, AncestorNamespaces);

                                if (temp.prefix === undefined && !namespaceUnion[""])
                                {
                                    do{
                                        temp.prefix = !namespaceUnion[""] ? "" : newPrefix();
                                    }
                                    while(namespaceUnion[temp.prefix]);

                                    namespaceUnion[temp.prefix] = namespaceDeclarations[temp.prefix] = new Namespace(temp);
                                }

                                if (temp.prefix)
                                {
                                    s += temp.prefix + ":";
                                }

                                s += attrAndNamespaces[p].localName() + '="' + EscapeAttributeValue(attrAndNamespaces[p]._Value) + '"';
                            }
                            else
                            {
                                s += "xmlns";

                                if (!attrAndNamespaces[p].prefix && defaultSet)
                                {
                                    do{
                                        attrAndNamespaces[p].prefix = newPrefix();
                                    }
                                    while(!!namespaceUnion[attrAndNamespaces[p].prefix]);

                                    namespaceUnion[attrAndNamespaces[p].prefix] =
                                        namespaceDeclarations[attrAndNamespaces[p].prefix] =
                                            new Namespace(attrAndNamespaces[p]);

                                    s += ":" + attrAndNamespaces[p].prefix;
                                }
                                else if (!attrAndNamespaces[p].prefix && !defaultSet)
                                {
                                    defaultSet = true;
                                }
                                else if (attrAndNamespaces[p].prefix)
                                {
                                    s += ":" + attrAndNamespaces[p].prefix;
                                }

                                s += '="' + EscapeAttributeValue(attrAndNamespaces[p].uri) + '"';
                            }
                        }

                        temp = input._Children.length;

                        if (!temp)
                        {
                            return s + "/>";
                        }

                        s += ">";

                        temp2 = temp > 1 || (temp == 1 && input._Class !== "text");

                        names = (!!XML.prettyPrinting && !!temp2) ? IndentLevel + Number(XML.prettyIndent) : 0;

                        prefixes = !!XML.prettyPrinting && !!temp2;

                        for (p = 0; p < temp; ++p)
                        {
                            if (prefixes)
                            {
                                s += "\r\n";
                            }

                            if (input._Children[p])
                            {
                                s += ToXMLString(input._Children[p], namespaceDeclarations, names);
                            }
                        }

                        if (prefixes)
                        {
                            s += "\r\n";

                            for (p = 0; p < IndentLevel; ++p)
                            {
                                s += " ";
                            }
                        }

                        return s + "</" + (namespace.prefix ? namespace.prefix + ":" : "") + input._Name.localName + ">";
                }

                throw new TypeError();
            }
            else if (input === undefined || input === null)
            {
                throw new TypeError();
            }
            else if (toString.call(input) === "[object Object]")
            {
                return EscapeElementValue( input.valueOf().toString() );
            }

            return ToString(input);
        }

        /**
         *
         *
         *    @param mixed s
         *    @returns XML
         *    @throws SyntaxError | TypeError
         */
        function ToXML (s)
        {
            var x, div;

            if (s instanceof XMLList)
            {
                if (s.length() == 1)
                {
                    return s[0];
                }
            }
            else if (s instanceof XML)
            {
                return s;
            }
            else if ((",string,number,boolean,").indexOf("," + typeof(s)+",") > -1)
            {

                div = parse('<parent xmlns="' + GetDefaultNamespace() + '">' + s + '</parent>');

                x = ToXML(div.documentElement)

                if (x)
                {
                    if (x.length() == 0)
                    {
                        return new XML();
                    }
                    else if (x.length() == 1)
                    {
                        x.child(0)._Parent = null;
                        return x.child(0);
                    }
                }


                throw new SyntaxError("Failed to convert DOM object to XML");
            }
            else if (s.nodeType && !isNaN(s.nodeType))
            {
                return MapInfoItemToXML(s);
            }

            throw new TypeError();
        }

        /**
         *
         *
         *    @param DOMNode i
         *    @returns XML
         *    @throws TypeError
         */
        function MapInfoItemToXML (i,n)
        {
            var x = new XML(), temp, temp2, temp3, isNScheck = isNSDef, j, l, xmlChild;

            x._Parent = null;

            switch (i.nodeType)
            {
                case TEXT_NODE:
                case CDATA_SECTION_NODE:
                    x._Class = "text";
                    x._Value = "";
                    temp = i;

                    while (temp && (temp.nodeType === TEXT_NODE || temp.nodeType === CDATA_SECTION_NODE))
                    {
                        x._Value += temp.textContent || temp.text || temp.data;
                        temp = i.nextSibling;
                        if (n && n.n)
                        {
                            ++n.n;
                        }
                    }


                    if (XML.ignoreWhitespace && !x._Value.match(/\S+/))
                    {
                        return null;
                    }

                    return x;

                    break;
                case COMMENT_NODE:
                    if (XML.ignoreComments)
                    {
                        return null;
                    }

                    x._Class = "comment";
                    x._Value = i.data || i.textContent || i.text || "";

                    return x;

                    break;
                case PROCESSING_INSTRUCTION_NODE:
                    if (XML.ignoreProcessingInstructions)
                    {
                        return null;
                    }

                    x._Class = "processing-instruction";
                    x._Name = new QName("", i.target);
                    x._Value = i.data || i.textContent || i.text || "";

                    return x;

                    break;
                case ATTRIBUTE_NODE:
                    x._Class = "attribute";

                    temp = i.nodeName.match(/(([\w\-]+):)?([\w\-]+)/);

                    if ( temp[1] )
                    {
                        temp2 = undefined;

                        if (!!i.lookupNamespace)
                        {
                            temp2 = i.lookupNamespace(temp[2]);
                        }
                        else
                        {
                            temp3 = n;//hack for ie -- stupid ie

                            while (!temp2 && !!temp3 && !!temp3.attributes)
                            {
                                for (j = 0, l = temp3.attributes.length; j < l; ++j)
                                {
                                    if (temp3.attributes[j].nodeName == ("xmlns:" + temp[2]))
                                    {
                                        temp2 = temp3.attributes[j].value || temp3.attributes[j].nodeValue;
                                        break;
                                    }
                                }

                                temp3 = temp3.parentNode;
                            }
                        }
                        x._DefaultNamespace = new Namespace( temp[2], temp2 );
                        x._Name = new QName( x._DefaultNamespace, temp[3] );
                    }
                    else
                    {
                        temp2 = undefined;

                        if (!!i.lookupNamespace)
                        {
                            temp2 = i.lookupNamespace("");
                        }
                        else
                        {
                            temp3 = i.parentNode;

                            while (!temp2 && !!temp3 && !!temp3.attributes)
                            {
                                for (j = 0, l = temp3.attributes.length; j < l; ++j)
                                {
                                    if (temp3.attributes[j].nodeName == "xmlns")
                                    {
                                        temp2 = temp3.attributes[j].value || temp3.attributes[j].nodeValue;
                                        break;
                                    }
                                }

                                temp3 = temp3.parentNode;
                            }
                        }

                        x._DefaultNamespace = new Namespace("", temp2);
                        x._Name = new QName( x._DefaultNamespace, temp[3] );
                    }

                    x._Value = i.value || null;

                    return x;

                    break;
                case ELEMENT_NODE:
                    x._Class = "element";
                    temp = i.nodeName.match(/(([\w\-]+):)?([\w\-]+)/);

                    if ( temp[1] )
                    {
                        temp2 = undefined;

                        if (!!i.lookupNamespace)
                        {
                            temp2 = i.lookupNamespace(temp[2]);
                        }
                        else
                        {
                            temp3 = i;

                            while (!temp2 && !!temp3 && !!temp3.attributes)
                            {
                                for (j = 0, l = temp3.attributes.length; j < l; ++j)
                                {
                                    if (temp3.attributes[j].nodeName == ("xmlns:" + temp[2]))
                                    {
                                        temp2 = temp3.attributes[j].value || temp3.attributes[j].nodeValue;
                                        break;
                                    }
                                }

                                temp3 = temp3.parentNode;
                            }
                        }
                        x._DefaultNamespace = new Namespace( temp[2], temp2 );
                        x._Name = new QName( x._DefaultNamespace, temp[3] );
                    }
                    else
                    {
                        temp2 = undefined;

                        if (!!i.lookupNamespace)
                        {
                            temp2 = i.lookupNamespace("");
                        }
                        else
                        {
                            temp3 = i;

                            while (!temp2 && !!temp3 && !!temp3.attributes)
                            {
                                for (j = 0, l = temp3.attributes.length; j < l; ++j)
                                {
                                    if (temp3.attributes[j].nodeName == "xmlns")
                                    {
                                        temp2 = temp3.attributes[j].value || temp3.attributes[j].nodeValue;
                                        break;
                                    }
                                }

                                temp3 = temp3.parentNode;
                            }
                        }

                        x._DefaultNamespace = new Namespace("", temp2);

                        x._Name = new QName( x._DefaultNamespace, temp[3] );
                    }

                    for (temp = 0, temp2 = i.attributes.length; temp < temp2; ++temp)
                    {
                        if (temp3 = isNScheck.exec(i.attributes[temp].nodeName))
                        {
                            x._InScopeNamespaces[temp3[1]] = new Namespace(temp3[1], i.attributes[temp].value);
                        }
                        else if (i.attributes[temp].nodeName === "xmlns")
                        {
                            x._InScopeNamespaces[""] = new Namespace(i.attributes[temp].value);
                        }
                        else
                        {
                            x._Attributes[i.attributes[temp].nodeName] = MapInfoItemToXML(i.attributes[temp], i);
                        }
                    }

                    j = 0;
                    xmlChild = 0;
                    temp = i.childNodes.length;

                    while (j < temp)
                    {
                        n = {n:-1};
                        if (temp3 = MapInfoItemToXML(i.childNodes[j], n))
                        {
                            //even though it is not written this way in the spec
                            //this is how it works in Firefox
                            x._Children[xmlChild] = temp3;
                            x._Children[xmlChild]._Parent = x;

                            if (temp3._Class === "text" && n.n > 0)
                            {
                                j = j + n.n;
                            }

                            ++xmlChild;
                        }

                        ++j;
                    }

                    x._Value = i.textContent || i.text || i.data || "";

                    x._Length = xmlChild;

                    return x;

                    break;
                case DOCUMENT_NODE:
                //firefox won't do this
                //return MapInfoItemToXML(document.documentElement);
                //break;
                case ENTITY_REFERENCE_NODE:
                    throw new TypeError();
                    break;
                default:
                    return null;
                    break;
            }
        }

        /**
         *
         *
         *    @param mixed s
         *    @returns XML
         *    @throws TypeError
         */
        function ToXMLList (s)
        {
            var e,x,list,i,l;

            if (s instanceof XMLList)
            {
                return s;
            }
            else if (s instanceof XML)
            {
                list = new XMLList();
                list._Children[0] = list[0] = s;
                list._TargetObject = x._Parent;
                list._TargetProperty = x._Name;

                return list;
            }
            else if ((",string,boolean,number,").indexOf("," + typeof(s)+",") === -1)
            {
                throw new TypeError();
            }

            e = parse('<parent xmlns="' + GetDefaultNamespace() + '">' + s + '</parent>');
            x = ToXML(e.documentElement);
            list = new XMLList();
            i = 0;
            l = x._Children.length;

            list._TargetObject = null;

            for (;i < l; ++i)
            {
                x._Children[i]._Parent = null;
                list._Children[i] = list[i] = x._Children[i];
            }


            return list;
        }

        /**
         *
         *
         *    @param mixed s
         *    @returns XMLList
         *    @throws TypeError
         */
        function ToAttributeName (s)
        {
            if (s === "*")
            {
                return new AttributeName(new QName(null, "*"));
            }
            else if (s instanceof QName)
            {
                return new AttributeName(s);
            }
            else if (s instanceof AttributeName)
            {
                return s;
            }

            switch (typeof(s))
            {
                case "undefined":
                case "null":
                case "boolean":
                case "number":
                    throw new TypeError();
                    break;
                case "string":
                    return new AttributeName(new QName(null, (s + "").replace(/^@/,"")));
                    break;
                case "object":
                    return new AttributeName(new QName(null, ToString(s)));
                    break;
            }
        }

        /**
         *
         *
         *    @param mixed s
         *    @returns QName | AttributeName
         *    @throws TypeError
         */
        function ToXMLName (s)
        {
            if (s instanceof QName || s instanceof AttributeName)
            {
                return s;
            }
            else if (s === "*")
            {
                return new QName("*");
            }

            switch (typeof(s))
            {
                case "undefined":
                case "null":
                case "boolean":
                case "number":
                    throw new TypeError();
                    break;
                case "string":
                    if (s.charAt(0) === "@")
                    {
                        return ToAttributeName( s.substr(0) );
                    }

                    return new QName(s);

                    break;
                case "object":
                    return ToXMLName( ToString(s) );
                    break;
            }
        }

        /**
         *
         *
         *    @returns String
         */
        function GetDefaultNamespace ()
        {
            return !!defaultNamespace && defaultNamespace.uri || "";
        }

        /**
         *
         *
         *    @param String s
         *    @returns String
         */
        function EscapeElementValue (s)
        {
            return ((s||"")+"").replace(/./g, function (c)
            {
                switch (c)
                {
                    case "<":
                        return "&lt;";
                    case ">":
                        return "&gt;";
                    case "&":
                        return "&amp;";
                    default:
                        return c;
                }
            });
        }

        /**
         *
         *
         *
         *    @param String s
         *    @returns String
         */
        function EscapeAttributeValue (s)
        {
            return ((s||"")+"").replace(/./g, function (c)
            {
                switch (c)
                {
                    case '"':
                        return "&quot;";
                    case "<":
                        return "&lt;";
                    case ">":
                        return "&gt;";
                    case "&":
                        return "&amp;";
                    case "\r":
                        return "&#xA;";
                    case "\n":
                        return "&#xD;";
                    case "\t":
                        return "&#x9;";
                    default:
                        return c;
                }
            });
        }

        /**
         *
         *
         *    @access private
         *    @param String | QName PropertyName
         *    @returns XMLList
         */
        function Get (PropertyName)
        {
            if (this instanceof XMLList)
            {
                return GetList.call(this, PropertyName);
            }

            if (parseInt(PropertyName)+"" == PropertyName)
            {
                return GetList.call(ToXMLList(this), PropertyName );
            }

            var n = ToXMLName(PropertyName),
                list = new XMLList(), p, l;

            list._TargetObject = this;
            list._TargetProperty = n;

            if (n instanceof AttributeName)
            {
                for (p in this._Attributes)
                {
                    if (
                        (n._Name.localName === "*" || n._Name.localName === this._Attributes[p]._Name.localName)
                            &&
                            (n._Name.uri == null || n._Name.uri === this._Attributes[p]._Name.uri)
                        )
                    {
                        list.Append(this._Attributes[p]);
                    }
                }
            }
            else
            {
                for (p = 0, l = this._Children.length; p < l; ++p)
                {
                    if (
                        (n.localName === "*" || (this._Children[p]._Class === "element" && this._Children[p]._Name.localName === n.localName))
                            &&
                            (n.uri == null || (this._Children[p]._Class === "element" && n.uri === this._Children[p]._Name.uri))
                        )
                    {
                        list.Append(this._Children[p]);
                    }
                }
            }

            return list;
        }

        /**
         *
         *
         *
         *    @access private
         *    @param String | QName P
         *    @returns Boolean
         */
        function HasProperty (P)
        {
            if (this instanceof XMLList)
            {
                return HasPropertyList.call(this, P);
            }

            if (parseInt(P) == P)
            {
                return P == "0";
            }

            var n = ToXMLName(P), k, l;

            if (n instanceof AttributeName)
            {
                for (k in this._Attributes)
                {
                    if (
                        (
                            n._Name.localName === "*" || n._Name.localName === this._Attributes[k]._Name.localName
                            ) &&
                            (
                                n._Name.uri == null || n._Name.uri === this._Attributes[k]._Name.uri
                                )
                        )
                    {
                        return true;
                    }
                }

                return false;
            }

            for (k = 0, l = this._Children.length; k < l; ++k)
            {
                if (
                    (n.localName === "*" || (this._Children[k]._Class === "element" && this._Children[k]._Name.localName === n.localName))
                        &&
                        (n.uri == null || (this._Children[k]._Class === "element" && n.uri === this._Children[k]._Name.uri))
                    )
                {
                    return true;
                }
            }

            return false;
        }

        /**
         *
         *
         *
         *    @access private
         *    @param String | QName PropertyName
         *    @returns Boolean
         *    @throws TypeError
         */
        function DeleteByIndex (PropertyName)
        {
            var i = parseInt(PropertyName);//, q = i + 1, l = this._Children.length;

            if (i == PropertyName)
            {
                if (!!this._Children[i])
                {
                    this._Children[i]._Parent = null;

                    this._Children[i] = null;

                    this._Children.splice(i, 1);

                    /*
                     for (;q < l;++q)
                     {
                     this._Children[q-1] = this._Children[q];
                     }
                     */
                }

                return true;
            }

            throw new TypeError();
        }

        /**
         *
         *
         *
         *    @access private
         *    @returns XML
         */
        function DeepCopy ()
        {
            if (this instanceof XMLList)
            {
                return DeepCopyList.call(this);
            }

            var y = new XML(), i, l;//, c, t;

            y._Class = this._Class;
            y._Name = this._Name;
            y._DefaultNamespace = this._DefaultNamespace ? new Namespace(this._DefaultNamespace) : null;
            y._Value = this._Value;
            y._Parent = null;

            for (i in this._InScopeNamespaces)
            {
                y._InScopeNamespaces[i] = new Namespace(this._InScopeNamespaces.prefix, this._InScopeNamespaces.uri);
            }

            for (l in this._Attributes)
            {
                //y._Attributes[i] = arguments.callee.call(this._Attributes[i]);
                //not part of the spec
                y._Attributes[i] = this._Attributes[l].copy();
                y._Attributes[i]._Parent = y;
            }

            for (i = 0, l = this._Children.length; i < l; ++i)
            {
                y._Children[i] = this._Children[i].copy();
                y._Children[i]._Parent = y;
            }

            return y;
        }

        /**
         *
         *
         *
         *    @access private
         *    @returns XML
         */
        function ResolveValue ()
        {
            if (this instanceof XMLList)
            {
                return ResolveValueList.call(this);
            }
            return this instanceof XML ? this : null;
        }

        /**
         *
         *
         *
         *    @access private
         *    @param String | QName PropertyName
         *    @returns XMLList
         */
        function Descendants (PropertyName)
        {
            if (this instanceof XMLList)
            {
                return DescendantsList.call(this, PropertyName);
            }

            var n = ToXMLName(PropertyName),
                list = new XMLList(),
                k, l, dq;

            list._TargetObject = null;

            if (n instanceof AttributeName)
            {
                for (k in this._Attributes)
                {
                    if (
                        (n._Name.localName === "*" || n._Name.localName === this._Attributes[k]._Name.localName)
                            &&
                            (n._Name.uri == null || n._Name.uri === this._Attributes[k]._Name.uri)
                        )
                    {
                        list.Append(this._Attributes[k]);
                    }
                }
            }

            for (k = 0, l = this._Children.length; k < l; ++k)
            {
                if (
                    (n.localName === "*" || (this._Children[k]._Class === "element" && this._Children[k]._Name.localName === n.localName))
                        &&
                        (n.uri == null || (this._Children[k]._Class === "element" && n.uri === this._Children[k]._Name.uri))
                    )
                {
                    list.Append(this._Children[k]);
                }

                dq = this._Children[k].descendants(n);

                if (dq.length() > 0)
                {
                    list.Append(dq);
                }
            }

            return list;
        }

        /**
         *
         *
         *
         *    @access private
         *    @param String | QName PropertyName
         *    @param XML Value
         *    @returns null
         *    @throws TypeError | Error
         */
        function Insert (PropertyName, Value)
        {
            if ((",text,comment,processing-instruction,attribute,").indexOf("," + this._Class + ",") > -1)
            {
                return false;
            }

            var i = parseInt(PropertyName), n, j;

            if (i+"" != PropertyName)
            {
                throw new TypeError("'" + i + "' != '" + PropertyName + "'");
            }

            if (Value === this || indexOf("," + this, Value.descendants("*")) > -1)
            {
                throw new Error();
            }

            n = Value.length();

            for (j = this._Children.length - 1; j >= i; --j)
            {
                this._Children[ j + n ] = this._Children[j];
            }


            if (Value instanceof XMLList)
            {
                for (j = 0; j < n; ++j)
                {
                    Value[j]._Parent = this;
                    this._Children[i + j] = Value[j];
                }
            }
            else
            {
                Replace.call(this, i, Value);
            }

            return null;
        }

        /**
         *
         *
         *
         *    @access private
         *    @param String | QName PropertyName
         *    @param XML Value
         *    @returns null
         *    @throws TypeError
         */
        function Replace (PropertyName, Value)
        {
            if ((",text,comment,processing-instruction,attribute,").indexOf("," + this._Class + ",") > -1)
            {
                return null;
            }

            var i = parseInt(PropertyName), t;

            if (i+"" != PropertyName)
            {
                throw new TypeError("'" + i + "' != '" + PropertyName + "'");
            }

            if (i >= this._Children.length)
            {
                PropertyName = this._Children.length;
            }

            if (Value instanceof XMLList)
            {
                DeleteByIndex.call(this, PropertyName);
                Insert.call(this, PropertyName, Value);
            }
            else if (Value instanceof XML
                && Value._Class === "element"
                && (",element,comment,processing-instruction,text").indexOf("," + Value._Class + ",") > -1
                )
            {
                Value._Parent = this;

                if (this._Children[PropertyName])
                {
                    this._Children[PropertyName]._Parent = null;
                }

                this._Children[PropertyName] = Value;
            }
            else
            {
                t = new XML();
                t._Parent = this;
                t._Value = ToString(Value);

                if (this._Children[PropertyName])
                {
                    this._Children[PropertyName]._Parent = null;
                }

                this._Children[PropertyName] = t;
            }
        };

        /**
         *
         *
         *
         *    @access private
         *    @param String | Namespace NameSpace
         *    @returns null
         */
        function AddInScopeNamespace (NameSpace)
        {
            if ((",text,comment,processing-instruction,attribute,").indexOf("," + this._Class + ",") > -1)
            {
                return null;
            }

            var match = null, p;

            if (NameSpace.prefix == "" && this._Name.uri == "")
            {
                return null;
            }

            for (p in this._InScopeNamespaces)
            {
                if (NameSpace.prefix === this._InScopeNamespaces[p].prefix)
                {
                    match = this._InScopeNamespaces[p];
                }
            }

            if (match && match.uri != NameSpace.uri)
            {
                this._InScopeNamespaces[match.prefix] = null;
                try{
                    delete this._InScopeNamespaces[match.prefix];
                }catch(e){}
            }

            this._InScopeNamespaces[NameSpace.prefix] = NameSpace;

            if (this._Name.prefix === NameSpace.prefix)
            {
                this._Name.prefix = undefined;
            }

            for (p in this._Attributes)
            {
                if (this._Attributes[p]._Name.prefix = NameSpace.prefix)
                {
                    this._Attributes[p]._Name.prefix = undefined;
                }
            }

            //do this in order to ensure namespace integrity
            /*match = parse(this.toXMLString());
             this._Node = !!this._Node.parentNode
             ? this._Node.parentNode.replaceChild(match.documentElement, this._Node)
             : match;*/
        }

        /**
         *
         *
         *    @access private
         *    @param String | Number name
         *    @returns Boolean
         */
        function HasPropertyList (name)
        {
            if (ToString( parseInt(name) ) === name)
            {
                return parseInt(name) < this._Children.length;
            }

            for (var i = 0, l = this._Children.length; i < l; ++i)
            {
                if (this[i]._Class === "element" && this[i].hasOwnProperty(name))
                {
                    return true;
                }
            }

            return false;
        }

        /**
         *
         *
         *
         *    @access private
         *    @param String | Number | QName PropertyName
         *    @returns XMLList
         */
        function GetList (PropertyName)
        {
            if (parseInt(PropertyName)+"" == PropertyName)
            {
                return this[PropertyName];
            }

            var list = new XMLList(), i = 0, l = this._Children.length, temp;
            list._TargetObject = this;
            list._TargetProperty = PropertyName;

            for (;i < l; ++i)
            {
                if (this._Children[i]._Class === "element")
                {
                    temp = Get.call(this._Children[i], PropertyName);

                    if (temp._Children.length > 0)
                    {
                        list.Append(temp);
                    }
                }
            }

            return list;
        }

        /**
         *
         *
         *
         *    @access private
         *    @returns XMLList
         */
        function DeepCopyList ()
        {
            var list = new XMLList(), i = 0, l = this._Children.length;

            list._TargetObject = this._TargetObject;
            list._TargetProperty = this._TargetProperty;
            list._Class = this._Class;
            list._Value = this._Value;

            for (;i < l; ++i)
            {
                list.Append(DeepCopy.call(this[i]));
            }

            return list;
        }

        /**
         *
         *
         *
         *    @access private
         *    @param String | QName PropertyName
         *    @returns XMLList
         */
        function DescendantsList (PropertyName)
        {
            var list = new XMLList(), i = 0, l = this._Children.length, temp;

            for (; i < l; ++i)
            {
                if (this[i]._Class === "element")
                {
                    if ((temp = Descendants.call(this[i], "*")) && temp.length() > 0)
                    {
                        list.Append(temp);
                    }
                }
            }

            return list;
        }

        /**
         *    http://blog.stevenlevithan.com/archives/faster-trim-javascript
         *
         *
         *    @param String s
         *    @returns String
         */
        function trim (str)
        {
            if(!str)
                return str;
            var    str = str.replace(/^\s\s*/, ""),
                ws = /\s/,
                i = str.length;
            while (ws.test(str.charAt(--i)));
            return str.slice(0, i + 1);
        }

        /**
         *    Generates a prefix for a QName that is not already
         *    a property of the optional argument
         *
         *    @param Object prefixes
         *    @returns String
         */
        function newPrefix (prefixes)
        {
            prefixes = prefixes || {};

            var num = Math.random()
                .toString()
                .substr(2)
                .replace(/.{2}/g, function (a)
                {
                    a = Number(a);
                    return (a > 90 ? 90 : (a < 65 ? 65 : a)) + "";
                });

            num = String.fromCharCode(
                Number(num.substr(0, 2)) & 0xFF,
                Number(num.substr(2, 2)) & 0xFF,
                Number(num.substr(4, 2)) & 0xFF,
                Number(num.substr(6, 2)) & 0xFF,
                Number(num.substr(8, 2)) & 0xFF,
                Number(num.substr(10, 2)) & 0xFF
            ).toLowerCase();

            while (num in prefixes)
            {
                num = arguments.callee(prefixes);
            }

            return num;
        }

        /**
         *
         *
         *    @param String str
         *    @returns DOMNode
         *    @throws SyntaxError
         */
        function parse (str)
        {
            var xmlDoc, success = true;

            if (!!window.ActiveXObject) //Internet Explorer
            {
                try{
                    xmlDoc                      = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async                = 'false';
                    xmlDoc.preserveWhiteSpace   = true;
                    xmlDoc.resolveExternals     = false;
                    xmlDoc.validateOnParse         = false;
                    xmlDoc.setProperty('ProhibitDTD', false);
                    success = xmlDoc.loadXML(str);
                }catch(e){}
            }
            else
            {
                try{//Firefox, Mozilla, Opera, etc.
                    xmlDoc = new DOMParser();
                    xmlDoc = xmlDoc.parseFromString(str, "text/xml");
                }catch(e){}
            }

            if (!success || !xmlDoc || xmlDoc.documentElement.nodeName == "parsererror")
            {
                throw new SyntaxError(!!xmlDoc && xmlDoc.documentElement.childNodes[0].nodeValue);
            }

            return xmlDoc;
        }

        /**
         *
         *
         *    @param Object obj
         *    @returns Number
         */
        function count (obj)
        {
            if ("__count__" in obj)
            {
                return obj.__count__;
            }

            var i = 0, k;

            for (k in obj)
            {
                if (obj.hasOwnProperty(k))
                {
                    ++i;
                }
            }

            return i;
        }

        /**
         *
         *
         *    @param Object obj
         *    @param XMLList list
         *    @returns Number
         */
        function indexOf (obj, list)
        {
            for (var i = 0, l = list.length(); i < l; ++i)
            {
                if (list[i].Equals(obj))
                {
                    return i;
                }
            }

            return -1;
        }

        /**
         *
         *
         *    @param mixed obj
         *    @param mixed ...
         *    @returns mixed
         */
        function extend (obj)
        {
            for (var p, i = 1, l = arguments.length; i < l; ++i)
            {
                for (p in arguments[i])
                {
                    obj[p] = arguments[i][p];
                }
            }

            return obj;
        }

        /**
         *
         *
         *
         */
        function createDocumentFrom (xml)
        {
            return parse(xml.length() == 1 ? xml.toXMLString() : "<x>" + xml.toXMLString() + "</x>");
        }

        /**
         *
         *
         *
         */
        function xmlToDomNode (xml)
        {
            switch (xml.nodeKind())
            {
                case "element":
                    return createDocumentFrom(xml).documentElement;

                case "text":
                    return xmlDoc.createTextNode(xml.toString());

                case "comment":
                    return xmlDoc.createComment(xml.toString().slice(4, -3));

                case "processing-instruction":
                    return xmlDoc.createProcessingInstruction(
                        xml.localName(),
                        xml.toString().slice(2, -2).replace(piName, "")
                    );

                case "attribute":
                    return createAttributeNS(xml);
            }
            return null;
        }

        function adoptNode (doc, node)
        {
            if (!!doc.adoptNode)
            {
                return doc.adoptNode(node);
            }

            var b = doc.documentElement || doc.body;
            return b.removeChild(b.appendChild(node));
        }

        function evaluate (doc, expr, xml)
        {
            var res, l, n = "";

            if (!!doc.evaluate)
            {
                res = doc.evaluate(
                    expr,
                    doc,
                    doc.createNSResolver(doc),
                    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
                    null
                );

                l = [];

                while(n = res.iterateNext())
                {
                    l[l.length] = n;
                }

                return l;
            }

            res = allNamespaces(xml);

            if (count(res))
            {
                for (l in res)
                {
                    n += " xmlns:" + l + '="' + EscapeAttributeValue(res[l]) + '"';
                }

                doc.setProperty('SelectionNamespaces', n.substr(1));
            }

            doc.setProperty("SelectionLanguage", "XPath");

            return !!window.ActiveXObject && doc.selectNodes(expr);
        }

        function allNamespaces (xml, un)
        {
            var ns = un || {},
                i = 0,
                c = xml.children(),
                l = c.length(),
                n = un == undefined
                    ? inscope(xml)
                    : xml._InScopeNamespaces,
                p;

            for (;i < l; ++i)
            {
                ns = arguments.callee(c[i], ns);
            }

            for (p in n)
            {
                if (n[p].prefix)
                {
                    ns[n[p].prefix] = n[p].uri;
                }
            }

            return ns;
        }

        function inscope (xml)
        {
            var ns = {},
                i = 0,
                n = xml.inScopeNamespaces(),
                l = n.length;

            for (;i < l; ++i)
            {
                if (n[i].prefix)
                {
                    ns[n[i].prefix] = n[i].uri;
                }
            }

            return ns;
        }

        function createAttributeNS (xml)
        {
            var ns = xml.namespace(),
                node = !!xmlDoc.createAttributeNS
                    ? xmlDoc.createAttributeNS(ns.uri, xml.localName())
                    : xmlDoc.createAttribute((ns.prefix ? ns.prefix + ":" : "" ) + xml.localName());

            node.nodeValue = xml.toString();
            return node;
        }

        function transform (xml, style, params)
        {
            var xsl, res, i = 0, l = (params||[]).length;

            if (!window.XSLTProcessor)
            {
                //TODO: Need to create a way to set parameters on an IE stylesheet
                //XSLProcessor
                //http://msdn.microsoft.com/en-us/library/ms757015%28v=VS.85%29.aspx
                //http://msdn.microsoft.com/en-us/library/ms763679%28VS.85%29.aspx
                //http://msdn.microsoft.com/en-us/library/ms754594%28v=VS.85%29.aspx

                res = createDocumentFrom(xml).transformNode(createDocumentFrom(style));

                return !!res && ToXML(res) || null;
            }

            xsl = new XSLTProcessor();

            xsl.importStyleSheet(createDocumentFrom(style));

            for (; i < l; ++i)
            {
                res = params[i];
                xsl.setParameter(res.namespaceURI, res.localName, res.value);
            }

            res = xsl.transformToDocument(createDocumentFrom(doc))

            return !!res && ToXML(res) || null;
        }

        for (p in XML.prototype)
        {
            defaultXMLPrototype += p + ",";
        }

        for (p in XMLList.prototype)
        {
            defaultXMLListPrototype += p + ",";
        }

        /**
         *
         *
         *
         */
        window.XML              = XML;
        window.XMLList          = XMLList;
        window.QName            = QName;
        window.Namespace        = Namespace;
        window.isXMLName        = isXMLName;
        window.AttributeName    = AttributeName;

    })();
}