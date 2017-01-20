require('./base.js');

var express = require('express');
var app = express();
var path = require('path');

app.set('x-powered-by', false)

// Template settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static content settings
app.use(express.static(path.join(__dirname, 'static')));

// ************************
// Add URL mapping: begin
// ************************
app.get('/product/track/json/:url', load('web.controller.TrackController'));


// ************************
// Add URL mapping: end
// ************************

// Handle 404
app.get('*', function(req, res) {
	res.status(404);
	if (req.accepts('html')) {
		res.render('404', {url: req.url});
		return;
	}

	if (req.accepts('json')) {
		res.send({error: 'Service not found:' + req.url});
		return;
	}

	res.send('Service not found: ' + req.url);
});

app.listen(loadConfig('server').port, function() {
	console.log('Server is listening on port ' + loadConfig('server').port);
})