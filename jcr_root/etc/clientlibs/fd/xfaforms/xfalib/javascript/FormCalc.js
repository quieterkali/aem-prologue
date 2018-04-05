/*******************************************************************************
 * ADOBE CONFIDENTIAL
 *  ___________________
 *
 *   Copyright 2013 Adobe Systems Incorporated
 *   All Rights Reserved.
 *
 *  NOTICE:  All information contained herein is, and remains
 *  the property of Adobe Systems Incorporated and its suppliers,
 *  if any.  The intellectual and technical concepts contained
 *  herein are proprietary to Adobe Systems Incorporated and its
 *  suppliers and are protected by all applicable intellectual property
 *  laws, including trade secret and copyright laws.
 *  Dissemination of this information or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained
 *  from Adobe Systems Incorporated.
 ******************************************************************************/

/**
 * This object hosts FormCalc build-in functions
 */
FormCalc = function(){};


FormCalc.convertArgumentsToArray = function() {
    var args= [];
    for (var i = 0;i<arguments.length;i++) {
        if(arguments[i] instanceof Array) {
            args = args.concat(arguments[i])
        }
        else {
            args.push(arguments[i])
        }
    }
    return args;
}

////Arithmetic Built-in Functions
/**
 * Returns the average of the non-null elements of a given set of numbers.
 */
FormCalc.avg = function(){
    var args = this.convertArgumentsToArray.apply(this,arguments);
	return FormCalc.runWithNumericArgs(function(){
        var sum = 0 ;
        var valid_count = 0;
        for(var idx=0; idx<arguments.length; idx++ ){
        		sum += arguments[idx];
        		valid_count++;
        }
        return valid_count ? sum/valid_count :null;
	}, args);
};

/**
 * Returns the count of the non-null elements of a given set of numbers.
 */
FormCalc.count = function(){
    var args = this.convertArgumentsToArray.apply(this,arguments);
    var argus = FormCalc.limitAllNullArgs(args);
	return argus.length ? argus.length : 0
};

/**
 * Returns the max of the non-null elements of a given set of numbers.
 */
FormCalc.max = function(){
    var args = this.convertArgumentsToArray.apply(this,arguments);
    return FormCalc.runWithNumericArgs(Math.max, args);
};

/**
 * Returns the min of the non-null elements of a given set of numbers.
 */
FormCalc.min = function(){
    var args = this.convertArgumentsToArray.apply(this,arguments);
    return FormCalc.runWithNumericArgs(Math.min, args);
};

/**
 * Returns the modulus of one number divided by another..
 */
FormCalc.mod = function(a,b){
	if(b==0 ){
		throw "<missing or illegal parameter(s).>";
	}
	return a%b;
};

/**
 * Returns the sum of the non-null elements of a given set of numbers.
 */
FormCalc.sum = function(){
    var args = this.convertArgumentsToArray.apply(this,arguments);
    return FormCalc.runWithNumericArgs(function(){
    	var result = 0;
        for(var idx=0;idx<arguments.length;idx++ ){
        	result += arguments[idx];
        }
        return result;
	}, args);
};

/**
 * Returns a number rounded to a given number of decimal places
 */
FormCalc.round = function(n1,n2){
	if(!FormCalc.isNumeric(n1)){
		return 0;
	}
	if(arguments.length == 1) {
        return Math.round(n1);
    }else if(arguments.length == 2){
    	if(n2==null){
    		return null;
    	}
    	
    	n1 = parseFloat(n1);
    	if(n2 > 12){
    		n2 = 12;
    	}
    	if(isNaN(n1) || !isFinite(n1)){
    		return n1;
    	}else{
    		return n1.toFixed(n2);    		
    	}	
    }
};

/**
 * Returns the radian value of a given number.
 */
FormCalc.deg2Rad = function(angle){
	return FormCalc.isNumeric(angle) ? (angle / 180) * Math.PI :null;
};

/**
 * Returns the degree value of a given number.
 */
