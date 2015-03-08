var request = require("request");
var fs = require("fs");
var cheerio = require('cheerio');
var _ = require('underscore');
var JSONArray = [];


var getMITDepartments = function(callback) {
	var deptObjects = [];
	var courseObj = {};

	request({
		uri: "http://ocw.mit.edu/courses/find-by-department/"
		}, function(error, response, body) {
			var $ = cheerio.load(body);

			$('ul.deptList').children().children().each(function(){
				courseObj.subject = this.text();
				courseObj.departmentLink = 'http://ocw.mit.edu' + this['0'].attribs.href;
				deptObjects.push(courseObj);
				courseObj = {};
			});
			
			_.each(deptObjects, function(element, index, list) {
				callback(element);
			});
	});
};


var getAllMITCourseLinks = function(courseObj) { // returns all the course links from the MIT courese page
	var deptObject = courseObj;
	deptObject['courses'] = [];
	var newObj = {};

	request({
		uri: deptObject.departmentLink
		}, function(error, response, body) {
			var $ = cheerio.load(body);
			var courseDomElements = $('a.preview');

			for (var i = 1; i < courseDomElements.length; i += 3) {
				newObj.courseLink = 'http://ocw.mit.edu/' + courseDomElements[i].attribs.href;
				newObj.courseStub = newObj.courseLink.split('/').pop();
				newObj.courseTitle = courseDomElements[i].children[0].data.trim().split('\n')[0];
				deptObject.courses.push(newObj);
				newObj = {};
			};

			getMITCourseMediaData(deptObject);

	});

};


var getMITCourseMediaData = function(deptObject) { // returns citation and media links from one coures page
	var data = {};
	var mediaData = deptObject;
	var notesLink;

	_.each(mediaData.courses, function(element, index, list) {
		request({
			uri: element.courseLink
		}, function(error, response, body) {
			var $ = cheerio.load(body);
			list[index].professor = '';
			if ($('#course_nav').text().indexOf('Lecture Notes') != -1) { // does the course have notes?
				notesLink = element.courseLink + '/lecture-notes/';
				if ($('p.ins').length > 1) {
					$('p.ins').each(function(i, element){
						i < $('p.ins').length - 1 ? list[index].professor = list[index].professor + $(element).text().trim() + ', ' : list[index].professor = list[index].professor + $(element).text().trim();
					});
				} else {
					list[index].professor = $('p.ins').text();
				}
				request({
					uri: notesLink
				}, function(error, response, body) {
					$ = cheerio.load(body);
					var noteURL;
					list[index].noteLinks = [];
					$('a').each(function () {
						var link = this['0'].attribs.href;
						if (link && link.indexOf('/lecture-notes/') !== -1 && link.indexOf('.pdf') !== -1) { // make sure it's a link to a PDF
							data.link = 'http://ocw.mit.edu' + link;
							data.fileName = this['0'].attribs.href.split('/').pop();
							list[index].noteLinks.push(data);
							data = {};
						}
					});
          mediaFileName = mediaData.subject + '.json'
          fs.writeFileSync(mediaFileName.replace('/', '%2f'), JSON.stringify(mediaData, null, 2) + '\n', 'utf8');
        });
      };
    });

  });
  

};

getMITDepartments(getAllMITCourseLinks);
