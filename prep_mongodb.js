var db = connect("localhost:27017/pricetrack");
db.createCollection("product");
db.createCollection("history");
db.product.createIndex({"productId": 1}, {unique: true});
db.history.createIndex({"productId": 1}, {unique: true});