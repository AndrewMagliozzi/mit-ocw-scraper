var request = require("request");
var fs = require("fs");
var cheerio = require('cheerio');
var _ = require('underscore');
var JSONArray = [];

// TODO: Create a directory for each course - w/ a file of metadata (uri etc.)
//    A directory for each lecture with the file and the text

var getAllMITCourseLinks = function(callback) { // returns all the course links from the MIT courese page
	var courseData = [];
	var data = {};
	var course, subject, instructor, semester;

	request({
		uri: "http://oyc.yale.edu/courses"
		}, function(error, response, body) {
			var $ = cheerio.load(body);

			$('tr.odd, tr.even').each(function(){
				data.subject = this.find('td.views-field-field-course-department-nid').text().substr(13).trim();
				data.course = this.find('td.views-field-title').text().substr(13).trim();
				data.instructor = this.find('td.views-field-field-course-professors-name-value').text().substr(13).trim();
				data.semester = this.find('td.views-field-phpcode').text().substr(19).trim();
				data.courseLink = 'http://oyc.yale.edu' + this.find('a')['0'].attribs.href;
				courseData.push(data);
				data = {};
			});
			
			_.each(courseData, function(element, index, list) {
				callback(element);
			});
	});

};


var getMITCourseMediaData = function(object) { // returns citation and media links from one coures page
	var data = object;
	var lectureArray = [];
	var lectures = {};

	request({
		uri: data.courseLink + '#sessions'
	}, function(error, response, body) {
		var $ = cheerio.load(body);

		$('tr.odd, tr.even').each(function(){
			if (this.find('a')['0'].attribs.href.indexOf('/exam') === -1 ) {
				lectures.lecture = this.find('td.views-field-field-session-display-number-value').text().trim();
				lectures.title = this.find('a').text().trim();
				lectures.link = 'http://oyc.yale.edu' + this.find('a')['0'].attribs.href;
				lectureArray.push(lectures);
				data.lectures = lectureArray;
				lectures = {};
			}
		})
		// console.log(data);
		getMediaAndTranscript(data);
	});
};

var getMediaAndTranscript = function (object) { // change object back to object
	var json = object;

	_.each(json.lectures, function(element, index, list){

		request({
			uri: element.link
		}, function(error, response, body) {
			var $ = cheerio.load(body);
			if ($('#course_media_transcript').length !== 0) {
				element.htmlTranscript = 'http://oyc.yale.edu' + $('#course_media_transcript').attr('onclick').toString().substr(40).slice(0, -65);
				element.mp3Link = $('#course_media_audio')['0'].attribs.href;
			} else {
				element.htmlTranscript = 'no media available for this lecture';
				element.mp3Link = 'no media available for this lecture';
				console.log('No media available for ' + json.course, ': ', element.title);
			}
		});
	});
	fs.writeFileSync(json.course + '.json', JSON.stringify(json));
	console.log('finished with ', json.course);

};

getAllMITCourseLinks(getMITCourseMediaData);

