const express = require('express')
const bodyParser = require('body-parser')
const engines = require('consolidate')
const Recaptcha = require('../dist').RecaptchaV2
const RecaptchaV3 = require('../dist').RecaptchaV3
const RECAPTCHA_SITE_KEY_V2 = 'xxxxx'
const RECAPTCHA_SECRET_KEY_V2 = 'xxxxx'
const RECAPTCHA_SITE_KEY_V3 = 'xxxxx'
const RECAPTCHA_SECRET_KEY_V3 = 'xxxxx'
const app = express()
const recaptcha = new Recaptcha(RECAPTCHA_SITE_KEY_V2, RECAPTCHA_SECRET_KEY_V2)
const recaptchaV3 = new RecaptchaV3(
    RECAPTCHA_SITE_KEY_V3,
    RECAPTCHA_SECRET_KEY_V3,
    { callback: 'cb' }
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', __dirname + '/views')
app.engine('pug', engines.pug)
app.engine('ejs', engines.ejs)
app.set('view engine', 'pug')

const engineParm = ':engine(pug|ejs)?'
const getView = (req) => {
    if (req.params.engine && req.params.engine === 'ejs')
        return 'index.' + getEngineExt(req)
    return 'index.' + getEngineExt(req)
}
const getEngineExt = (req) => {
    if (req.params.engine && req.params.engine === 'ejs') return 'ejs'
    return 'pug'
}

app.get(`/${engineParm}`, recaptcha.middleware.render, (req, res) => {
    res.render(getView(req), {
        post: '/' + getEngineExt(req),
        captcha: res.recaptcha,
        path: req.path,
    })
})
app.get(`/${engineParm}/v3`, recaptchaV3.middleware.render, (req, res) => {
    res.render(getView(req), {
        post: '/' + getEngineExt(req) + '/v3',
        captcha: res.recaptcha,
        path: req.path,
    })
})
app.get(
    `/${engineParm}/dark`,
    recaptcha.middleware.renderWith({ theme: 'dark' }),
    (req, res) => {
        res.render(getView(req), {
            post: '/' + getEngineExt(req),
            captcha: res.recaptcha,
            path: req.path,
        })
    }
)
app.post(`/${engineParm}`, recaptcha.middleware.verify, (req, res) => {
    res.render(getView(req), {
        post: '/' + getEngineExt(req),
        error: req.recaptcha.error,
        path: req.path,
        data: JSON.stringify(req.recaptcha.data),
    })
})
app.post(`/${engineParm}/v3`, recaptchaV3.middleware.verify, (req, res) => {
    res.render(getView(req), {
        post: '/' + getEngineExt(req) + '/v3',
        error: req.recaptcha.error,
        path: req.path,
        data: JSON.stringify(req.recaptcha.data),
    })
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
