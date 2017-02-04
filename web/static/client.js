$("#formIndex").submit(needName);

function needName(e)
{
	e.preventDefault();
	var url = $("#formIndexUrl").val();
	var productId = getParameterByName("Item", url);
	$.get(`/productid/${productId}`, "", serverResponseHandler, "json");
}

// name is field name in url query
// https://www.newegg.com/Product/Product.aspx?Item=9SIA1CZ4085353&ignorebbr=1
// "Item" returns "9SIA1CZ4085353"
function getParameterByName(name, url)
{
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
	var results = regex.exec(url);
	if (!results) {return null;}
	if (!results[2]) {return '';}
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function serverResponseHandler(data, textStatus, jqXHR)
{
	console.log(data);
}