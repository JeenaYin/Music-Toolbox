var lambda = require('../index.js');
var context = require('./context.js');
var event = require('./event.json');

var mockContext = new context();

function callback(error, data) {
	if(error) {
		console.log('error:' + error);
	} else {
		console.log(data);
	}
}

lambda.handler(event, mockContext, callback);