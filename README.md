# express-recaptcha

[![NPM](https://nodei.co/npm/express-recaptcha.png?compact=true)](https://nodei.co/npm/express-recaptcha/)

[![Build Status][ci-image]][ci-url]
[![npm version][npm-version-image]][npm-version-url]

[Google recaptcha][google-recaptcha] middleware for express.

[express-recaptcha v2][express-recaptcha-v2] (previous middleware version).

## Table of contents

-   [Installation](#installation)
-   [Requirements](#requirements)
-   [Usage](#usage)
    -   [How to initialise](#how-to-initialise)
    -   [`options` available/properties](#options-availableproperties)
    -   [Render - `recaptcha.middleware.render`](#render---recaptchamiddlewarerender)
    -   [Render and override options - `recaptcha.middleware.renderWith`](#render---recaptchamiddlewarerenderwith)
    -   [Verify - `recaptcha.middleware.verify`](#verify---recaptchamiddlewareverify)
    -   [List of possible error codes](#list-of-possible-error-codes)
-   [Examples](#examples)

## Installation

```shell
npm install express-recaptcha --save
```

## Requirements

-   [Expressjs][expressjs]
-   A [body parser][body-parser] middleware to get captcha data from query: (If you're using an express version older than 4.16.0)
    ```javascript
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    ```

## Usage

### How to initialise:

```javascript
var Recaptcha = require('express-recaptcha').RecaptchaV3
//import Recaptcha from 'express-recaptcha'
var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY')
//or with options
var options = { hl: 'de' }
var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY', options)
```

#### `options` available/properties:

| option               | description                                                                                                                                                                                                                   |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `onload`             | The callback function that gets called when all the dependencies have loaded.                                                                                                                                                 |
| `hl`                 | Forces the widget to render in a specific language (Auto-detects if unspecified).                                                                                                                                             |
| `callback`           | In that callback you will call your backend to verify the given token. To be verified, the token needs to be posted with the key **g-recaptcha-response** (see the example folder)                                            |
| `action`             | **homepage** by default should only be alphanumeric [More info on google's web site](Google-recaptcha-action)                                                                                                                 |
| `checkremoteip`      | Adding support of remoteip verification (based on x-forwarded-for header or remoteAddress.Value could be **true** OR **false** (default **false**).                                                                           |
| `useRecaptchaDomain` | Boolean. Sets `www.recaptcha.net` as the host; useful in instances where `www.google.com` may be blocked (as detailed in the [reCaptcha docs](https://developers.google.com/recaptcha/docs/faq#can-i-use-recaptcha-globally)) |

**For more information, please refer to:**

-   [reCaptcha - display](https://developers.google.com/recaptcha/docs/display#config)
-   [reCaptcha - verify ](https://developers.google.com/recaptcha/docs/verify)

### Render - `recaptcha.middleware.render`

The middleware's render method sets the `recaptcha` property of `res` object, with the generated html code. Therefore, you can easily append recaptcha into your templates by passing `res.recaptcha` to the view:

```javascript
app.get('/', recaptcha.middleware.render, function (req, res) {
    res.render('login', { captcha: res.recaptcha })
})
```

### Render - `recaptcha.middleware.renderWith`

Same as the render middleware method except that you can override the options in parameter :

```javascript
app.get(
    '/',
    recaptcha.middleware.renderWith({ hl: 'fr' }),
    function (req, res) {
        res.render('login', { captcha: res.recaptcha })
    }
)
```

### Verify - `recaptcha.middleware.verify`

The middleware's verify method sets the `recaptcha` property of `req` object, with validation information:

```javascript
app.post('/', recaptcha.middleware.verify, function (req, res) {
    if (!req.recaptcha.error) {
        // success code
    } else {
        // error code
    }
})
```

The response verification is performed on `params`, `query`, and `body` properties for the `req` object.

Here is an example of a `req.recaptcha` response:

#### Example of verification response:

```javascript
{
  error: string, // error code (see table below), null if success
  data: {
    hostname: string, // the site's hostname where the reCAPTCHA was solved
    score: number, // the score for this request (0.0 - 1.0)
    action: string // the action name for this request (important to verify)
  }
}
```

#### List of possible error codes:

| Error code               | Description                                     |
| :----------------------- | :---------------------------------------------- |
| `missing-input-secret`   | The secret parameter is missing.                |
| `invalid-input-secret`   | The secret parameter is invalid or malformed.   |
| `missing-input-response` | The response parameter is missing.              |
| `invalid-input-response` | The response parameter is invalid or malformed. |
| `invalid-json-response`  | Can't parse google's response. Server error.    |

## Examples

### express-recaptcha - with verification middleware:

```javascript
var express = require('express')
var bodyParser = require('body-parser')
var pub = __dirname + '/public'
var app = express()
var Recaptcha = require('express-recaptcha').RecaptchaV3

var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY', { callback: 'cb' })

//- required by express-recaptcha in order to get data from body or query.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.use(express.static(pub))
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.get('/', recaptcha.middleware.render, function (req, res) {
    res.render('login', { captcha: res.recaptcha })
})

// override default options for that route
app.get(
    '/fr',
    recaptcha.middleware.renderWith({ hl: 'fr' }),
    function (req, res) {
        res.render('login', { captcha: res.recaptcha })
    }
)

app.post('/', recaptcha.middleware.verify, function (req, res) {
    if (!req.recaptcha.error) {
        // success code
    } else {
        // error code
    }
})
```

### express-recaptcha - without verification middleware: (using `recaptcha.verify` callback instead)

```javascript
var express = require('express')
var bodyParser = require('body-parser')
var pub = __dirname + '/public'
var app = express()
var Recaptcha = require('express-recaptcha').RecaptchaV3

var recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY', { callback: 'cb' })

//- required by express-recaptcha in order to get data from body or query.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.use(express.static(pub))
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.get('/', function (req, res) {
    res.render('login', { captcha: recaptcha.render() })
})

// override default options for that route
app.get('/fr', function (req, res) {
    res.render('login', { captcha: recaptcha.renderWith({ hl: 'fr' }) })
})

app.post('/', function (req, res) {
    recaptcha.verify(req, function (error, data) {
        if (!error) {
            // success code
        } else {
            // error code
        }
    })
})
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
[google-recaptcha]: https://www.google.com/recaptcha
[express-recaptcha-v2]: README.v2.md
[google-recaptcha-action]: https://developers.google.com/recaptcha/docs/v3#actions
