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
      self.verify(req,function(success,error){
        req.recaptcha = {success:success,error:error};
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

  query_string = query_string.replace('/^&/','?');
  var tpl = '<script src="//'+this.api.host+this.api.script+query_string+'" async defer></script>'+
  '<div class="g-recaptcha" data-sitekey="'+this.site_key+'"'+captcha_attr+'></div>';
  return tpl;
};

Recaptcha.prototype.verify = function(req, cb){
  var response = null;

  if (!req) throw new Error('req is required');
  if(req.body && req.body['g-recaptcha-response']) response = req.body['g-recaptcha-response'];
  if(req.query && req.query['g-recaptcha-response']) response = req.query['g-recaptcha-response'];

  var query_string = '?secret='+this.secret_key+'&response='+response;
  https.get("https://"+this.api.host+this.api.verify+query_string, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      var result = JSON.parse(body);

      if (result.success) cb(true,null);
      else cb(false, result['error-codes'][0]);
    });
    res.on('error', function(e) {
      cb(false,e.message);
    })
  });
};

module.exports = new Recaptcha();
var https = require('https');
