/**
 * JavaScript BitArray - v0.2.0
 *
 * Licensed under the revised BSD License.
 * Copyright 2010-2012 Bram Stein
 * All rights reserved.
 */

/**
 * Creates a new empty BitArray with the given length or initialises the BitArray with the given hex representation.
 */
var BitArray = function (size, hex) {
    this.values = [];

    if (hex) {
        hex = hex.slice(/^0x/.exec(hex) ? 2 : 0);

        if (hex.length * 4 > this.length) {
            throw 'Hex value is too large for this bit array.'
        } else if (hex.length * 4 < this.length) {
            // pad it
            while(hex.length * 4 < this.length) {
                hex = '0' + hex;
            }
        }

        for (var i = 0; i < (hex.length / 8); i++) {
            var slice = hex.slice(i * 8, i * 8 + 8);
            this.values[i] = parseInt(slice, 16);
        }
    } else {
        for (var i = 0; i < Math.ceil(size / 32); i += 1) {
            this.values[i] = 0;
        }
    }
};

/**
 * Returns the total number of bits in this BitArray.
 */
BitArray.prototype.size = function () {
	return this.values.length * 32;
};

/**
 * Sets the bit at index to a value (boolean.)
 */
BitArray.prototype.set = function (index, value) {
	var i = Math.floor(index / 32);
	// Since "undefined | 1 << index" is equivalent to "0 | 1 << index" we do not need to initialise the array explicitly here.
	if (value) {
		this.values[i] |= 1 << index - i * 32;
	} else {
		this.values[i] &= ~(1 << index - i * 32);
	}
	return this;
};

/**
 * Toggles the bit at index. If the bit is on, it is turned off. Likewise, if the bit is off it is turned on.
 */
BitArray.prototype.toggle = function (index) {
	var i = Math.floor(index / 32);
	this.values[i] ^= 1 << index - i * 32;
	return this;
};

/**
 * Returns the value of the bit at index (boolean.)
 */
BitArray.prototype.get = function (index) {
	var i = Math.floor(index / 32);
	return !!(this.values[i] & (1 << index - i * 32));
};

/**
 * Resets the BitArray so that it is empty and can be re-used.
 */
BitArray.prototype.reset = function () {
	this.values = [];
	return this;
};

/**
 * Returns a copy of this BitArray.
 */
BitArray.prototype.copy = function () {
	var cp = new BitArray();
	cp.length = this.length;
	cp.values = [].concat(this.values);
	return cp;
};

/**
 * Returns true if this BitArray equals another. Two BitArrays are considered
 * equal if both have the same length and bit pattern.
 */
BitArray.prototype.equals = function (x) {
	return this.values.length === x.values.length &&
		this.values.every(function (value, index) {
		return value === x.values[index];
	});
};

/**
 * Returns the JSON representation of this BitArray.
 */
BitArray.prototype.toJSON = function () {
	return JSON.stringify(this.values);
};

/**
 * Returns a string representation of the BitArray with bits
 * in logical order.
 */
BitArray.prototype.toString = function () {
	return this.toArray().map(function (value) {
		return value ? '1' : '0';
	}).join('');
};

/**
 * Returns a string representation of the BitArray with bits
 * in mathemetical order.
 */
BitArray.prototype.toBinaryString = function () {
	return this.toArray().map(function (value) {
		return value ? '1' : '0';
	}).reverse().join('');
};

/**
 * Returns a hexadecimal string representation of the BitArray
 * with bits in logical order.
 */
BitArray.prototype.toHexString = function () {
  var result = [];

  for (var i = 0; i < this.values.length; i += 1) {
    result.push(('00000000' + (this.values[i] >>> 0).toString(16)).slice(-8));
  }
  return result.join('');
};

/**
 * Convert the BitArray to an Array of boolean values.
 */
BitArray.prototype.toArray = function () {
	var result = [];

    for (var i = 0; i < this.values.length * 32; i += 1) {
        result.push(this.get(i));
    }
	return result;
};

/**
 * Returns the total number of bits set to one in this BitArray.
 */
BitArray.prototype.count = function () {
	var total = 0;

	// If we remove the toggle method we could efficiently cache the number of bits without calculating it on the fly.
	this.values.forEach(function (x) {
		// See: http://bits.stephan-brumme.com/countBits.html for an explanation
		x  = x - ((x >> 1) & 0x55555555);
		x  = (x & 0x33333333) + ((x >> 2) & 0x33333333);
		x  = x + (x >> 4);
		x &= 0xF0F0F0F;

		total += (x * 0x01010101) >> 24;
	});
	return total;
};

/**
 * Inverts this BitArray.
 */
BitArray.prototype.not = function () {
	this.values = this.values.map(function (v) {
		return ~v;
	});
	return this;
};

/**
 * Bitwise OR on the values of this BitArray using BitArray x.
 */
