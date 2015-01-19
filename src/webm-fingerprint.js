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