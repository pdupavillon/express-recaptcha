var should = require('should');
var sinon = require('sinon');
var Recaptcha = require(__dirname + '/lib/express-recaptcha.js');
var api_url = "www.google.com/recaptcha/api.js";
var http = require('http');
var events = require("events");

describe('Recaptcha', function() {
  // before(function() {
  //   this.httpGet = http.get;
  // });
  beforeEach(function() {
    if (http.get.restore){
      http.get.restore();
    }
  });

  it('Create instance', function() {
    var captcha = new Recaptcha('SITE_KEY','SECRET_KEY');
    captcha.should.be.ok;
    captcha.site_key.should.be.ok.and.be.equal('SITE_KEY');
    captcha.secret_key.should.be.ok.and.be.equal('SECRET_KEY');
  });

  it('Not create instance', function() {
      (function(){ new Recaptcha(); }).should.throw('site_key is required');
      (function(){ new Recaptcha('SITE_KEY'); }).should.throw('secret_key is required');
  });

  it('Get Html', function(){
    var captcha = new Recaptcha('SITE_KEY','SECRET_KEY');
    var result = captcha.toHtml();
    var expected = '<script src="//'+api_url+'" async defer></script>'+
                  '<div class="g-recaptcha" data-sitekey="SITE_KEY"></div>';
    result.should.be.equal(expected);
  });

  it('Get Html with options', function(){
    var captcha = new Recaptcha('SITE_KEY','SECRET_KEY');
    var result = captcha.toHtml({
      onload:'cb',
      render:'explicit',
      hl:'fr',
      theme:'dark',
      type:'audio',
      callback:'callback'
    });
    var expected = '<script src="//'+api_url+'&onload=cb&render=explicit&hl=fr" async defer></script>'+
                  '<div class="g-recaptcha" data-sitekey="SITE_KEY" data-theme="dark" data-type="audio" data-callback="callback"></div>';
    result.should.be.equal(expected);
  });


  it('Verify', function(done){
    var captcha = new Recaptcha('SITE_KEY','SECRET_KEY');
    var httpStub = sinon.stub(http,'get',function(options,cb){
      cb({
        on:function(evt,callback){
          if (evt == 'data') callback('{"success":true}');
          if (evt =='end') callback();
        }
      });
    });

    captcha.verify({req:{body:{'g-recaptcha-response':'1234578910'}}},function(success,error){
      success.should.be.true;
      done();
    });
  });

  it('Verify with error', function(done){
    var captcha = new Recaptcha('SITE_KEY','SECRET_KEY');
    var httpStub = sinon.stub(http,'get',function(options,cb){
      cb({
        on:function(evt,callback){
          if (evt == 'data') callback('{"success":false, "error-codes": [ "invalid-input-response" ]}');
          if (evt =='end') callback();
        }
      });
    });

    captcha.verify({req:{body:{'g-recaptcha-response':'1234578910'}}},function(success,error){
      success.should.be.false;
      error.should.be.equal("invalid-input-response");
      done();
    });
  });
});
