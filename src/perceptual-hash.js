// generate perceptual hashes of images (ahash, dhash)
var PerceptualHash = (function() {
	// creates a grayscale image from the specified element, width, and height.
	function createImage(element, width, height, isGrayscale)
	{
		if(isGrayscale === undefined)
			isGrayscale = true;
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		var ctx = canvas.getContext('2d');
		// draw the element to the canvas - the browser handles scaling for us
		ctx.drawImage(element, 0, 0, width, height);
		// get the raw pixel data from the image
		var data = ctx.getImageData(0, 0, width, height).data;
		if(!isGrayscale) return data;

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

	// difference hash of an element
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

	// creates a uniqueness number for comparing frame uniqueness
	// does it work ??? i don't know
	function cHash(element)
	{
		var pixels = createImage(element, 16, 16, false);

		// compute the average color
		var rSum = 0;
		var gSum = 0;
		var bSum = 0;
		for(var i = 0; i < pixels.length - 3; i += 3)
		{
			rSum += pixels[i] || 0;
			gSum += pixels[i - 1] || 0;
			bSum += pixels[i - 2] || 0;
		}
		var averageColor = [
			Math.floor(rSum / pixels.length), 
			Math.floor(gSum / pixels.length), 
			Math.floor(bSum / pixels.length)
		];
		var totalDistanceFromAverage = 0;
		var uniqueColors = {};

		for(var i = 0; i < pixels.length - 3; i += 3)
		{
			// sum together the distance from average for every pixel
			var distance = 0;
			distance += Math.abs(pixels[i] - averageColor[0]);
			distance += Math.abs(pixels[i + 1] - averageColor[1]);
			distance += Math.abs(pixels[i + 2] - averageColor[2]);
			totalDistanceFromAverage += distance;

			// add to the hash of unique colors
			var colorStr = pixels[i] + ',' + pixels[i + 1] + ',' + pixels[i + 2];
			uniqueColors[colorStr] = true;
		}

		var uniqueCount = Object.keys(uniqueColors).length;
		return uniqueCount + totalDistanceFromAverage;
	}

	return {
		aHash: aHash,
		dHash: dHash,
		cHash: cHash,
		createImage: createImage
	};
})();