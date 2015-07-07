// find keyframes!
var KeyframeExtractor = (function() {
	// creates a histogram from an element
	function createHistogram(element)
	{
		var image = PerceptualHash.createImage(element, element.videoWidth, element.videoHeight, true);
		var histogram = {};
		// populate the histogram
		for(var i = 0; i < 255; i++)
			histogram[i] = 0;

		// fill the histogram with the data from the image
		image.forEach(function(pixel) {
			histogram[pixel]++;
		});

		return Object.keys(histogram).map(function(k) { return histogram[k]; });
	}

	// adapted from http://brainacle.com/calculating-image-entropy-with-python-how-and-why.html
	function calculateImageEntropy(element)
	{
		var histogram = createHistogram(element);
		var probability = histogram.map(function(h) {
			return h / histogram.length;
		}).filter(function(h) { return h > 0; });

		return probability.map(function(h) {
			return h * (Math.log(h) / Math.LN2);
		}).reduce(function(a, b) {
			return a + b;
		});
	}

	// finds the highest difference between frames and returns it
	function findShotBoundary(frames)
	{
		var entropyDifference = [0];
		for(var i = 1; i < frames.length; i++)
			entropyDifference.push(Math.abs(frames[i] - frames[i - 1]));
		var highestShotIndex = -1;
		var highestShotValue = 0;
		for(var i = 0; i < frames.length; i++)
			if(highestShotIndex == -1 || highestShotValue < entropyDifference[i])
			{
				highestShotIndex = i;
				highestShotValue = entropyDifference[i];
			}
		return highestShotIndex;
	}

	return {
		calculateImageEntropy: calculateImageEntropy,
		createHistogram: createHistogram,
		findShotBoundary: findShotBoundary
	};
})();