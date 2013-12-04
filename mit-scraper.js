var request = require("request");
var fs = require("fs");
var cheerio = require('cheerio');
var _ = require('underscore');
var courseLinks = [];


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
			var $ = cheerio.load(body);
			if ($('ul.specialfeatures').text().indexOf('Transcript') != -1) {
				videoLink = 'http://ocw.mit.edu/' + $('ul.specialfeatures').find('a')["0"].attribs.href;

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
								$('.tabContent').each(function(){
									if (this['0'].children.length > 40 ){
										_.each(this['0'].children, function(list, i){
											if (list.children && list.children[0]) {
												console.log(list.children[0].data + '/n');
											}
										});
									};
								});
							})
						})
					}

					
				});

			}
		});

});

_.each(courseLinks, function(list, i) {

})


