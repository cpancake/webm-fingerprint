var PerceptualHash = (function() {
	function createImage(element, width, height)
	{
		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(element, 0, 0, width, height);
		var data = ctx.getImageData(0, 0, width, height).data;
		var grayscale = [];
		for(var i = 0; i < (height * width) * 4; i += 4)
		{
			var average = (data[i] + data[i + 1] + data[i + 2]) / 3;
			average *= (255 / data[i + 3]);
			grayscale.push(Math.floor(average));
		}
		return grayscale;
	}

	function aHash(element)
	{
		var pixels = createImage(element, 8, 8);
		var sum = pixels.reduce(function(a, b) { return a + b; });
		var avg = sum / pixels.length;
		var bits = new BitArray(64);
		for(var i = 0; i < 64; i++)
			bits.set(i, pixels[i] >= avg);
		return bits.toHexString();
	}

	function dHash(element)
	{
		var pixels = createImage(element, 9, 8);
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