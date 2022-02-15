
const express = require('express')
const app = express()
const port = 5500
app.use(express.static('main'))

/*
app.get('/', function(req, res){
    var request = require('request');
    var options = {
        'url': 'http://localhost:5500/project.html',
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body)
    });
})
*/
app.get('/getFood', function(req, res){
    var lang = req.query.lang;
    var request = require('request');
    var options = {
        'method': 'GET',
        'url': 'http://apis.data.go.kr/6260000/FoodService/getFood'+ lang +'?pageNo=1&numOfRows=300&serviceKey=AyrGuv9NiMlfEXdLs6b1QZ9np1rQr3kw%2Flix7o9EqhMCydOrJN5MMPBx6sPzQRoQxNsfsb8wYNQUR5ri0V9zAA%3D%3D&resultType=json',
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body)
    });
})


app.get('/getPlace', function(req, res){
    var lang = req.query.lang;
    var request = require('request');
    var options = {
        'method': 'GET',
        'url': 'http://apis.data.go.kr/6260000/AttractionService/getAttraction'+ lang +'?ServiceKey=AyrGuv9NiMlfEXdLs6b1QZ9np1rQr3kw%2Flix7o9EqhMCydOrJN5MMPBx6sPzQRoQxNsfsb8wYNQUR5ri0V9zAA%3D%3D&pageNo=1&numOfRows=300&resultType=json',
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body)
    });
})

app.get('/getCharger', function(req, res){
    var request = require('request');
    var options = {
        'method': 'GET',
        'url': 'http://apis.data.go.kr/6260000/BusanDischrgStusService/getTblDischrgStusInfo?ServiceKey=AyrGuv9NiMlfEXdLs6b1QZ9np1rQr3kw%2Flix7o9EqhMCydOrJN5MMPBx6sPzQRoQxNsfsb8wYNQUR5ri0V9zAA%3D%3D&pageNo=1&numOfRows=300&resultType=json',
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.send(response.body)
    });
})

app.listen(port, () => console.log("app listening at http://localhost:"+port))
