/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
    (function (guidelib) {

        guidelib.author.TypesConfig = {
            'AFCOMPONENT' : {
                vars : {
                    'visible' : {
                        name : 'visible',
                        type : 'BOOLEAN',
                        readOnly : "false"
                    },
                    "title" : {
                        "name" : "title",
                        "type" : "STRING",
                        "readOnly" : "true"
                    },
                    "somExpression" : {
                        "name" : "somExpression",
                        "type" : "STRING",
                        "readOnly" : "true"
                    },
                    "name" : {
                        "name" : "name",
                        "type" : "STRING",
                        "readOnly" : "true"
                    },
                    "dorExclusion" : {
                        name : 'dorExclusion',
                        type : 'BOOLEAN',
                        readOnly : "false"
                    }
                }
            },
            'CHART' : {
                inherits : 'AFCOMPONENT',
                vars : {
                    "chartType" : {
                        "name" : "chartType",
                        "type" :  "STRING",
                        readOnly : "false"
                    }
                }
            },
            'FIELD' : {
                inherits : 'AFCOMPONENT',
                vars : {
                    'enabled' : {
                        name : 'enabled',
                        type : 'BOOLEAN',
                        readOnly : "false"
                    },
                    'mandatory' : {
                        name : 'mandatory',
                        type : 'BOOLEAN',
                        readOnly : "false"
                    },
                    'validationsDisabled' : {
                        name : 'validationsDisabled',
                        type : 'BOOLEAN',
                        readOnly : "false"
                    },
                    "validateExpMessage" : {
                        "name" : "validateExpMessage",
                        "type" : "STRING",
                        "readOnly" : "false"
                    }
                }
            },
            'BUTTON' : {
                inherits : 'AFCOMPONENT',
                vars : {
                    "title" : {
                        "name" : "title",
                        "type" : "STRING",
                        "readOnly" : "false"
                    }
                }
            },
            'NUMBER FIELD' : {
                inherits : 'FIELD',
                vars : {
                    'value' : {
                        name : 'value',
                        type : 'NUMBER',
                        readOnly : "false"
                    }
                }
            },
            'TEXT FIELD' : {
                inherits : 'FIELD',
                vars : {
                    'value' : {
                        name : 'value',
                        type : 'STRING',
                        readOnly : "false"
                    }
                }
            },
            'DATE FIELD' : {
                inherits : 'FIELD',
                vars : {
                    'value' : {
                        name : 'value',
                        type : 'DATE',
                        readOnly : "false"
                    }
                }
            },
            'PASSWORD FIELD' : {
                inherits : 'FIELD',
                vars : {
                    'value' : {
                        name : 'value',
                        type : 'STRING',
                        readOnly : "false"
                    }
                }
            },
            'DROP DOWN' : {
                inherits : 'FIELD',
                vars : {
                    'items' : {
                        name : 'items',
                        type : 'LIST',
                        readOnly : "false"
                    },
                    'value' : {
                        name : 'value',
                        type : 'STRING',
                        readOnly : "false"
                    }
                }
            },
            'RADIO BUTTON' : {
                inherits : 'FIELD',
                vars : {
                    'value' : {
                        name : 'value',
                        type : 'STRING',
                        readOnly : "false"
                    }
                }
            },
            'CHECKBOX' : {
                inherits : 'FIELD',
                vars : {
                    'value' : {
                        name : 'value',
                        type : 'STRING',
                        readOnly : "false"
                    }
                }
            },
            'SWITCH' : {
                inherits : 'FIELD',
                vars : {
                    'value' : {
                        name : 'value',
                        type : 'STRING',
                        readOnly : "false"
                    }
                }
            },
            'PANEL' : {
                inherits : 'AFCOMPONENT',
                vars : {
                    'enabled' : {
                        name : 'enabled',
                        type : 'BOOLEAN',
                        readOnly : "false"
                    },
                    "title" : {
                        "name" : "title",
                        "type" : "STRING",
                        "readOnly" : "false"
                    }
                }
            },
            'TABLE ROW' : {
                inherits : 'AFCOMPONENT',
                vars : {}
            },
            'FILE ATTACHMENT' : {
                inherits : 'AFCOMPONENT',
                vars : {
                    'value' : {
                        name : 'value',
                        type : 'STRING',
                        readOnly : "true"
                    }
                }
            }
        };

    })(guidelib);
