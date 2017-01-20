module.exports = function(req, res) {
	var renderPage = function(context) {
		res.send({
			status: true,
			url: context.url
		});
	};

	var renderError = function(error) {
		res.send({
			status: false,
			error: error.message
		})
	};

	TrackController.run(req.params.url)
		.then(renderPage)
		.catch(renderError);
}

var TrackController =  TrackController || {};
TrackController.run = function(url) {
	let context = {url: url};

	return this.getPageContent(context)
		.then(this.extractProductInfo)
		.then(this.getProductTracked)
		.then(this.startTrack)
}

// Get page content via HTTP/HTTPS
// Parameters:
//   context.url: URL of the page
// Return:
//   context.pageContent: page content as plain text
TrackController.getPageContent = function(context) {
	try {
		const url = context.url;

		// TODO: Get page content via HTTP/HTTPS
		let content = 'content from requested page';

		// Put result into context
		context.pageContent = content;
		return Promise.resolve(context);
	} catch(e) {
		console.log(e);
		return Promise.reject({message: 'TrackController.getPageContent(exception): ' + e.message});
	}
}

// Parse HTML and extract out the product information
// Parameters:
//   context.pageContent: HTML text of the page
// Return:
//   context.product: { title: '<product title>', price: <product price> }
TrackController.extractProductInfo = function(context) {
	try {
		const content = context.pageContent;

		// TODO: Parse HTML and extract out the product information
		const product = {
			title: 'Product title',
			price: 10.99
		};

		// Put result into context
		context.product = product;
		return Promise.resolve(context);
	} catch(e) {
		console.log(e);
		return Promise.reject({message: 'TrackController.extractProductInfo(exception): ' + e.message});
	}
}

// Check to see if the product has already been tracked
// Parameters:
//   context.url: URL of the product
// Return:
//   context.productTracked: the product object identified by given URL {TBD}
TrackController.getProductTracked = function(context) {
	try {
		const url = context.url;

		// TODO: find the product in track list
		const product = {};

		// Put the product already tracked in context
		context.productTracked = product;
		return Promise.resolve(context);
	} catch(e) {
		console.log(e);
		return Promise.reject({message: 'TrackController.getProductTracked(exception): ' + e.message});
	}
}

// Start tracking
// Parameters:
//   context.productTracked: the product identified by given URL
// Return:
//   context.isNew: flag to indicate new/existing product
TrackController.startTrack = function(context) {
	try {
		const productTracked = context.productTracked;

		if (productTracked === undefined) { // New product
			// TODO: Add product to track list

			context.isNew = true;
		} else { // Existing product, do nothing
			context.isNew = false;
			return Promise.resolve(context);
		}

	} catch(e) {
		console.log(e);
		return Promise.reject({message: 'TrackController.startTrack(exception): ' + e.message});
	}
}
