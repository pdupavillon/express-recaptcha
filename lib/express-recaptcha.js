function Recaptcha(site_key, secret_key){
  this.site_key = site_key;
  this.secret_key = secret_key;
  this.api = {
    host:'www.google.com',
    script:'/recaptcha/api.js',
    verify:'/recaptcha/api/siteverify'
  };
  if (!this.site_key) throw new Error('site_key is required');
  if (!this.secret_key) throw new Error('secret_key is required');
};

Recaptcha.prototype.toHtml = function(options){
  options = options || {};
  var query_string = '';
  var captcha_attr = '';
  if (options.onload) query_string += '&onload='+options.onload;
  if (options.render) query_string += '&render='+options.render;
  if (options.hl) query_string += '&hl='+options.hl;
  if (options.theme) captcha_attr += ' data-theme="'+options.theme+'"';
  if (options.type) captcha_attr += ' data-type="'+options.type+'"';
  if (options.callback) captcha_attr += ' data-callback="'+options.callback+'"';

  query_string = query_string.replace('/^&/','?');
  var tpl = '<script src="//'+this.api.host+this.api.script+query_string+'" async defer></script>'+
            '<div class="g-recaptcha" data-sitekey="'+this.site_key+'"'+captcha_attr+'></div>';
  return tpl;
};

Recaptcha.prototype.verify = function(params, cb){
  params = params || {};
  if (!params.req) throw new Error('req is required');
  if (params.verb && params.verb != 'POST' && params.verb != 'GET') throw new Error('verb is required, and must be POST or GET (default POST)');

  var response = (!params.verb || params.verb === 'POST') ? params.req.body['g-recaptcha-response'] : params.req.query['g-recaptcha-response'];
  var query_string = '?secret='+this.secret_key+'&response='+response;

  if (!response) throw new Error('could not find g-recaptcha-response, maybe wrong request given');

  http.get("http://"+this.api.host+this.api.verify+query_string, function(res) {
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


module.exports = Recaptcha;
var http = require('http');
