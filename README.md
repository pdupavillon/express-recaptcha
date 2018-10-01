express-recaptcha
================================================================================

[![NPM](https://nodei.co/npm/express-recaptcha.png?compact=true)](https://nodei.co/npm/express-recaptcha/)

[![Build Status][ci-image]][ci-url]
[![npm version][npm-version-image]][npm-version-url]

[Google recaptcha][Google-recaptcha] middleware for express.

<img src="https://www.google.com/recaptcha/intro/images/hero-recaptcha-demo.gif" width="300px" />

Table of contents
--------------------------------------------------------------------------------

- [Installation](#installation)
- [Requirements](#requirements)
- [Usage](#usage)
  - [How to initialise](#how-to-initialise)
  - [`options` available/properties:](#user-content-options-availableproperties)
  - [List of possible error codes](#list-of-possible-error-codes)
- [Examples](#examples)

Installation
--------------------------------------------------------------------------------

```shell
npm install express-recaptcha --save
```

Requirements
--------------------------------------------------------------------------------

- [Expressjs][expressjs]
- A [body parser][body-parser] middleware to get captcha data from query: (If you're using an express version older than 4.16.0)
  ```javascript
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  ```

Usage
--------------------------------------------------------------------------------

### How to initialise:

#### For versions >= 4.\*.\*: (New usage)
```javascript
var Recaptcha = require('express-recaptcha').Recaptcha;
//import Recaptcha from 'express-recaptcha'
var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY');
//or with options
var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY', options);
```

If you're using the older version of express-recaptcha (`3.\*.\*`), then you should require Recaptcha like so: (everything else is unchanged)

```javascript
var Recaptcha = require('express-recaptcha');
```

#### `options` available/properties:

| option             | description                                                                                                                                         | required? |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| `onload`           | The callback function that gets called when all the dependencies have loaded.                                                                       | yes       |
| `render`           | Value could be **explicit** OR **onload**, Whether to render the widget explicitly.                                                                 | yes       |
| `hl`               | Forces the widget to render in a specific language (Auto-detects if unspecified).                                                                   | no        |
| `theme`            | Value could be **dark** OR **light**, The color theme of the widget (default light).                                                                | no        |
| `type`             | Value could be **audio** OR **image**, The type of CAPTCHA to serve.                                                                                | no        |
| `callback`         | Your callback function that's executed when the user submits a successful CAPTCHA response.                                                         | no        |
| `expired_callback` | Your callback function that's executed when the recaptcha response expires and the user needs to solve a new CAPTCHA.                               | no        |
| `size`             | The size of the widget.                                                                                                                             | no        |
| `tabindex`         | The tabindex of the widget and challenge. If other elements in your page use tabindex, it should be set to make user navigation easier.             | no        |
| `checkremoteip`    | Adding support of remoteip verification (based on x-forwarded-for header or remoteAddress.Value could be **true** OR **false** (default **false**). | no        |

**For more information, please refer to:**
- [reCaptcha - display](https://developers.google.com/recaptcha/docs/display#config)
- [reCaptcha - verify ](https://developers.google.com/recaptcha/docs/verify)

### Render - `recaptcha.middleware.render`
The middleware's render method sets the `recaptcha` property of `res` object (new in version >= 3.\*.\*, was `req` previously), with the generated html code. Therefore, you can easily append recaptcha into your view by passing `res.recaptcha`.

### Verify - `recaptcha.middleware.verify`
The middleware's verify method sets the `recaptcha` property of `req` object, with validation information. Here is an example of a `req.recaptcha` response:

The response verification is performed on `params`, `query`, and `body` properties for the `req` object.

#### Example of verification response:

```javascript
{
  error: string, // error code (see table below), null if success
  data: {
    hostname: string // the site's hostname where the reCAPTCHA was solved
  }
}
```

#### List of possible error codes:

| Error code               | Description                                     |
|:-------------------------|:------------------------------------------------|
| `missing-input-secret`   | The secret parameter is missing.                |
| `invalid-input-secret`   | The secret parameter is invalid or malformed.   |
| `missing-input-response` | The response parameter is missing.              |
| `invalid-input-response` | The response parameter is invalid or malformed. |


Examples
--------------------------------------------------------------------------------

### express-recaptcha - with verification middleware:

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
  if (!req.recaptcha.error) {
    // success code
  } else {
    // error code
  }
});
```

### express-recaptcha - without verification middleware: (using callbacks instead)

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
    if (!req.recaptcha.error) {
      // success code
    } else {
      // error code
    }
  });
});
```

### Demo:

Run the example folder for a live demo:

```
$ node example\server.js
```

[ci-image]: https://travis-ci.org/pdupavillon/express-recaptcha.svg?branch=master
[ci-url]: https://travis-ci.org/pdupavillon/express-recaptcha
[npm-version-image]: https://badge.fury.io/js/express-recaptcha.svg
[npm-version-url]: http://badge.fury.io/js/express-recaptcha

[expressjs]: https://github.com/expressjs/express
[body-parser]: https://github.com/expressjs/body-parser
[Google-recaptcha]:https://www.google.com/recaptcha