FormCalc.rad2Deg = function(radio){
	return FormCalc.isNumeric(radio) ? radio * 180 / Math.PI : null;	
};
////String Built-in Functions 
/**
 * Locates the starting character position of string s2 within string s1.
 */
FormCalc.at = function(n1,n2){
	return n1.indexOf(n2) + 1;
};

/**
 * Returns the string concatenation of a given set of strings.
 */
FormCalc.concat = function(){
	var sArray = new Array();
	for(var i=0;i<arguments.length;i++){
		if(arguments[i]!=null){
			sArray[sArray.length] = arguments[i].toString();
		}
	}

	if(sArray.length == 0){
		return null;
	}else{
		return sArray.join("");
	}
};

/**
 * Extracts a number of characters from a given string, 
 * starting with the first character on the left.
 */
FormCalc.left = function(s,n){
	if(s==null){
		return null;
	}
	return s.substring(0,n);
};

/**
 * Extracts a number of characters from a given string, 
 * beginning with the last character on theright.
 */

FormCalc.right = function(s,n){
	if(s==null){
		return null;
	}
	return s.substring(s.length-n,s.length);
};

/**
 * Returns the number of characters in a given string.
 */
FormCalc.len = function(s){
	if(s==null){
		return 0;
	}else{
		return s.toString().length;		
	}
};

/**
 * Returns a string with all leading white space characters removed.
 */
FormCalc.ltrim = function(s){
	if(s==null){
		return null;
	}
	return s.replace(/^\s+/,"");
};

/**
 * Returns a string with all trailing white space characters removed.
 */
FormCalc.rtrim = function(s){
	if(s == null){
		return null;
	}
	return s.replace(/\s+$/,"");
};

/**
 * Replaces all occurrences of one string with another within a given string.
 */
FormCalc.replace = function(s1, s2, s3) {
	if(s1 == null){
		return null;
	}
	if (undefined == s3) {
		s3 = "";
	}
	return s1.replace(s2, s3);
};

/**
 * returns a string consisting of a given number of blank spaces.
 */
FormCalc.space = function(n){
	var sArray = new Array();
	var num = Math.floor(n);
	for(var i=0;i<num;i++){
		sArray[sArray.length]=" ";
	}
	return sArray.join("");
};

/**
 * Extracts a portion of a given string.
 * 
 */
FormCalc.substr = function(s1,n1,n2){
    if(n2<=0){
    	return "";
    }
    if(n1 < 1){
    	n1 = 1;
    } else if(n1 > s1.length){
    	n1 = s1.length;
    }
	return s1.substring(n1-1,n1-1+n2);
};

/**
 * Inserts a string into another string.
 * 
 */
FormCalc.stuff = function(s1, n1, n2, s2){
    if(n2<0){
    	n2=0;
    }
    if(n1 < 1){
    	n1 = 1;
    } else if(n1 > s1.length){
    	n1 = s1.length;
    }
    if(s2 == undefined){
    	s2="";
    }
	return s1.substring(0, n1-1) + s2 + s1.substring(n1 + n2-1,s1.length);
};

/**
 * Returns a string where all given uppercase characters are converted to lowercase.
 */
FormCalc.lower = function(s1){
	if(s1==null){
		return null;
	}else{
		return s1.toLowerCase();		
	}
};

/**
 * Returns a string with all given lowercase characters converted to uppercase.
 */
FormCalc.upper = function(s1){
	if(s1==null){
		return null;
	}else{
		return s1.toUpperCase();		
	}
};

/**
 * Selects a value from a given set of parameters.
 */
FormCalc.choose = function(n1,s1){
	if(n1 < 1){
		return "";
	}
	if(n1 < arguments.length){
		return arguments[n1];
	} else {
		return "";
	}
};
	
/**
 * Returns true if a value is in a given set.
 */
FormCalc.oneof = function(s1, s2){
	for(var idx = 1; idx < arguments.length; idx++){
		if(s1 == arguments[idx]){
			return true;
		}
	}
	return false;
};

/**
 * This logical function returns true if a value is within a given range.
 */
