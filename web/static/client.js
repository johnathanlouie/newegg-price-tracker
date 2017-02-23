$("#formIndex2").submit(getPriceHistory);
var alertHTML = $("#alertBox").html();

var data1 = null; //used to store the data of the first API call

// sends the form request through ajax instead of normal
function getPriceHistory(e)
{
	e.preventDefault();
	var url = $("#formIndexUrl").val();
	//var url2 = $("#formIndexUrl2").val();
	//console.log("url: " + url + "\n" + url2);
	var productId = getParameterByName("Item", url);
	//var productId2 = getParameterByName("Item", url2);
	//console.log("product id: " + productId + "\n" + productId2);
	$.get(`/productid/${productId}`, "", serverResponseHandler, "json");
    //$.get(`/productid/${productId2}`, "", serverResponseHandler, "json");
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
 expected data if no error
 {
 productId: '<product id>',
 title: '<title>',
 price: <current price>},
 history: [{price: <price 1>, timestamp: <timestamp 1>}, {price: <price 2>, timestamp: <timestamp 2>}, ... ]
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
	/*if (data1 == null) {
		data1 = data;
		createTable(data);
	}
	else {
		createTable(data1, data);
	}*/
	createTable(data);
}

//Creates a table of the product's prices over time
function createTable(data) {
    $("#title").text(data.title);
    $("#productID").text(" (productID: " + data.productId + ")");
    $("#latestPrice").text("Latest price: $" + data.latestPrice);
    $("#productPicture").attr("src", data.images[0]);
    $("#productPicture").attr("width", "35%");
	var history = data.history;
    var json;
    var time;
    var txt = "<thead><tr><th>Date</th><th>Price ($)</th></tr></thead><tbody>";
    for (var i = 0; i < history.length; i++) {
    	json = history[i];
    	console.log(json);
    	time = json.timestamp.substring(0, 10);
    	txt += "<tr><td>" + time + "</td><td>" + json.price + "</td></tr>";
    }
    txt += "</tbody>";
    $("#historyTable thead").remove();
    $("#historyTable tbody").remove();
    $("#historyTable").append(txt);
    if (history.length > 1) {
        $('#historyTable').highchartTable();
        $('#graph').show();
        $("tr:even").css("background-color", "#F0F0F0");
	}
	else {
    	$('#graph').hide();
	}
    $('#tableOutput').show();
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
		success: trackCallback
	});
}
