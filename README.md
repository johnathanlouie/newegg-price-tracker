
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

## Installing PriceTracker
### Install Stuff
* Node.JS
* MongoDB
* Add the MongoDB directory to your PATH environment variable. MongoDB does not do this for you.
* Clone our project and use npm to install dependencies.
```
git clone https://github.com/cs580ice/PriceTracker.git <project_home>
cd <project_home>
npm install
```

### Prepping MongoDB
```
cd <project_home>
mongo prep_mongodb.js
```

### Import Test Data into MongoDB
```
cd <project_home>
mongoimport --db pricetrack --collection history --file samplehistory.json
```

### Starting the Server
```javascript
cd <project_home>
mongod --dbpath=<path_to_database_files>
npm start
```
Now you can access the web service via http://localhost:3000

## Development HOWTOs
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