FormCalc.within = function(s1, s2, s3){
	return (s1>=s2 && s1<=s3);
}

/**
 * 
 */
FormCalc.iffun = function(s1, s2, s3){
	FormCalc.checkMinArgs(arguments.length, 2);
	FormCalc.checkMaxArgs(arguments.length, 3);
	if(s1){
		return s2;
	}else{
		return s3;
	}
};


/**
 * Returns the annual percentage rate for a loan.
 */
FormCalc.apr = function(nPrincipal, nPayment, nPeriods) {
	FormCalc.checkMinArgs(arguments.length, 3);
	FormCalc.checkMaxArgs(arguments.length, 3);
	if (nPrincipal <= 0 || nPayment <= 0 || nPeriods < 0) {
		throw "<missing or illegal parameter(s).>";
	}
	
	var maxIterations = 500;
	var eps = 0.005;
	var delta = 0.0000001;
	var nInterest = 0.05;
	var nPmtZero = nPrincipal / nPeriods;
	var nPmtCur = FormCalc.loanPmt(nPrincipal, nInterest, nPeriods);
	var i = 1;

	do {
		if (Math.abs(nPmtCur - nPmtZero) < delta)
			break;
		nInterest *= (nPayment - nPmtZero) / (nPmtCur - nPmtZero);
		nPmtCur = FormCalc.loanPmt(nPrincipal, nInterest, nPeriods);
	} while (!(++i > maxIterations || Math.abs(nPayment - nPmtCur) < eps));
	var nRate = (Math.abs(nPmtCur - nPmtZero) < delta) ? 0 : 12 * nInterest;
	return FormCalc.checkResult(nRate);
};

/**
 * Returns the number of periods needed for an investment earning a fixed, but compounded,
 * interest rate to grow to a future value.
 */
FormCalc.cterm = function(nInterest, nFuture, nPresent) {
	FormCalc.checkMinArgs(arguments.length, 3);
	FormCalc.checkMaxArgs(arguments.length, 3);
	if (nInterest <= 0 || nFuture <= 0 || nPresent < 0) {
		throw "<missing or illegal parameter(s).>";
	}
	var nPeriods = Math.log(nFuture / nPresent) / Math.log(1 + nInterest);
	return FormCalc.checkResult(nPeriods);
};

/**
 * Returns the future value of periodic constant payments at a constant interest rate.
 */
FormCalc.fv = function(nPayment, nInterest, pnPeriods) {
	FormCalc.checkMinArgs(arguments.length, 3);
	FormCalc.checkMaxArgs(arguments.length, 3);
	var nPeriods = parseInt(pnPeriods);
	if (nPeriods <= 0 || nPayment <= 0 || nInterest < 0) {
		throw "<missing or illegal parameter(s).>";
	}

	var nVal;
	if (nInterest == 0) {
		nVal = nPayment * nPeriods;
	} else {
		nVal = nPayment * (1 + nInterest)
				* (FormCalc.intRate(nInterest, nPeriods - 1) - 1) / nInterest + nPayment;
	}

	return FormCalc.checkResult(nVal);
};

/**
 * Returns the amount of interest paid on a loan over a period of time.
 *
 */
