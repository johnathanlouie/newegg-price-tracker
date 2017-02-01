module.exports = function() {
	DataExtractor.run()
	.then( () => {
		console.log('done');
	})
	.catch( (e) => {
		console.log(e);
	})
}

var DataExtractor = DataExtractor || {};

DataExtractor.run = function() {
	return Promise.resolve()
	.then(this.getProductIDs.bind(this))
	.then(this.processProducts.bind(this));
}

// Parameters: None
// Return: ['productid1', 'productid2', ... ]
// Error: {message: 'error message'}
DataExtractor.getProductIDs = function() {
	return ['N82E16824236679', '9SIAAEU57D9390', '9SIA8SK3T28065'];
	try {
		const listAPIUrl = loadConfig('api').listAPI;
		return load('domain.Curl').get(listAPIUrl, 2000)
		.then( (curlReturn) => {
			return JSON.parse(curlReturn.data);
		})
		.catch ( (error) => {
			return Promise.reject({message: 'DataExtractor.getProductIDs: ' + error.message});
		});
	} catch(e) {
		console.log(e);
		return Promise.reject({message: 'DataExtractor.getProductIDs(exception): ' + e.message});
	}
}

// Parameters:
//   productIDs: ['productid1', 'productid2', ... ]
// Return:
// Error: {message: 'error message'}
DataExtractor.processProducts = function(productIDs) {
	try {
		// Initialize task chains
		const numChains = 5;
		let chainInputs = [];
		for (let i = 0; i < numChains; i ++) {
			chainInputs[i] = [];
		}

		// Distribute product ids into different task chains
		for (let i in productIDs) {
			let chainID = i % numChains;
			chainInputs[chainID].push(productIDs[i]); 
		}

		// Steps of each task
		let taskChains = [];
		for (let i in chainInputs) {
			if (chainInputs[i].length == 0) {
				continue;
			}
			taskChains[i] = Promise.resolve(chainInputs[i])
			.then(this.extractProducts.bind(this))
			.then(this.saveProductInfos.bind(this))
			.then( (numDone) => {
				// console.log(productList);
				return numDone;
			})
		}

		// Parallel executing task chains
		return Promise.all(taskChains)
		.then((allResults) => {
			// all products done
			// console.log(allResults);
		})
	} catch(e) {
		console.log(e);
		return Promise.reject({message: 'DataExtractor.processProducts(exception): ' + e.message});
	}
}

DataExtractor.saveProductInfos = function(productList) {
	// console.log(productList);
	try {
		const curl = load("domain.Curl");
		const storeAPIUrl = loadConfig('api').storeAPI;
		const sendData = JSON.stringify(productList);

		return curl.post(storeAPIUrl, sendData, 30000, 'application/json')
		.then( (httpReturn) => {
			let jsonReturn = JSON.parse(httpReturn.data);
			// console.log(jsonReturn);
			if (!jsonReturn.status) {
				return Promise.reject({message: 'DataExtractor.saveProductInfos: storeAPI failed'});
			} else {
				return { data: jsonReturn };
			}
		})
		.catch( (error) => {
			return Promise.reject( {message: 'DataExtractor.saveProductInfos: ' + error.message} );
		});
	} catch(e) {
		return Promise.reject({message: 'DataExtractor.saveProductInfos(exception): ' + e.message});
	}
}

DataExtractor.extractProducts = function(productIDs) {
	try {
		let resultList = [];
		let taskChain = Promise.resolve();
		for (let i in productIDs) {
			taskChain = taskChain.then( () => {
				return productIDs[i];
			})
			.then(this.getProductUrl.bind(this))
			.then(this.downloadPage.bind(this))
			.then( (pageContent) => {
				return this.extractProduct(productIDs[i], pageContent);
			})
			.then( (productInfo) => {
				// console.log(productInfo);
				resultList[i] = productInfo;
				return resultList;
			})
			.catch( (error) => {
				// skip the error, so that the remaining product can be processed
				console.log(error);
				return resultList;
			});
		}

		taskChain = taskChain.then( () => {
			// console.log(resultList);
			return resultList;
		});

		return taskChain;
	} catch(e) {
		console.log(e);
		return Promise.reject({message: 'DataExtractor.extractProducts(exception): ' + e.message});
	}	
}

// Parameters:
//   productId: newegg product id
// Return:
//   newegg product page url -- string
DataExtractor.getProductUrl = function(productId) {
	// https://www.newegg.com/Product/Product.aspx?Item={productId}
	return 'https://www.newegg.com/Product/Product.aspx?Item=' + productId;
}

// Parameters:
//   url: newegg product page url
// Return:
//   raw page content -- string
DataExtractor.downloadPage = function(url) {
	try {
		const curl = load("domain.Curl");

		// Download page
		let taskChain = curl.get(url, 10000);

		// Get http return
		taskChain = taskChain.then( (httpReturn) => {
			return httpReturn.data;
		});

		// Error handling
		taskChain = taskChain.catch( (error) => {
			return Promise.reject({ message: error.message });
		});

		return taskChain;
	} catch (e) {
		console.log(e);
		return Promise.reject({message: "DataExtractor.downloadPage(exception): " + e.message});
	}
}

DataExtractor.extractProduct = function(productId, pageContent) {
	try {
		// console.log(pageContent);
		const parser = require('cheerio');
		const selector = parser.load(pageContent);

		let product = {productId: productId};

		// Extract price
		let price = selector("meta[itemprop='price']").attr('content');
		if (price === undefined) {
			return Promise.reject({message: 'DataExtractor.extractProduct: Price not found in page'});
		}
		product.price = parseFloat(price.replace('$', ''));

		// Extract title
		let title = selector("title").text();
		if (title === undefined || title.length === 0) {
			return Promise.reject({message: 'DataExtractor.extractProduct: Title not found in page'});
		}
		title = title.replace(/ {0,1}- {0,1}Newegg\.com/, '');
		product.title = title;

		// Current date
		const date = new Date();
		product.date = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();

		return product;
	} catch(e) {
		console.log(e);
		return Promise.reject({message: 'DataExtractor.extractProduct(exception): ' + e.message});
	}	
}