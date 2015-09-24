var express = require('express');
var app = express();

app.get('/cheer.txt', function(req, res){
	res.end('Youre awesome!');
});

app.get('/jeer.txt', function(req, res){
	res.end('You suck!');
});

var server = app.listen(8080, function(){
	console.log('listening on port 8080');
})