FormCalc.ipmt = function(nPrincipal, nInterest, nPayment, nStart, nMonths) {
	FormCalc.checkMinArgs(arguments.length, 5);
	FormCalc.checkMaxArgs(arguments.length, 5);
    if(nPrincipal <=0 || nInterest <=0 ||nPayment <=0  ||nStart<1 ||nMonths<1){
    	throw "<missing or illegal parameter(s).>";
    }
	
	nInterest /= 12;
	nStart = parseFloat(nStart);
	nMonths = parseFloat(nMonths);
	if (nPayment <= nPrincipal * nInterest) {
		return 0;
	} else if (nMonths + nStart - 1 > FormCalc.loanTerm(nPrincipal, nInterest, nPayment)) {
		return 0;
	} else {
		var nPrincipalRemaining = nPrincipal;
		var nPrincipalPaidInPeriod = 0;
		var nInterestPaidInPeriod = 0;
		for ( var i = 1; i < nStart; i++) {
			nInterestPaidInPeriod = nPrincipalRemaining * nInterest;
			nPrincipalPaidInPeriod = nPayment - nInterestPaidInPeriod;
			nPrincipalRemaining -= nPrincipalPaidInPeriod;
			if (nPrincipalRemaining <= 0)
				break;
		}
		var nInterestPaid = 0.;
		for ( var i = nStart; i < nStart + nMonths; i++) {
			nInterestPaidInPeriod = nPrincipalRemaining * nInterest;
			nPrincipalPaidInPeriod = nPayment - nInterestPaidInPeriod;
			nPrincipalRemaining -= nPrincipalPaidInPeriod;
			nInterestPaid += nInterestPaidInPeriod;
			if (nPrincipalRemaining <= 0)
				break;
		}
		return FormCalc.checkResult(nInterestPaid);
	}
};

/**
 * Returns the net present value of an investment based on a discount rate, and a series of
 * periodic future cash flows.
 *
 */
FormCalc.npv = function(){
	FormCalc.checkMinArgs(arguments.length, 1);

	var nDiscountRate = FormCalc.parseFloat(arguments[0]);
    if(nDiscountRate<=0){
    	throw "<missing or illegal parameter(s).>";
    }	
	
	var nVal = 0;
	var nDenom = 1;
	for ( var i = 1; i < arguments.length; i++) {
		if(null == arguments[i]){
			return null;
		}
		nDenom *= (1 + nDiscountRate);
		nVal += FormCalc.parseFloat(arguments[i]) / nDenom;
	}
	return FormCalc.checkResult(nVal);

};

/**
 * Returns the payment for a loan based on constant payments and a constant interest rate.
 */
FormCalc.pmt = function(nPrincipal, nInterest, nPeriods) {
	FormCalc.checkMinArgs(arguments.length, 3);
	FormCalc.checkMaxArgs(arguments.length, 3);
	if(nPrincipal <=0 || nInterest<=0 || nPeriods <=0){
    	throw "<missing or illegal parameter(s).>";
    }
	var nPayment = FormCalc.loanPmt(parseFloat(nPrincipal), parseFloat(nInterest),
			parseInt(nPeriods));
	return FormCalc.checkResult(nPayment);

};

/**
 * Returns the amount of principal paid on a loan over a period of time.
 * 
 */
FormCalc.ppmt = function(nPrincipal, nInterest, nPayment, nStart, nMonths) {
	FormCalc.checkMinArgs(arguments.length, 5);
	FormCalc.checkMaxArgs(arguments.length, 5);
    if(nPrincipal <=0 || nInterest <=0 ||nPayment <=0  ||nStart<1 ||nMonths<1){
    	throw "<missing or illegal parameter(s).>";
    }
	
	nPrincipal = parseFloat(nPrincipal);
	nInterest = parseFloat(nInterest);
	nPayment = parseFloat(nPayment);
	nStart = parseInt(nStart);
	nMonths = parseInt(nMonths);

	nInterest /= 12;
	if (nPayment <= nPrincipal * nInterest) {
		return 0;
	} else if (nMonths + nStart - 1 > FormCalc.loanTerm(nPrincipal, nInterest, nPayment)) {
		return 0;
	} else {
		var nPrincipalRemaining = nPrincipal;
		var nPrincipalPaidInPeriod = 0;
		var nInterestPaidInPeriod = 0;
		for ( var i = 1; i < nStart; i++) {
			nInterestPaidInPeriod = nPrincipalRemaining * nInterest;
			nPrincipalPaidInPeriod = nPayment - nInterestPaidInPeriod;
			nPrincipalRemaining -= nPrincipalPaidInPeriod;
			if (nPrincipalRemaining <= 0)
				break;
		}
		var nPrinciplePaid = 0;
		for ( var i = nStart; i < nStart + nMonths; i++) {
			nInterestPaidInPeriod = nPrincipalRemaining * nInterest;
			nPrincipalPaidInPeriod = nPayment - nInterestPaidInPeriod;
			nPrincipalRemaining -= nPrincipalPaidInPeriod;
			nPrinciplePaid += nPrincipalPaidInPeriod;
			if (nPrincipalRemaining <= 0)
				break;
		}
		return FormCalc.checkResult(nPrinciplePaid);
	}
};

