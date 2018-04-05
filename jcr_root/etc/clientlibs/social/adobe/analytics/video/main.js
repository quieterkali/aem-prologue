/*
 * ADOBE SYSTEMS INCORPORATED
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.

 * NOTICE:  Adobe permits you to use, modify, and distribute this file in accordance with the
 * terms of the Adobe license agreement accompanying it.  If you have received this file from a
 * source other than Adobe, then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 */

CQ.Communities = CQ.Communities || {};
CQ.Communities.Analytics = CQ.Communities.Analytics || {};
CQ.Communities.Analytics.VHL = CQ.Communities.Analytics.VHL || {};

// Set-up the AppMeasurement component.
CQ.Communities.Analytics.VHL.appMeasurement = new AppMeasurement();


//appMeasurement plug-ins
/*
 * Plugin: manageVars v1.5 (requires s.pt utility if using AppMeasurement)
 */
CQ.Communities.Analytics.VHL.appMeasurement.manageVars=new Function("c","l","f",""
+"var s=this,vl,la,vla;l=l?l:'';f=f?f:1;if(!s[c])return false;vl='pag"
+"eName,purchaseID,channel,server,pageType,campaign,state,zip,events,"
+"products,transactionID';for(var n=1;n<76;n++)vl+=',prop'+n+',eVar'+"
+"n;for(n=1;n<6;n++)vl+=',hier'+n;for(n=1;n<4;n++)vl+=',list'+n;for(n"
+" in s.contextData)vl+=',contextData.'+n;if(l&&(f==1||f==2)){if(f==1"
+")vl=l.replace('[\\'','.').replace('\\']','');if(f==2){la=l.split(',"
+"');vla=vl.split(',');vl='';for(x in la){if(la[x].indexOf('contextDa"
+"ta')>-1){lax=la[x].split('\\'');la[x]='contextData.'+lax[1];}for(y "
+"in vla){if(la[x]==vla[y]){vla[y]='';}}}for(y in vla){vl+=vla[y]?','"
+"+vla[y]:'';}}s.pt(vl,',',c,0);return true;}else if(l==''&&f==1){s.p"
+"t(vl,',',c,0);return true;}else return false;");
CQ.Communities.Analytics.VHL.appMeasurement.clearVars=new Function("t",""
+"var s=this;if(t.indexOf('contextData')==-1)s[t]='';else if(t.indexO"
+"f('contextData')>-1){var c=t.substring(t.indexOf('.')+1);s.contextD"
+"ata[c]='';}");
CQ.Communities.Analytics.VHL.appMeasurement.lowercaseVars=new Function("t",""
+"var s=this;if(t!='events'&&t.indexOf('contextData')==-1&&s[t]){s[t]"
+"=s[t].toString();if(s[t].indexOf('D=')!=0){s[t]=s[t].toLowerCase();"
+"}}else if(t.indexOf('contextData')>-1){var c=t.substring(t.indexOf("
+"'.')+1);if(s.contextData[c]){s.contextData[c]=s.contextData[c].toSt"
+"ring();s.contextData[c]=s.contextData[c].toLowerCase();}}");

/* 
 * s.pt utility (runs function f against variables in x)
 */
CQ.Communities.Analytics.VHL.appMeasurement.pt=new Function("x","d","f","a",""
+"var s=this,t=x,z=0,y,r;while(t){y=t.indexOf(d);y=y<0?t.length:y;t=t"
+".substring(0,y);r=s[f](t,a);if(r)return r;z+=y+d.length;t=x.substri"
+"ng(z,x.length);t=z<x.length?t:''}return'';");