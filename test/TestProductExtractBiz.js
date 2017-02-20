/* global Promise */

require('../web/base.js');

describe('ProductExtractBiz', () => {
	const testSuit = new ProductExtractBizTest();

	it('getProductUrl', () => {
		return testSuit.testGetProductUrl();
	});

	describe('loadProductPage', () => {
		it('Invalid productId', () => {
			return testSuit.testLoadProductPageInvalidId();
		});

		it('Valid productId', () => {
			return testSuit.testLoadProductPageValidId();
		});
	});

	it('extract', () => {
		return testSuit.testExtract();
	});

});

function ProductExtractBizTest()
{
	this.biz = load('domain.ProductExtractBiz');
}

ProductExtractBizTest.prototype.testGetProductUrl = function()
{
	const test = require('assert');

	test.equal(
	this.biz.getProductUrl('abcd'),
	this.biz.baseProductUrl + 'abcd'
	);
};

ProductExtractBizTest.prototype.testLoadProductPageInvalidId = function()
{
	const test = require('assert');

	let url = this.biz.getProductUrl('abcd1234');
	return this.biz.loadProductPage(url)
	.then((pageContent) => {
		test(false, 'Should return error');
	})
	.catch((error) => {
		test.notStrictEqual(error.message, undefined, 'No error message');
	});
};

ProductExtractBizTest.prototype.testLoadProductPageValidId = function()
{
	const test = require('assert');

	let url = this.biz.getProductUrl('N82E16822178522');
	return this.biz.loadProductPage(url)
	.catch((error) => {
		test(false, 'Should not return error');
	});
};

ProductExtractBizTest.prototype.testExtract = function()
{
	const test = require('assert');
	const contentPrice = "<meta itemprop='price' content='$49.56' />";
	const contentTitle = '<title>test title</title>';
	const contentImages = '<ul class=navThumbs>'
	+ '<li><a href="#"><img src="//test.com/ProductImageCompressAll35/imgid_1.jpg"/></a></li>'
	+ '<li><a href="#"><img src="//test.com/ProductImageCompressAll35/imgid_2.jpg"/></a></li>'
	+ '<li><a href="#"><img src="//test.com/ProductImageCompressAll35/imgid_3.jpg"/></a></li>'
	+ '</ul>';

	return Promise.resolve()
	.then(() => {
		return this.biz.extract('id', contentTitle + contentImages + contentPrice);
	})
	.then((product) => {
		test.equal('id', product.productId);
		test.equal(49.56, product.price);
		test.equal('test title', product.title);
		test.equal(3, product.images.length);
	})
	.catch(() => {
		test(false, 'Unexpetected error');
	});
};
