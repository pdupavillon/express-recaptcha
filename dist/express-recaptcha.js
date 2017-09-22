'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Recaptcha = function () {
  function Recaptcha(site_key, secret_key, options) {
    _classCallCheck(this, Recaptcha);

    this._api = {
      host: 'www.google.com',
      script: '/recaptcha/api.js',
      verify: '/recaptcha/api/siteverify'
    };
    this._site_key = site_key;
    this._secret_key = secret_key;
    this._options = options || { checkremoteip: false };
    if (!this._site_key) throw new Error('site_key is required');
    if (!this._secret_key) throw new Error('secret_key is required');
  }

  _createClass(Recaptcha, [{
    key: 'render',
    value: function render() {
      var query_string = '';
      var captcha_attr = '';
      if (this._options.onload) query_string += '&onload=' + this._options.onload;
      if (this._options.render) query_string += '&render=' + this._options.render;
      if (this._options.hl) query_string += '&hl=' + this._options.hl;
      if (this._options.theme) captcha_attr += ' data-theme="' + this._options.theme + '"';
      if (this._options.type) captcha_attr += ' data-type="' + this._options.type + '"';
      if (this._options.callback) captcha_attr += ' data-callback="' + this._options.callback + '"';
      if (this._options.expired_callback) captcha_attr += ' data-expired-callback="' + this._options.expired_callback + '"';
      if (this._options.size) captcha_attr += ' data-size="' + this._options.size + '"';
      if (this._options.tabindex) captcha_attr += ' data-tabindex="' + this._options.tabindex + '"';

      query_string = query_string.replace(/^&/, '?');
      return '<script src="//' + this._api.host + this._api.script + query_string + '" async defer></script>' + '<div class="g-recaptcha" data-sitekey="' + this._site_key + '"' + captcha_attr + '></div>';
    }
  }, {
    key: 'verify',
    value: function verify(req, cb) {
      var response = null;
      var post_options = null;

      if (!req) throw new Error('req is required');
      if (req.body && req.body['g-recaptcha-response']) response = req.body['g-recaptcha-response'];
      if (req.query && req.query['g-recaptcha-response']) response = req.query['g-recaptcha-response'];

      var query_string = 'secret=' + this._secret_key + '&response=' + response;
      if (this._options.checkremoteip) {
        var remote_ip = req.headers && req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'] : req.connection.remoteAddress;
        if (remote_ip) query_string += '&remoteip=' + remote_ip;
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
      };

      var request = _https2.default.request(post_options, function (res) {
        var body = '';

        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          body += chunk;
        });
        res.on('end', function () {
          var result = JSON.parse(body);
          var error = result['error-codes'] && result['error-codes'].length > 0 ? result['error-codes'][0] : 'invalid-input-response';
          if (result.success) {
            cb(null, { hostname: result.hostname });
          } else cb(error, null);
        });
        res.on('error', function (e) {
          cb(e.message, null);
        });
      });
      request.write(query_string);
      request.end();
    }
  }, {
    key: 'middleware',
    get: function get() {
      var _this = this;

      return {
        render: function render(req, res, next) {
          req.recaptcha = _this.render();
          next();
        },
        verify: function verify(req, res, next) {
          _this.verify(req, function (error, data) {
            req.recaptcha = { error: error };
            if (data) {
              req.recaptcha.hostname = data.hostname;
            }
            next();
          });
        }
      };
    }
  }]);

  return Recaptcha;
}();

exports.default = Recaptcha;