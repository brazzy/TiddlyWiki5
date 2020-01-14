/*\
title: $:/plugins/tiddlywiki/scale-rotate-imports/startup.js
type: application/javascript
module-type: startup

Startup initialisation

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.startup = function() {
	console.log("scale-rotate-imports registered!");
	$tw.hooks.addHook("th-importing-file", function(info) {		
		console.log("scale-rotate-imports called!");
		if(info.type !== ("image/jpeg")){
			console.log("no scale-rotate-imports action for type ", info.type);
			return false;
		}
		scaleRotate(info);
		return true;
	});
};
})();

const MAX_WIDTH = 900;

function scaleRotate(info) {
	// TODO: load jimp dynamically!
	
	console.log("Scaling and rotating", info.file.path)
	var reader = new FileReader();
	reader.onload = async function(event) {
		try {
			var result = [];
			var text = event.target.result
			var image = await jimp.read(text);
			console.log("size before: " + info.file.size);
			image.quality(70);
			
			if(image.bitmap.width > MAX_WIDTH) {
				await image.resize(MAX_WIDTH, jimp.AUTO);
			}
			
			var scaledContent = await image.getBase64Async(info.type);
			scaledContent = scaledContent.substring("data:image/jpeg;base64,".length);
			console.log("size after: " + scaledContent.length);
			
			result.push({
				"title": info.file.name,
				"type": info.type,
				"text": scaledContent
			});
			
			await image.resize(50, jimp.AUTO);		
			scaledContent = await image.getBase64Async(info.type);
			scaledContent = scaledContent.substring("data:image/jpeg;base64,".length);
			console.log("thumbnail size: " + scaledContent.length);
			
			result.push({
				"title": "thumbnail_" + info.file.name,
				"type": info.type,
				"isThumbnail": true,
				"text": scaledContent
			});
			
			info.callback(result);
		} catch(err) {
			console.log('Error caught: ', err);
		}			
	};
	reader.readAsDataURL(info.file);
}