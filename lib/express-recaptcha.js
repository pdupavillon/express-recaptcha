const https = require('https')

module.exports = class Recaptcha{
  constructor(site_key, secret_key, options){
    this._api = {
      host:'www.google.com',
      script:'/recaptcha/api.js',
      verify:'/recaptcha/api/siteverify'        
    }
    this._site_key = site_key
    this._secret_key = secret_key
    this._options = options || {checkremoteip:false}
    if (!this._site_key) throw new Error('site_key is required')
    if (!this._secret_key) throw new Error('secret_key is required')
  }
  get middleware() {
    return {
      render: (req, res, next) => {
        res.recaptcha = this.render()
        next()
      },
      verify: (req, res, next) => {
        this.verify(req, (error, data) => {
          req.recaptcha = {error, data}
          next()
        })
      }
    }
  }
  render(){
    let query_string = ''
    let captcha_attr = ''
    if (this._options.onload) query_string += '&onload='+this._options.onload
    if (this._options.render) query_string += '&render='+this._options.render
    if (this._options.hl) query_string += '&hl='+this._options.hl
    if (this._options.theme) captcha_attr += ' data-theme="'+this._options.theme+'"'
    if (this._options.type) captcha_attr += ' data-type="'+this._options.type+'"'
    if (this._options.callback) captcha_attr += ' data-callback="'+this._options.callback+'"'
    if (this._options.expired_callback) captcha_attr += ' data-expired-callback="'+this._options.expired_callback+'"'
    if (this._options.size) captcha_attr += ' data-size="'+this._options.size+'"'
    if (this._options.tabindex) captcha_attr += ' data-tabindex="'+this._options.tabindex+'"'
  
    query_string = query_string.replace(/^&/,'?')
    return  '<script src="//'+this._api.host+this._api.script+query_string+'" async defer></script>'+
            '<div class="g-recaptcha" data-sitekey="'+this._site_key+'"'+captcha_attr+'></div>'
  }
  verify(req, cb){
    let response = null;
    let post_options = null;
  
    if (!req) throw new Error('req is required');
    if(req.body && req.body['g-recaptcha-response']) response = req.body['g-recaptcha-response'];
    if(req.query && req.query['g-recaptcha-response']) response = req.query['g-recaptcha-response'];
  
    let query_string = 'secret='+this._secret_key+'&response='+response;
    if (this._options.checkremoteip){
      let remote_ip = req.headers && req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.connection.remoteAddress;
      if (remote_ip) query_string += '&remoteip=' + remote_ip
    }
    post_options = {
      host: this._api.host,
      port: '443',
      path: this._api.verify,
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(query_string)
      }
    }
  
    let request = https.request(post_options, (res) => {
      let body = ''

      res.setEncoding('utf8')
      res.on('data', (chunk) => {
        body += chunk
      });
      res.on('end', () => {
        const result = JSON.parse(body)
        const error = result['error-codes'] && result['error-codes'].length > 0 ? result['error-codes'][0] : 'invalid-input-response'
        if (result.success) {
          cb(null, {hostname: result.hostname})
        }
        else cb(error, null)
      })
      res.on('error', (e) => { cb(e.message, null) })
    })
    request.write(query_string)
    request.end()
  }
}