BitArray.prototype.or = function (x) {
	if (this.values.length !== x.values.length) {
		throw 'Arguments must be of the same length.';
	}
	this.values = this.values.map(function (v, i) {
		return v | x.values[i];
	});
	return this;
};

/**
 * Bitwise AND on the values of this BitArray using BitArray x.
 */
BitArray.prototype.and = function (x) {
	if (this.values.length !== x.values.length) {
		throw 'Arguments must be of the same length.';
	}
	this.values = this.values.map(function (v, i) {
		return v & x.values[i];
	});
	return this;
};

/**
 * Bitwise XOR on the values of this BitArray using BitArray x.
 */
BitArray.prototype.xor = function (x) {
	if (this.values.length !== x.values.length) {
		throw 'Arguments must be of the same length.';
	}
	this.values = this.values.map(function (v, i) {
		return v ^ x.values[i];
	});
	return this;
};
// generate perceptual hashes of images (ahash, dhash)
var PerceptualHash = (function() {
	// creates a grayscale image from the specified element, width, and height.
	function createImage(element, width, height)
	{
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		var ctx = canvas.getContext('2d');
		// draw the element to the canvas - the browser handles scaling for us
		ctx.drawImage(element, 0, 0, width, height);
		// get the raw pixel data from the image
		var data = ctx.getImageData(0, 0, width, height).data;
		var grayscale = [];
		for(var i = 0; i < (height * width) * 4; i += 4)
		{
			// average together the components of the image to convert it to grayscale
			var average = (data[i] + data[i + 1] + data[i + 2]) / 3;
			// multiply by alpha
			average *= (255 / data[i + 3]);
			grayscale.push(Math.floor(average));
		}
		return grayscale;
	}

	// average hash of an element
	function aHash(element)
	{
		var pixels = createImage(element, 8, 8);
		// sum up all the pixels and average them
		var sum = pixels.reduce(function(a, b) { return a + b; });
		var avg = sum / pixels.length;
		// create a bitarray with each bit corresponding to each pixel
		// being greater or less than the average
		var bits = new BitArray(64);
		for(var i = 0; i < 64; i++)
			bits.set(i, pixels[i] >= avg);
		return bits.toHexString();
	}

	function dHash(element)
	{
		var pixels = createImage(element, 9, 8);
		// create a bitarray with each bit corresponding to whether or not 
		// the pixel is less than the pixel to the right
		var bits = new BitArray(64);
		for(var i = 0; i < 64; i++)
			bits.set(i, pixels[i] < pixels[i + 1]);
		return bits.toHexString();
	}

	return {
		aHash: aHash,
		dHash: dHash,
		createImage: createImage
	};
})();
// fingerprint webms
var WebMFingerprint = (function() {
	function processElement(element, config, callback)
	{
		var generateAHash = true;
		var generateDHash = true;

		// man this is ugly but there's no way to short circuit this
		if(config.aHash === false)
			generateAHash = false;
		if(config.dHash === false)
			generateDHash = false;

		// start at the beginning
		element.currentTime = 0;
		var dHashes = [];
		var aHashes = [];
		function generateHashes()
		{
			if(generateAHash)
				aHashes.push(PerceptualHash.aHash(element));
			if(generateDHash)
				dHashes.push(PerceptualHash.dHash(element));
			// keep going until we're at the end, or one second from the end
			if(element.duration - element.currentTime > 1)
				element.currentTime += 1;
			else
				return callback(null, {
					aHashes: aHashes,
					dHashes: dHashes
				});
		}
		// every time the "seeked" event fires, generate a hash.
		// we can't generate a hash as soon as we seek, so this makes sure the video has loaded before we try.
		element.addEventListener('seeked', generateHashes);
		generateHashes();
	}

	// generate the hashes of the element
	// if element is an object, it will be interpreted as a config object:
	// 	- element: the element to hash
	// 	- aHash: generate an average hash
	// 	- dHash: generate a difference hash
	function fingerprint(element, callback)
	{
		var config = {};
		// if element isn't actually an element
		if(element.nodeName == undefined)
		{
			var config = element;
			element = config.element;
			if(!config.element)
				return callback('No element specified.');
		}
		var duration = element.duration;
		// this is an internet stream - we can't do anything with this
		if(duration == Infinity)
			return callback("Cannot fingerprint streaming media.");
		// something's wrong
		if(duration == undefined || duration == NaN)
			return callback("Video length not available.");
		// the video's duration isn't available (it probably hasn't loaded yet)
		if(duration == 0 || element.readyState == 0)
			// process the element when it's ready to be processed
			return element.addEventListener('loadedmetadata', function(e) {
				processElement(element, config, callback);
			});
		processElement(element, config, callback);
	}

	return fingerprint;
})();

if(typeof module !== 'undefined' && module.exports)
	module.exports = WebMFingerprint;