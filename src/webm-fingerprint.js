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
		// how far to jump each frame
		var frameJump = 1 / (config.fps || 24);
		// are we still finding the best frame or have we finished that already?
		var checkingFrames = true;
		// here's where we put the frames we've checked
		var checkedFrames = [];

		// check a frame
		// if we're done, generate a hash of the best frame
		function checkFrames()
		{
			// generate a hash of the best frame
			if(!checkingFrames)
			{
				checkingFrames = true;
				return generateHashes();
			}
			// if we've generated enough frames, seek to it
			// so next time this function runs, we generate a hash of it
			if(checkedFrames.length >= 24 || element.currentTime == element.duration)
			{
				checkingFrames = false;
				// find the highest frame's index
				var highestFrameIndex = KeyframeExtractor.findShotBoundary(checkedFrames);
				element.currentTime = (Math.floor(element.currentTime) - (checkedFrames.length * frameJump)) + (highestFrameIndex * frameJump);
				checkedFrames = [];
				return;
			}
			// push the current hash and do it again
			checkedFrames.push(KeyframeExtractor.calculateImageEntropy(element));
			element.currentTime += frameJump;
		}

		function generateHashes()
		{
			if(generateAHash)
			{
				var hash = PerceptualHash.aHash(element);
				// make sure it's not a duplicate
				if(aHashes.indexOf(hash) == -1)
					aHashes.push(hash);
			}
			if(generateDHash)
			{
				var hash = PerceptualHash.dHash(element);
				// make sure it's not a duplicate
				if(dHashes.indexOf(hash) == -1)
					dHashes.push(hash);
			}
			// keep going until we're at the end, or one second from the end
			if(element.duration - element.currentTime > 1)
				element.currentTime = Math.floor(element.currentTime) + 1;
			else
			{
				element.removeEventListener('seeked', checkFrames);
				return callback(null, {
					aHashes: aHashes,
					dHashes: dHashes
				});
			}
		}
		// every time the "seeked" event fires, check the frame.
		// we can't generate a hash as soon as we seek, so this makes sure the video has loaded before we try.
		element.addEventListener('seeked', checkFrames);
		checkFrames();
	}

	// generate the hashes of the element
	// if element is an object, it will be interpreted as a config object:
	// 	- element: the element to hash
	// 	- aHash: generate an average hash
	// 	- dHash: generate a difference hash
	// 	- fps: the fps of the video
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