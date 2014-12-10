# express-recaptcha [![Build Status][ci-image]][ci-url] [![npm version][npm-version-image]][npm-version-url]

Google recaptcha for expressjs.

Link : https://www.google.com/recaptcha

## installation
```shell
npm install express-recaptcha --save
```
## usage
### display
```javascript
var express = require('express');
var pub = __dirname + '/public';
var app = express();
var Recaptcha = require('express-recaptcha');

app.use(express.static(pub));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req, res){
  var captcha = new Recaptcha('SITE_KEY', 'SECRET_KEY');
  res.render('login', { captcha:captcha.toHtml() });
});
```
### verify
```javascript
app.post('/', function(req, res){
  var captcha = new Recaptcha('SITE_KEY', 'SECRET_KEY');
  captcha.verify({req: req},function(success, error){
    if (success)
      // your success code ...
    else if (error)
      // your error code ...
  });
});
```

[ci-image]: https://travis-ci.org/pdupavillon/express-recaptcha.svg?branch=master
[ci-url]: https://travis-ci.org/pdupavillon/express-recaptcha
[npm-version-image]: https://badge.fury.io/js/express-recaptcha.svg
[npm-version-url]: http://badge.fury.io/js/express-recaptcha
