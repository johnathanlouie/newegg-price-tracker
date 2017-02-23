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

	var history = data.history; //the array that has all of the price history
	var len = history.length; //number of listings in price history
    var json; //holds each price history listing
    var time; //holds the time for each price history listing
    var txt = "<tr><th>Date</th><th>Price ($)</th></tr>"; //for the table
    var reversedtxt =  "<thead>" + txt + "</thead><tbody>"; //for the graph (reversed so that the graph makes chronological sense

    for (var i = 0; i < len; i++) {
    	json = history[i];
    	time = json.timestamp.substring(0, 10);
    	txt += "<tr><td>" + time + "</td><td>" + json.price + "</td></tr>";
    }
    for (var i = len - 1; i >= 0; i--) {
        json = history[i];
        time = json.timestamp.substring(0, 10);
        reversedtxt += "<tr><td>" + time + "</td><td>" + json.price + "</td></tr>";
    }
    reversedtxt += "</tbody>";

    //Prepare table
    $("#historyTable thead").remove();
    $("#historyTable tbody").remove();
    $("#historyTable").append(txt);

    //reversedTable is never actually displayed, it is only used to create the graph/chart
    $("#reversedTable thead").remove();
    $("#reversedTable tbody").remove();
    $("#reversedTable").append(reversedtxt);

    //if the product has a price history longer than just 1 entry, display a graph of the price history
    if (len > 1) {
        $('#reversedTable').highchartTable();
        $('#graph').show();
        $("tr:even").css("background-color", "#F0F0F0");
	}
	else {
    	$('#graph').hide();
	}
    $('#outputContainer').show(); //show the information about the item
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
