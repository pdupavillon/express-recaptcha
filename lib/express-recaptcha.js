function Recaptcha(){
  var self = this;
  this.api = {
    host:'www.google.com',
    script:'/recaptcha/api.js',
    verify:'/recaptcha/api/siteverify'
  };

  this.middleware = {
    render:function(req,res,next){
      req.recaptcha = self.render();
      next();
    },
    verify: function(req,res,next){
      self.verify(req,function(error){
        req.recaptcha = {error:error};
        next();
      });
    }
  }
};

Recaptcha.prototype.init = function(site_key, secret_key, options){
  this.site_key = site_key;
  this.secret_key = secret_key;
  this.options = options || {};
  if (!this.site_key) throw new Error('site_key is required');
  if (!this.secret_key) throw new Error('secret_key is required');
};

Recaptcha.prototype.render = function(){
  var query_string = '';
  var captcha_attr = '';
  this.options = this.options || {};
  if (this.options.onload) query_string += '&onload='+this.options.onload;
  if (this.options.render) query_string += '&render='+this.options.render;
  if (this.options.hl) query_string += '&hl='+this.options.hl;
  if (this.options.theme) captcha_attr += ' data-theme="'+this.options.theme+'"';
  if (this.options.type) captcha_attr += ' data-type="'+this.options.type+'"';
  if (this.options.callback) captcha_attr += ' data-callback="'+this.options.callback+'"';
  if (this.options.expired_callback) captcha_attr += ' data-expired-callback="'+this.options.expired_callback+'"';
  if (this.options.size) captcha_attr += ' data-size="'+this.options.size+'"';
  if (this.options.tabindex) captcha_attr += ' data-tabindex="'+this.options.tabindex+'"';

  query_string = query_string.replace(/^&/,'?');
  var tpl = '<script src="//'+this.api.host+this.api.script+query_string+'" async defer></script>'+
  '<div class="g-recaptcha" data-sitekey="'+this.site_key+'"'+captcha_attr+'></div>';
  return tpl;
};

Recaptcha.prototype.verify = function(req, cb){
  var response = null;
  var post_options = null;

  if (!req) throw new Error('req is required');
  if(req.body && req.body['g-recaptcha-response']) response = req.body['g-recaptcha-response'];
  if(req.query && req.query['g-recaptcha-response']) response = req.query['g-recaptcha-response'];

  var query_string = 'secret='+this.secret_key+'&response='+response;
  post_options = {
    host: this.api.host,
    port: '443',
    path: this.api.verify,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(query_string)
    }
  };

  var request = https.request(post_options,function(res) {
    var body = '';

    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      var result = JSON.parse(body);
      var error = result['error-codes'] && result['error-codes'].length > 0 ? result['error-codes'][0] : 'invalid-input-response';
      if (result.success) cb(null);
      else cb(error);
    });
    res.on('error', function(e) {
      cb(e.message);
    })
  });
  request.write(query_string);
  request.end();
};

module.exports = new Recaptcha();
var https = require('https');
