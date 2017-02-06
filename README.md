# PriceTracker
NodeJS based web service to track the price changes on newegg.com

## System requirements
* [NodeJS](https://nodejs.org)
* [MongoDB](https://www.mongodb.com)

## Features
* NodeJS based web service to track the price changes on newegg.com
* See a tracked product’s price history by inputting a URL
* (Optional) Sign up for price alerts
* (Optional) Compare price histories
* (Optional) See price history by category

## Development HOWTOs
### Run PriceTracker on your dev machine
```
git clone https://github.com/cs580ice/PriceTracker.git <project_home>
cd <project_home>
npm install
npm start
```

### Prepping MongoDB
Add the MongoDB directory to your PATH environment variable.
```
cd <project_home>
mongo prep_mongodb.js
```

### Import Test Data into MongoDB
```
cd <project_home>
mongoimport --db pricetrack --collection history --file samplehistory.json
```
Now you can access the web service via http://localhost:3000

### Add new service(url mapping)
In web/server.js
```javascript
app.get('/demo/:user', function(request, response) {
	response.send(request.params.user);
});
```    
Try the new service http://localhost:3000/demo/InputAnythingYouWant

### Different content format of a service
* For plain text: ```javascript response.send( 'hello world' ); ```
* For JSON: ```javascript response.json( {message: 'hello world'} ); ```
* For HTML: ```javascript response.render( '<template_name>', model ); ```

Note: locate templates in web/views/
