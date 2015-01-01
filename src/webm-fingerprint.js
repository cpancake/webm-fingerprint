var WebMFingerprint = (function() {
	function processElement(element, callback)
	{
		element.currentTime = 0;
		var dHashes = [];
		var aHashes = [];
		function generateHashes()
		{
			aHashes.push(PerceptualHash.aHash(element));
			dHashes.push(PerceptualHash.dHash(element));
			if(element.duration - element.currentTime > 1)
				element.currentTime += 1;
			else
				return callback(null, {
					aHashes: aHashes,
					dHashes: dHashes
				});
		}
		element.addEventListener('seeked', generateHashes);
		generateHashes();
	}

	function fingerprint(element, callback)
	{
		var duration = element.duration;
		if(duration == Infinity)
			return callback("Cannot fingerprint streaming media.");
		if(duration == undefined || duration == NaN)
			return callback("Video length not available.");
		if(duration == 0 || element.readyState == 0)
			return element.addEventListener('loadedmetadata', function(e) {
				processElement(element, callback);
			});
		processElement(element, callback);
	}

	return fingerprint;
})();

if(typeof module !== 'undefined' && module.exports)
	module.exports = WebMFingerprint;