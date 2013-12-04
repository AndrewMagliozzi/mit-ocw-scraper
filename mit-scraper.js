var request = require("request");
var fs = require("fs");
var cheerio = require('cheerio');
var _ = require('underscore');
var courseLinks = [];

// TODO: Create a directory for each course - w/ a file of metadata (uri etc.)
//    A directory for each lecture with the file and the text
 

request({
	uri: "http://ocw.mit.edu/courses/audio-video-courses/"
	}, function(error, response, body) {
		var $ = cheerio.load(body);

		$('.preview').each(function(){
			courseLinks.push('http://ocw.mit.edu/' + this['0'].attribs.href);
		});

		courseLinks = _.uniq(courseLinks);

		console.log(courseLinks[6]);

		request({
			uri: courseLinks[2]
		}, function(error, response, body) {
			var videoLink;
			var subject
			var $ = cheerio.load(body);
			if ($('ul.specialfeatures').text().indexOf('Transcript') != -1) {
				videoLink = 'http://ocw.mit.edu/' + $('ul.specialfeatures').find('a')["0"].attribs.href;
				subject = videoLink.split('/')[4];

				request({
					uri: 'http://ocw.mit.edu/courses/biology/7-012-introduction-to-biology-fall-2004/video-lectures/'
				}, function(error, response, body){
					var $ = cheerio.load(body);
					if (!(videoLink.indexOf('video-lectures') != -1)) { // if it's a link to many lecture videos
						$('a.medialink').each(function(){
							request({
								uri: 'http://ocw.mit.edu/' + this['0'].attribs.href
							}, function(error, response, body) {
								var $ = cheerio.load(body);
								var transcript = '';
								console.log('srt link: ', $('.tabContent').find('h3.subsubhead').last().next().children().children()['0'].attribs.href);
							})
						})
					}
				});

			}
		});

});

_.each(courseLinks, function(list, i) {

})


