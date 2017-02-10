var ProductExtractBiz = ProductExtractBiz || {
	baseProductUrl: 'https://www.newegg.com/Product/Product.aspx?Item='
};

ProductExtractBiz.getProductUrl = function(productId)
{
	return this.baseProductUrl + productId;
};

ProductExtractBiz.loadProductPage = function(url)
{
	try
	{
		return load('domain.Curl').get(url, 10000)
			.then( (curlReturn) => {
				return curlReturn.data;
			})
			.catch( (error) => {
				return Promise.reject({message: error.message});	
			})
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: "ProductExtractBiz.loadProductPage(exception): " + e.message});
	}
}

ProductExtractBiz.extract = function(productId, pageContent)
{
	try
	{
		const parser = require('cheerio');
		const selector = parser.load(pageContent);

		let product = {productId: productId};

		// Extract price
		let price = selector("meta[itemprop='price']").attr('content');
		if (price === undefined)
		{
			return Promise.reject({message: 'ProductExtractBiz.extractProduct: Price not found in page'});
		}
		product.price = parseFloat(price.replace('$', ''));

		// Extract title
		let title = selector("title").text();
		if (title === undefined || title.length === 0)
		{
			return Promise.reject({message: 'ProductExtractBiz.extractProduct: Title not found in page'});
		}
		title = title.replace(/ {0,1}- {0,1}Newegg\.com/, '');
		product.title = title;

		// Product images
		product.images = [];
		const images = selector(".navThumbs > li > a > img");
		images.each( (index) => {
			// thumb: //images10.newegg.com/ProductImageCompressAll35/86-200-062-02.jpg
			// image: //images10.newegg.com/ProductImage/86-200-062-02.jpg
			const thumbUrl = images[index].attribs.src;
			const imageUrl = 'https:' + thumbUrl.replace(/\/ProductImage.*\//, '/ProductImage/');
			product.images.push(imageUrl);
		})

		// Current date
		product.timestamp = new Date();

		return product;
	}
	catch (e)
	{
		console.log(e);
		return Promise.reject({message: 'ProductExtractBiz.extractProduct(exception): ' + e.message});
	}
};

module.exports = ProductExtractBiz;