/**
 * Returns the present value of an investment of periodic constant payments at a constant 
 * interest rate.
 *
 */
FormCalc.pv = function(nPayment, nInterest, nPeriods) {
	FormCalc.checkMinArgs(arguments.length, 3);
	FormCalc.checkMaxArgs(arguments.length, 3);
	if (nPayment <= 0 || nPeriods <= 0 ) {
		throw "<missing or illegal parameter(s).>";
	}
	if(nPayment==null || nInterest==null){
		return null;
	}
	var nPayment = parseFloat(nPayment);
	var nInterest = parseFloat(nInterest);
	var nPeriods = parseInt(nPeriods);

	var nVal;
	if (nInterest == 0) {
		nVal = nPayment * nPeriods;
	} else {
		nVal = nPayment * (1 - 1 / FormCalc.intRate(nInterest, nPeriods)) / nInterest;
	}
	return FormCalc.checkResult(nVal);
};

/**
 * Returns the compound interest rate per period required for an investment to grow from
 * present to future value in a given period.
 * 
 */
FormCalc.rate = function(nFuture, nPresent, nPeriods) {
	if (nFuture <= 0. || nPresent <= 0. || nPeriods <= 0) {
		throw "<missing or illegal parameter(s).>";
	}

	var nFuture = parseFloat(nFuture);
	var nPresent = parseFloat(nPresent);
	var nPeriods = parseInt(nPeriods);

	var nRate = Math.exp(Math.log(nFuture / nPresent) / nPeriods) - 1;
	return FormCalc.checkResult(nRate);
};

/*
 * Term This function returns the number of periods needed for an investment
 * earning a fixed, but compounded interest rate to grow to a future value.
 */
FormCalc.term = function(nPayment, nInterest, nFuture) {
	var nPayment = FormCalc.parseFloatOrThrowError(nPayment);
	var nInterest = FormCalc.parseFloatOrThrowError(nInterest);
	var nFuture = FormCalc.parseFloatOrThrowError(nFuture);

	if (nPayment <= 0. || nInterest <= 0. || nFuture <= 0.) {
		throw "<missing or illegal parameter(s).>";
	}
	
	var nPeriods;
	if (nFuture <= nPayment) {
		nPeriods = 1;
	} else {
		nPeriods = Math.log((nFuture - nPayment) / nPayment * nInterest
				+ (1 + nInterest))
				/ Math.log(1 + nInterest);
	}
	return FormCalc.checkResult(nPeriods);
};

FormCalc.loanTerm = function(nPrincipal, nInterest, nPayment) {
	var nRemaining = nPrincipal;
	var nMonths = 0;
	while (nRemaining > 0.0) {
		nRemaining = nRemaining - nPayment + nRemaining * nInterest;
		nMonths++;
	}
	return FormCalc.checkResult(nMonths);
};
/**
 * This function returns a Universally Unique Identifier (UUID).
 */
FormCalc.uuid = function(n1) {
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    if(n1==1){
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }else{
    	return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
    }
};
// Private functions

FormCalc.loanPmt = function(nPrincipal, nInterest, nPeriods) {
	return (nPrincipal * nInterest / ((1 - 1 / FormCalc.intRate(nInterest, nPeriods))));
};

FormCalc.intRate = function(nInterest, nPeriods) {
	return Math.pow((1 + nInterest), nPeriods)
};

FormCalc.parseFloatOrThrowError = function(obj) {
	var num = Number(obj);
	if(isNaN(num)){
		throw "<missing or illegal parameter(s).>";
	}else{
		return num;
	}
};

FormCalc.parseFloat = function(obj) {
	var num = Number(obj);
	if(isNaN(num)){
		return 0;
	}else{
		return num;
	}
};

