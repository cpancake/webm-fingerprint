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