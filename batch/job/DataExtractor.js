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
	return this.getProductIDs()
	.then(this.processProducts.bind(this));
}

// Parameters: None
// Return: ['productid1', 'productid2', ... ]
// Error: {message: 'error message'}
DataExtractor.getProductIDs = function() {
	return Promise.resolve(['id1', 'id2', 'id3']);
	try {
		const listAPIUrl = loadConfig('api').listAPI;
		return load('domain.Curl').get(listAPIUrl)
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
		const numChains = 5;
		let chainInputs = [];
		for (let i = 0; i < numChains; i ++) {
			chainInputs[i] = [];
		}

		for (let i in productIDs) {
			let chainID = i % numChains;
			chainInputs[chainID].push(productIDs[i]); 
		}

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

		return Promise.all(taskChains)
		.then((allResults) => {
			// all products done
			console.log(allResults);
		})
	} catch(e) {
		console.log(e);
		return Promise.reject({message: 'DataExtractor.processProducts(exception): ' + e.message});
	}
}

DataExtractor.saveProductInfos = function(productList) {
	return Promise.resolve(productList.length);
}

DataExtractor.extractProducts = function(productIDs) {
	try {
		let resultList = [];
		let taskChain = Promise.resolve();
		for (let i in productIDs) {
			taskChain = taskChain.then( () => {
				return productIDs[i];
			});
			taskChain = taskChain.then(this.extractProduct.bind(this));
			taskChain = taskChain.then( (productInfo) => {
				resultList[i] = productInfo;
				return resultList;
			});
			taskChain = taskChain.catch( (error) => {
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

DataExtractor.extractProduct = function(productID) {
	try {
		return Promise.resolve({productID:productID, title:'title', price:10.99, date:'2017-01-02'});
	} catch(e) {
		console.log(e);
		return Promise.reject({message: 'DataExtractor.extractProduct(exception): ' + e.message});
	}	
}