FormCalc.checkResult = function(result) {
	if (result == Number.POSITIVE_INFINITY || result == Number.NEGATIVE_INFINITY){
	   throw "<arithmetic over/underflow.>";
	}else{
		return result;
	}
};

FormCalc.isNumeric = function(input){
	return input!=null && !isNaN(Number(input));
};

FormCalc.checkMinArgs = function(actual, expected) {
	if(actual < expected){
		throw "<missing or illegal parameter(s).>";
	}
};

FormCalc.checkMaxArgs = function(actual, expected) {
	if(actual > expected){
		throw "<missing or illegal parameter(s).>";
	}
};

FormCalc.limitAllNullArgs = function(arrayArgus) {
	var result = new Array();
	for(var i=0;i<arrayArgus.length;i++){
		if(arrayArgus[i]!=null){
			result.push(arrayArgus[i]);
		}
	}
	return result;
};

FormCalc.runWithoutNullArgs = function(func, arrayArgus) {
	var argus = FormCalc.limitAllNullArgs(arrayArgus);
	return argus.length ? func.apply(null,argus) : null;	
};

FormCalc.runWithNumericArgs = function(func, arrayArgus) {
	var argus = new Array();
	for(var i=0;i<arrayArgus.length;i++){
		if(arrayArgus[i]!=null){
        	var el = parseFloat(arrayArgus[i]);
        	if(!isNaN(el)){
        		argus.push(el);
        	}
		}
	}

	return argus.length ? func.apply(null,argus) : null;	
};

/**
 * This function returns the English text equivalent of a given number.
 * 
 */
FormCalc.WordNum=function(){
	var Ones= new Array("Zero","One","Two","Three","Four","Five",
			"Six","Seven","Eight","Nine");
	var Teens =new Array ("Ten","Eleven","Twelve","Thirteen","Fourteen",
			"Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen");
	var Tens= new Array (
			"Zero",  "Ten",   "Twenty",  "Thirty", "Forty",
			"Fifty", "Sixty", "Seventy", "Eighty", "Ninety", "Hundred" );
	var Thousands = new Array (
			"Thousand", "Million",     "Billion",
			"Trillion", "Quadrillion", "Quintillion" );
	var Cents = new Array("Cent"); 
	var Comma=new Array("");
	var Ands  =new Array ("", "And " /* used by FF99 */ );
	var Dollars=new Array ( "Dollar" );
	var Space = " ";
	var Hyphen = "-";
	var QUINTILLION = 1000000000000000000;
	var n=arguments[0];
	var f=arguments[1];
	if(n === null) {
        return null;
    }
    if(isNaN(n)||!isFinite(n)||n<0){
		return "**************"; 
	}
	
	if (f < 0 || 2 < f) {
		f = 0;
	}
	
	var dollars =   n;
	var cents =    Math.floor(((n -  Math.floor(dollars)+ 0.005) * 100));  
	if (cents >= 100) {
		dollars += 1;
		cents -= 100;
	}
	
	var s= new Array();
	var thousands = 6;
	for (var div = QUINTILLION; div >= 1 ; div/=1000) { 
		var number = Math.floor(dollars / div) ; 
		var hundreds = Math.floor(number/ 100) ;
		var tens = Math.floor((number- hundreds * 100) / 10);
		var ones = Math.floor(number- hundreds * 100 - tens * 10);  
                if(number>=1){
                    dollars -= (div * number ); 
                 }
                
                
		if (hundreds >=1) {
			s.push(Ones[hundreds]);
			s.push(Space);
			s.push(Tens[10]);
			s.push(Space);
			if (tens > 0 || ones > 0)
				s.push(Ands[0]);
		}
		if (tens >=1 ) {
			s.push((tens == 1) ? Teens[ones] : Tens[tens]);
			s.push((ones > 0 && tens != 1) ? Hyphen : Space);
		}
		if (ones >=1 && tens != 1) { 
			if (tens > 0 && ones > 0) {
				// safe since Ones contains true literal constants
				var o = Ones[ones];
				//s+=FormCalc.MylowerCase(o);  
				s.push(o.toLowerCase()); 
			}
			else {
				s.push(Ones[ones]);
			}
			s.push(Space);
		}
		thousands--;
		if (thousands >= 0 && number >= 1) {
			s.push(Thousands[thousands]);
			s.push(Comma[0]);
			s.push(Space);
		}
 
  
	}
	//
	// If less than one then use zero.
	//
	if (n < 1.) {
		s.push(Ones[0]);
		s.push(Space);
	}
	//
	// Factor in format:
	//     0 => "One Hundred Twenty-three"
	//     1 => "One Hundred Twenty-three Dollars"
	//     2 => "One Hundred Twenty-three Dollars And Forty Cents"
	//
	if (f == 1 || f == 2) {
		//
		// Append dollar CalcSymbol.
		//
		s.push(Dollars[0]);
		if ( Math.floor(n) != 1)
			s.push('s');
		//
		// Append cents.
		//
		if (f == 2) {
			s.push(Space);
			s.push(Ands[1]);
			var tens =  Math.floor(cents / 10);
			var ones =  Math.floor(cents - tens * 10);
			if (tens > 0) {
				s.push((tens == 1) ? Teens[ones] : Tens[tens]);
			}
			if (tens != 1) {
				if (tens > 0 && ones > 0) {
					// safe since Ones contains true literal constants
					var o = Ones[ones];
					s.push(Hyphen);
					s.push(o.toLowerCase());
				}
				else if (tens == 0) {
					s.push(Ones[ones]);
				}
			}
			s.push(Space);
			s.push(Cents[0]);
			if (cents != 1.)
				s.push('s');
		}
	}
	if(s[s.length-1] == ' '){
		s.pop();		
	}
	return s.join("");
};

