/* global Promise, loadConfig, load */

module.exports = function()
{
	DataExtractor.run()
		.then(() => {
			console.log('done');
		})
		.catch((e) => {
			console.log(e);
		});
};

var DataExtractor = DataExtractor || {};

DataExtractor.run = function()
{
	return Promise.resolve()
		.then(this.getProductIDs.bind(this))
		.then(this.processProducts.bind(this));
};

// Parameters: None
// Return: ['productid1', 'productid2', ... ]
// Error: {message: 'error message'}
DataExtractor.getProductIDs = function()
{
	try
	{
		const listAPIUrl = loadConfig('api').listAPI;
		return load('domain.Curl').get(listAPIUrl, 2000)
			.then((curlReturn) => {
				return JSON.parse(curlReturn.data);
			})
			.catch((error) => {
				return Promise.reject({message: 'DataExtractor.getProductIDs: ' + error.message});
			});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'DataExtractor.getProductIDs(exception): ' + e.message});
	}
};

// Parameters:
//   productIDs: ['productid1', 'productid2', ... ]
// Return:
// Error: {message: 'error message'}
DataExtractor.processProducts = function(productIDs)
{
	try
	{
		// Initialize task chains
		const numChains = 5;
		let chainInputs = [];
		for (let i = 0; i < numChains; i++)
		{
			chainInputs[i] = [];
		}

		// Distribute product ids into different task chains
		for (let i in productIDs)
		{
			let chainID = i % numChains;
			chainInputs[chainID].push(productIDs[i]);
		}

		// Steps of each task
		let taskChains = [];
		for (let i in chainInputs)
		{
			if (chainInputs[i].length === 0)
			{
				continue;
			}
			taskChains[i] = Promise.resolve(chainInputs[i])
				.then(this.extractProducts.bind(this))
				.then(this.saveProductInfos.bind(this))
				.then((numDone) => {
					// console.log(productList);
					return numDone;
				});
		}

		// Parallel executing task chains
		return Promise.all(taskChains)
			.then((allResults) => {
				// all products done
				// console.log(allResults);
			});
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'DataExtractor.processProducts(exception): ' + e.message});
	}
};

DataExtractor.saveProductInfos = function(productList)
{
	// console.log(productList);
	try
	{
		const curl = load("domain.Curl");
		const storeAPIUrl = loadConfig('api').storeAPI;
		const sendData = JSON.stringify(productList);

		return curl.post(storeAPIUrl, sendData, 30000, 'application/json')
			.then((httpReturn) => {
				let jsonReturn = JSON.parse(httpReturn.data);
				// console.log(jsonReturn);
				if (!jsonReturn.status)
				{
					return Promise.reject({message: 'DataExtractor.saveProductInfos: storeAPI failed(' + jsonReturn.message + ')'});
				}
				else
				{
					return {data: jsonReturn};
				}
			})
			.catch((error) => {
				return Promise.reject({message: 'DataExtractor.saveProductInfos: ' + error.message});
			});
	}
	catch (e)
	{
		return Promise.reject({message: 'DataExtractor.saveProductInfos(exception): ' + e.message});
	}
};

DataExtractor.extractProducts = function(productIDs)
{
	try
	{
		const extractBiz = load('domain.ProductExtractBiz');

		let resultList = [];
		let taskChain = Promise.resolve();
		for (let i in productIDs)
		{
			taskChain = taskChain.then(() => {
				return productIDs[i];
			})
				.then(extractBiz.getProductUrl.bind(extractBiz))
				.then(extractBiz.loadProductPage.bind(extractBiz))
				.then((pageContent) => {
					return extractBiz.extract(productIDs[i], pageContent);
				})
				.then((productInfo) => {
					resultList[i] = productInfo;
					return resultList;
				})
				.catch((error) => {
					// skip the error, so that the remaining product can be processed
					console.log(error);
					return resultList;
				});
		}

		taskChain = taskChain.then(() => {
			// console.log(resultList);
			return resultList;
		});

		return taskChain;
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'DataExtractor.extractProducts(exception): ' + e.message});
	}
};
