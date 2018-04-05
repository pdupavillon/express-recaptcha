# express-recaptcha
[![NPM](https://nodei.co/npm/express-recaptcha.png?compact=true)](https://nodei.co/npm/express-recaptcha/)

[![Build Status][ci-image]][ci-url]
[![npm version][npm-version-image]][npm-version-url]

Google recaptcha middleware for express.

Link : https://www.google.com/recaptcha

<img src="https://www.google.com/recaptcha/intro/images/hero-recaptcha-demo.gif" width="300px" />

## Installation
```shell
npm install express-recaptcha --save
```
## Requirements
* Expressjs
* BodyParser middleware - to get captcha data from query (usage depends on the version of expressjs you have)
    ```javascript
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    ```

## Usage
### Init
```javascript
//### New usage (express-recaptcha version >= 4.*.*)

var Recaptcha = require('express-recaptcha').Recaptcha;
//import Recaptcha from 'express-recaptcha'
var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY');
//or with options
var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY', options);
```

```javascript
//--- Old usage (express-recaptcha version 3.*.*)
var Recaptcha = require('express-recaptcha');
//import Recaptcha from 'express-recaptcha'
var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY');
//or with options
var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY', options);
```
`options` available properties
* `onload` The callback function that gets called when all the dependencies have loaded.
* `render` Value could be **explicit** OR **onload**, Whether to render the widget explicitly.
* `hl` (Optional). Forces the widget to render in a specific language (Auto-detects if unspecified).
* `theme` (Optional). Value could be **dark** OR **light**, The color theme of the widget (default light).
* `type` (Optional). Value could be **audio** OR **image**, The type of CAPTCHA to serve.
* `callback` (Optional). Your callback function that's executed when the user submits a successful CAPTCHA response.
* `expired_callback` (Optional).Your callback function that's executed when the recaptcha response expires and the user needs to solve a new CAPTCHA.
* `size` (Optional). The size of the widget.
* `tabindex` (Optional). The tabindex of the widget and challenge. If other elements in your page use tabindex, it should be set to make user navigation easier.
* `checkremoteip` (Optional). Adding support of remoteip verification (based on x-forwarded-for header or remoteAddress.Value could be **true** OR **false** (default **false**). (more info on : https://developers.google.com/recaptcha/docs/verify)


For more explanations, please refer to the documentation
https://developers.google.com/recaptcha/docs/display#config

### Render
middleware render method set the `recaptcha` property of `res` object (new in version >= 3.\*.*, was `req` previously), with the generated html code.

### Verify
Verify is performed on `params`,`query`,and `body` properties of `req` object.

middleware Verify method set the `recaptcha` property of `req` object, with validation informations.
```javascript
{
    error: string, //error code (see below), null if success
    data: {
        hostname: string //the hostname of the site where the reCAPTCHA was solved
    } 
}
```

### List of possible error codes

| Error code    | Description   |
|:------------- |:-------------|
| missing-input-secret  | The secret parameter is missing. |
| invalid-input-secret      | The secret parameter is invalid or malformed.      |
| missing-input-response | The response parameter is missing.      |
| invalid-input-response | The response parameter is invalid or malformed.      |


### Example
```javascript
var express = require('express');
var bodyParser = require('body-parser');
var pub = __dirname + '/public';
var app = express();
var Recaptcha = require('express-recaptcha').Recaptcha;

var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY');

//- required by express-recaptcha in order to get data from body or query.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static(pub));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', recaptcha.middleware.render, function(req, res){
  res.render('login', { captcha:res.recaptcha });
});

app.post('/', recaptcha.middleware.verify, function(req, res){
    if (!req.recaptcha.error)
        // success code
    else
        // error code
});
```

### Verify - without middleware
The verify callback takes 2 arguments : 

* `error`: null|string (see list of possible error codes above)
* `data`: object, with the following definition
```javascript
{
    hostname: string //the hostname of the site where the reCAPTCHA was solved 
}
```

### Example - without middleware
```javascript
var express = require('express');
var bodyParser = require('body-parser');
var pub = __dirname + '/public';
var app = express();
var Recaptcha = require('express-recaptcha').Recaptcha;

var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY');

//- required by express-recaptcha in order to get data from body or query.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static(pub));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req, res){
  res.render('login', { captcha:recaptcha.render() });
});

app.post('/', function(req, res){
    recaptcha.verify(req, function(error, data){
        if(!error)
            //success code
        else
            //error code
    });
});
```

## Example

Check example folder for more infos :
```
$ node example\server.js
```

[ci-image]: https://travis-ci.org/pdupavillon/express-recaptcha.svg?branch=master
[ci-url]: https://travis-ci.org/pdupavillon/express-recaptcha
[npm-version-image]: https://badge.fury.io/js/express-recaptcha.svg
[npm-version-url]: http://badge.fury.io/js/express-recaptcha