FormCalc._Accessor = function(a) {
    if(a && typeof(a) === "object") {
        if(a.className === "field" || a.className === "exclGroup")
            return a.rawValue;
    }
    return a;
};

FormCalc._ArrayAccessor = function(a) {
    if(typeof(a) == "string") {
        var indexArray = a.lastIndexOf("]")+ 1,
            node = a.substr(0, indexArray),
            propIndex = a.indexOf(".",indexArray),
            prop = propIndex == -1 ? "" : a.substr(propIndex + 1, a.length),
            ctxNode = xfalib.runtime.xfa._contextNode(),
            list = ctxNode.resolveNodes(node),
            retArray = []
        for(var i = 0;i<list.length;i++) {
            var item = list.item(i),
                val = prop.length ? this._Accessor(item[prop]) :this._Accessor(item);
            retArray.push(val);
        }
        if(retArray.length == 1)
            return retArray[0]
        else
            return retArray;
    }
    return a;
};

FormCalc.epoch = new Date(1900,0,1)
FormCalc.epochTime = FormCalc.epoch.getTime()
FormCalc.numMillisInDay = 24*60*60*1000
FormCalc.DateFormats= ["med","short","med","long","full"]

FormCalc.num2date = function(n,fmt,locale) {
    function pad2(num) {
        return (+num)>9 ? num+"" : "0"+num;
    }
    locale = locale || "en_US"
    fmt = fmt || FormCalc.DateFmt(0,locale);
    var epoch = new Date(1900,0,1)
    epoch.setDate(n);
    var inputDate = epoch.getFullYear()+"-"+pad2((epoch.getMonth()+1))+"-"+pad2(epoch.getDate());
    return xfalib.ut.PictureFmt.formatDate(inputDate,fmt,locale);
}

FormCalc.date = function() {
    return Math.ceil((new Date().getTime() - this.epochTime)/this.numMillisInDay)
}

FormCalc.DateFmt = function(symbol,locale) {
    symbol = symbol || 0
    locale = locale || "en_US"
    return xfalib.script.Xfa.Instance._getLocaleSymbols(locale,"datePatterns."+FormCalc.DateFormats[symbol])
};