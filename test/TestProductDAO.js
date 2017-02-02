require('../web/base.js');

function ProductDAOTest() {
	this.dao = load('web.domain.ProductDAO');
	this.dao.dbName = 'pricetrackTest';
}

ProductDAOTest.prototype.generateProducts = function(num) {
	const products = [];
	for (let i = 0; i < num; i ++) {
		products.push({
			productId: 'testId' + i,
			title: 'test product ' + i,
			latestPrice: 10.0 + i
		});
	}
	return products;
}

ProductDAOTest.prototype.deleteAll = function() {
	const test = require('assert');

	return this.dao.deleteAll()
	.catch( (error) => {
		test(null === error, 'Cleanup failed');
	});
}

ProductDAOTest.prototype.testInsert = function(products) {
	const test = require('assert');

	return this.dao.insert(products)
	.then( (insertCount) => {
		test.equal(products.length, insertCount);
	})
}

ProductDAOTest.prototype.testGetProductIds = function(products) {
	const test = require('assert');

	return this.dao.getProductIds()
	.then( (docs) => {
		// Check length
		test.equal(products.length, docs.length);
		// Check format
		for (let i in docs) {
			test(docs[i].productId !== undefined, 'format error');
		}
	})
}

ProductDAOTest.prototype.testGetByProductId = function(products) {
	const test = require('assert');

	const expected = products[0];
	return this.dao.getByProductId(expected.productId)
	.then( (doc) => {
		for (let key in doc) {
			test.equal(doc[key], expected[key]);
		}
	})
}

ProductDAOTest.prototype.testUpdatePrice = function(products) {
	const test = require('assert');

	const expected = {
		productId: products[0].productId,
		title: products[0].title,
		latestPrice: products[0].latestPrice + 10
	};

	return this.dao.updatePrice(expected.productId, expected.latestPrice)
	.then( (updateCount) => {
		test.equal(updateCount, 1);
	})
	.then( () => {
		return this.dao.getByProductId(expected.productId);
	})
	.then( (doc) => {
		for (let key in doc) {
			test.equal(doc[key], expected[key]);
		}
	});
}

describe('ProductDAO', () => {
	const testSuit = new ProductDAOTest();
	const products = testSuit.generateProducts(10);

	before( () => {
		return testSuit.deleteAll();
	});

	it('insert', () => {
		return testSuit.testInsert(products);
	});

	it('getProductIds', () => {
		return testSuit.testGetProductIds(products);
	});

	it('getByProductId', () => {
		return testSuit.testGetByProductId(products);
	});

	it('updatePrice', () => {
		return testSuit.testUpdatePrice(products);
	});
});
