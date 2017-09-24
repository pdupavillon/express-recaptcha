const express = require('express')
const bodyParser = require('body-parser')
const Recaptcha = require('../lib/express-recaptcha')
const RECAPTCHA_SITE_KEY = 'xxxxxx'
const RECAPTCHA_SECRET_KEY = 'xxxxxx'
const app = express()
const recaptcha = new Recaptcha(RECAPTCHA_SITE_KEY, RECAPTCHA_SECRET_KEY)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.get('/', recaptcha.middleware.render, (req, res) => {
    res.render('index', { captcha: res.recaptcha })
})
app.post('/', recaptcha.middleware.verify, (req, res) => {
    res.render('index', {error:req.recaptcha.error, data:JSON.stringify(req.recaptcha.data)})
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})