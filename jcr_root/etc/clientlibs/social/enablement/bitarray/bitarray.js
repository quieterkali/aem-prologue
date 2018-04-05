/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2015 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 *************************************************************************/

CQ.Communities = CQ.Communities || {};
CQ.Communities.Enablement = CQ.Communities.Enablement || {};
CQ.Communities.Enablement.Utils = CQ.Communities.Enablement.Utils || {};

(function(EnablementUtils) {
    "use strict";

    // Constructor
    function BitArray(size, bits) {
        // Private field - array for our bits
        this.mBits = [];
        this.leftover = BitArray.SEGMENT_LENGTH;
        this.progress = 0;

        // .ctor - initialize as a copy of an array of true/false or from a numeric value
        if (bits && bits.length) {
            for (var i = 0; i < bits.length; i++) {
                this.mBits.push(bits[i] === BitArray.ON ? BitArray.ON : BitArray.OFF);
            }
        } else if (!isNaN(bits)) {
            this.mBits = BitArray.shred(bits).mBits;
        }

        if (size && this.mBits.length !== size) {
            if (this.mBits.length < size) {
                for (var j = this.mBits.length; j < size; j++) {
                    this.mBits.push(BitArray.OFF);
                }
            } else {
                for (var k = size; k > this.mBits.length; k--) {
                    this.mBits.pop();
                }
            }
        }
    }

    BitArray.prototype.turnOn = function(index) {
        this.setAt(index, BitArray.ON);
    };

    BitArray.prototype.setAt = function(index, value) {
        if (index < this.mBits.length) {
            this.mBits[index] = value;
        }
    };

    BitArray.prototype.getAt = function(index) {
        if (index < this.mBits.length) {
            return this.mBits[index];
        }
        return BitArray.OFF;
    };

    // Get the numeric value
    BitArray.prototype.toNumber = function() {
        var pow = 0;
        var n = 0;
        for (var i = this.mBits.length - 1; i >= 0; i--) {
            if (this.mBits[i] === BitArray.ON) {
                n += Math.pow(2, pow);
            }
            pow++;
        }
        return n;
    };

    // Get the array object string
    BitArray.prototype.toObjectString = function() {
        return JSON.stringify(this.mBits);
    };

    // Get the string representation ("101010")
    BitArray.prototype.toString = function() {
        var s = "";
        for (var i = 0; i < this.mBits.length; i++) {
            s = s.concat(this.mBits[i] === BitArray.ON ? "1" : "0");
        }
        return s;
    };

    // Get the completion percentage
    BitArray.prototype.toCompletionPercentage = function() {
        var watched = 0;
        for (var i = 0; i < this.mBits.length; i++) {
            if (this.mBits[i] === BitArray.ON) {
                watched++;
            }
        }
        watched = 100 * (watched / this.mBits.length);
        return Math.round(watched);
    };

    BitArray.prototype.getProgress = function() {
        return this.progress;
    };

    BitArray.prototype.getLeftover = function() {
        return this.leftover;
    };

    // Get the number of total seconds watched so far
    BitArray.prototype.getSecondsWatched = function() {
        var watched = 0;
        for (var i = 0; i < this.mBits.length; i++) {
            if (this.mBits[i] === BitArray.ON) {
                watched++;
            }
        }
        return watched;
    };

    /*
     * Get the collection of [a,b] tuples representing the video
     * segments that have been watched so far where 'a' is the
     * second the viewed segment began and 'b' is the second the
     * viewed segment ended.
     */
    BitArray.prototype.getRanges = function() {
        var arr = [];
        var start;
        var isInRange = false;

        // Loop over every second in the BitArray
        for (var i = 0; i < this.mBits.length; i++) {
            if (this.mBits[i] === BitArray.ON) {

                /*
                 * If we hit a bit that is 'on', this is a second that's
                 * been watched.  If the previous second was also watched
                 * (isInRange=true), we don't need to do anything.  Otherwise,
                 * we need to mark this as the start of a watched segment and
                 * set isInRange=true.
                 */
                if (!isInRange) {
                    isInRange = true;
                    start = i;
                }
            } else {
                /*
                 * If we hit a bit that is 'off', this is a second that has
                 * not yet been watched.  If the previous second was also
                 * unwatched (isInRange=false), we don't need to do anything.
                 * Otherwise, we need to mark this as the end of a watched
                 * segment and set isInRange=false.
                 */
                if (isInRange) {
                    isInRange = false;
                    arr.push([start, i - 1]);
                }
            }
        }

        /*
         * We need to account for the case where the last second in the video
         * has been watched (isInRange=true).  In that case, we need to mark
         * that second as the end of a watched segment.
         */
        if (isInRange) {
            arr.push([start, i - 1]);
        }

        return arr;
    };

    //
    BitArray.prototype.serialize = function() {
        var i = 0;
        var bits;
        var length;
        var leadingZeros;
        var arr = [];
        var obj;

        while (i < this.mBits.length) {
            length = this.mBits.length - i < BitArray.SEGMENT_LENGTH ? this.mBits.length - i :
                BitArray.SEGMENT_LENGTH;
            bits = new BitArray(BitArray.SEGMENT_LENGTH, 0);
            leadingZeros = -1;
            obj = [];
            for (var j = 0; j < BitArray.SEGMENT_LENGTH; j++) {
                if (leadingZeros === -1 && this.getAt(i + j) === BitArray.ON) {
                    leadingZeros = j;
                }

                bits.setAt(j, this.getAt(i + j));
            }

            leadingZeros = (leadingZeros === -1) ? 0 : leadingZeros;

            obj.push(leadingZeros);
            obj.push(bits.toNumber());
            arr.push(obj);
            i += BitArray.SEGMENT_LENGTH;
        }

        this.leftover = length < BitArray.SEGMENT_LENGTH ? length : 0;
        this.progress = this.getSecondsWatched();

        return JSON.stringify(arr);
    };

    BitArray.deserialize = function(state, leftover) {
        var arr = JSON.parse(state);
        var bits = leftover === 0 ? new BitArray((arr.length * BitArray.SEGMENT_LENGTH), 0) : new BitArray(
            ((arr.length - 1) * BitArray.SEGMENT_LENGTH) + leftover, 0);
        var segment;
        var length;
        for (var i = 0; i < arr.length; i++) {

            if (arr[i][1] === 0) {
                // unwatched segment
                segment = new BitArray(BitArray.SEGMENT_LENGTH, 0);
            } else {
                // watched segment
                segment = this.shred(arr[i][1]);
            }

            if (i === arr.length - 1 && leftover !== 0) {
                length = leftover;
            } else {
                length = BitArray.SEGMENT_LENGTH;
            }

            for (var j = arr[i][0]; j < length; j++) {
                bits.setAt(i * BitArray.SEGMENT_LENGTH + j, segment.getAt(j - arr[i][0]));
            }
        }

        return bits;
    };

    // Convert a bit array string object into a bit array
    BitArray.parse = function(obj) {
        var arr = JSON.parse(obj);
        return new BitArray(arr.length, arr);
    };

    // Convert a number into a bit array
    BitArray.shred = function(number) {
        var bits = [];
        var q = number;
        do {
            bits.push(q % 2);
            q = Math.floor(q / 2);
        } while (q > 0);

        return new BitArray(bits.length, bits.reverse());
    };

    /* BitArray PRIVATE STATIC CONSTANTS */
    BitArray.ON = 1;
    BitArray.OFF = 0;
    BitArray.SEGMENT_LENGTH = 30;

    EnablementUtils.BitArray = BitArray;
})(CQ.Communities.Enablement.Utils);
