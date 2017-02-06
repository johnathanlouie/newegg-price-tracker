$("#formIndex").submit(getPriceHistory);
var alertHTML = $("#alertBox").html();

// sends the form request through ajax instead of normal
function getPriceHistory(e)
{
	e.preventDefault();
	var url = $("#formIndexUrl").val();
	console.log("url: " + url);
	var productId = getParameterByName("Item", url);
	console.log("product id: " + productId);
	$.get(`/productid/${productId}`, "", serverResponseHandler, "json");
}

// for testing if getting a list of tracked products works
// use it by calling it in the browser console
function getTrackedIds()
{
	$.get("/productid/", "", function(data, status, jqxhr)
	{
		console.log(data);
	}, "json");
}

// name is field name in url query
// https://www.newegg.com/Product/Product.aspx?Item=9SIA1CZ4085353&ignorebbr=1
// "Item" returns "9SIA1CZ4085353"
function getParameterByName(name, url)
{
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
	var results = regex.exec(url);
	if (!results)
	{
		return null;
	}
	if (!results[2])
	{
		return '';
	}
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/*
 need some 404 error handlers
 expected object fields
 {
 product: {productId: '<product id>', title: '<title>', price: <current price>},
 history: [{price: <price 1>, date: <timestamp 1>}, {price: <price 2>, date: <timestamp 2>}, ... ]
 }
 */
function serverResponseHandler(data, textStatus, jqXHR)
{
	if (data === null)
	{ // New product, start tracking
		var alertBox = $("#alertBox");
		alertBox.html(alertHTML);
		alertBox.show();
		$("#trackLink").on('click', startTrack);
	}
	// handler code here.
	// create a table using the json object
	console.log(data);
}

function startTrack(event)
{
	event.preventDefault();
	$(".alert").alert('close');
	var url = $("#formIndexUrl").val();
	var productId = getParameterByName("Item", url);

	var trackCallback = function(data, status)
	{
		// console.log(status);
		// console.log(data);
	};
	$.ajax({
		type: 'POST',
		url: '/productid/',
		contentType: 'application/json',
		data: JSON.stringify([{productId: productId}]),
		success: trackCallback});
}
