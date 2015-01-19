# webm-fingerprint

This library is for fingerprinting WebM files in the browser. It uses an HTML5 media element and canvas combined with an average hash and a difference hash to allow you to compare different video files without having to upload them to your server.

This could, in theory, be used for other files than WebM. However, the intent of this library is to be used with WebM files. Also, as far as I know, you can't create a media element from a file reader data URL with other video formats; only WebM.

## Usage
You can install this library with bower:
```
bower install webm-fingerprint
```

You can also download the source files from the `build` directory and put them in your project.

You can use this library with browserify or with regular globals:
```javascript
var webmFingerprint = require('./webm-fingerprint'); // browserify
var webmFingerprint = WebMFingerprint; // or just use WebMFingerprint directly.
```
`WebMFingerprint` is a function that accepts a media element and a callback:
```javascript
WebMFingerprint($('video')[0], function(err, result) {
    if(err) throw err;
    console.log(result); // see below
});
```
The `result` object will contain two fields:
* `aHashes` - an array of [average hashes](http://www.hackerfactor.com/blog/index.php?/archives/432-Looks-Like-It.html), one for each second of video.
* `dHashes` - an array of [difference hashes](http://www.hackerfactor.com/blog/index.php?/archives/529-Kind-of-Like-That.html), one for each second of video.

Note that the function doesn't preserve whatever the current position of the media element is; you'll have to preserve this and restore it when the callback is called if you want to.

You can also specify which hash you want if you only want one type. You can specify this in a config object instead of the element:
```javascript
WebMFingerprint({
	aHash: true,
	dHash: false,
	element: $('video')[0]
}, function(err, result) {
    if(err) throw err;
    console.log(result); // see below
});
```

## License
```
The MIT License (MIT)

Copyright (c) 2014 Andrew Rogers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```