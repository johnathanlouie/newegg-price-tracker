require('./base.js');

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

app.set('x-powered-by', false)

// Template settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static content settings
app.use(express.static(path.join(__dirname, 'static')));

// Parse POST application/json
app.use(bodyParser.json());

// ************************
// Add URL mapping: begin
// ************************
// Track product
app.post('/productid/', load('web.controller.TrackController'));

// Simple demo
app.get('/demo/:user', function(request, response) {
	response.send(request.params.user);
});

// JSON POST demo
app.post('/demo/post', load('web.controller.DemoPostController'));

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
});

// Initialize database connection pool
load('web.domain.MongoDB').connection.init()
	.catch( (error) => {
		console.log(error);
	});
