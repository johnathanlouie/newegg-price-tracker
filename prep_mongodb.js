var db = connect("localhost:27017/pricetrack");
db.createCollection("history");
db.history.createIndex({"productId": 1}, {unique: true});