const express = require('express')
const bodyParser = require('body-parser')
const Recaptcha = require('../dist').RecaptchaV2
const RecaptchaV3 = require('../dist').RecaptchaV3
const RECAPTCHA_SITE_KEY_V2 = 'xxxxx'
const RECAPTCHA_SECRET_KEY_V2 = 'xxxxx'
const RECAPTCHA_SITE_KEY_V3 = 'xxxxx'
const RECAPTCHA_SECRET_KEY_V3 = 'xxxxx'
const app = express()
const recaptcha = new Recaptcha(RECAPTCHA_SITE_KEY_V2, RECAPTCHA_SECRET_KEY_V2)
const recaptchaV3 = new RecaptchaV3(RECAPTCHA_SITE_KEY_V3, RECAPTCHA_SECRET_KEY_V3, {callback:'cb'})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.get('/', recaptcha.middleware.render, (req, res) => {
    res.render('index', {post:'/', captcha: res.recaptcha, path:req.path })
})
app.get('/v3', recaptchaV3.middleware.render, (req, res) => {
    res.render('index', { post:'/v3', captcha: res.recaptcha, path:req.path })
})
app.get('/dark', recaptcha.middleware.renderWith({'theme':'dark'}), (req, res) => {
    res.render('index', {post:'/', captcha: res.recaptcha, path:req.path })
})
app.post('/', recaptcha.middleware.verify, (req, res) => {
    res.render('index', {post:'/',error:req.recaptcha.error, path:req.path, data:JSON.stringify(req.recaptcha.data)})
})
app.post('/v3', recaptchaV3.middleware.verify, (req, res) => {
    res.render('index', {post:'/v3',error:req.recaptcha.error, path:req.path, data:JSON.stringify(req.recaptcha.data)})
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})