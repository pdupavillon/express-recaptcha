var should = require('should');
var sinon = require('sinon');
var recaptcha = require(__dirname + '/lib/express-recaptcha.js');
var api_url = "www.google.com/recaptcha/api.js";
var https = require('https');

describe('Recaptcha', function() {
  beforeEach(function() {
    if (https.get.restore) https.get.restore();
  });

  it('Init', function() {
    recaptcha.init('SITE_KEY','SECRET_KEY');
    recaptcha.should.be.ok;
    recaptcha.site_key.should.be.ok.and.be.equal('SITE_KEY');
    recaptcha.secret_key.should.be.ok.and.be.equal('SECRET_KEY');
  });

  it('Init with options', function() {
    recaptcha.init('SITE_KEY','SECRET_KEY',{
      onload:'cb',
      render:'explicit',
      hl:'fr',
      theme:'dark',
      type:'audio',
      callback:'callback'
    });
    recaptcha.should.be.ok;
    recaptcha.site_key.should.be.ok.and.be.equal('SITE_KEY');
    recaptcha.secret_key.should.be.ok.and.be.equal('SECRET_KEY');
    recaptcha.options.should.be.ok;
    recaptcha.options.onload.should.be.equal('cb');
    recaptcha.options.render.should.be.equal('explicit');
    recaptcha.options.hl.should.be.equal('fr');
    recaptcha.options.theme.should.be.equal('dark');
    recaptcha.options.type.should.be.equal('audio');
    recaptcha.options.callback.should.be.equal('callback');
  });

  it('Not init', function() {
    (function(){ recaptcha.init(); }).should.throw('site_key is required');
    (function(){ recaptcha.init('SITE_KEY'); }).should.throw('secret_key is required');
  });

  describe('Direct use', function() {

    it('Get Html', function(){
      recaptcha.init('SITE_KEY','SECRET_KEY');
      var result = recaptcha.render();
      var expected = '<script src="//'+api_url+'" async defer></script>'+
      '<div class="g-recaptcha" data-sitekey="SITE_KEY"></div>';
      result.should.be.equal(expected);
    });

    it('Get Html with options', function(){
      recaptcha.init('SITE_KEY','SECRET_KEY',{
        onload:'cb',
        render:'explicit',
        hl:'fr',
        theme:'dark',
        type:'audio',
        callback:'callback'
      });
      var result = recaptcha.render();
      var expected = '<script src="//'+api_url+'?onload=cb&render=explicit&hl=fr" async defer></script>'+
      '<div class="g-recaptcha" data-sitekey="SITE_KEY" data-theme="dark" data-type="audio" data-callback="callback"></div>';
      result.should.be.equal(expected);
    });


    it('Verify', function(done){
      recaptcha.init('SITE_KEY','SECRET_KEY');
      var httpStub = sinon.stub(https,'get',function(options,cb){
        cb({
          on:function(evt,callback){
            if (evt == 'data') callback('{"success":true}');
            if (evt =='end') callback();
          }
        });
      });

      recaptcha.verify({body:{'g-recaptcha-response':'1234578910'}},function(error){
        (error === null).should.be.true;
        done();
      });
    });

    it('Verify with error', function(done){
      recaptcha.init('SITE_KEY','SECRET_KEY');
      var httpStub = sinon.stub(https,'get',function(options,cb){
        cb({
          on:function(evt,callback){
            if (evt == 'data') callback('{"success":false, "error-codes": [ "invalid-input-response" ]}');
            if (evt =='end') callback();
          }
        });
      });

      recaptcha.verify({body:{'g-recaptcha-response':'1234578910'}},function(error){
        error.should.be.equal("invalid-input-response");
        done();
      });
    });
  });

  describe('Middleware use', function() {
    it('Render Html', function(){
      var req = {};
      recaptcha.init('SITE_KEY','SECRET_KEY');
      recaptcha.middleware.render(req,{},function(){});
      var expected = '<script src="//'+api_url+'" async defer></script>'+
      '<div class="g-recaptcha" data-sitekey="SITE_KEY"></div>';
      req.recaptcha.should.be.equal(expected);
    });

    it('Verify', function(done){
      recaptcha.init('SITE_KEY','SECRET_KEY');
      var req = {body:{'g-recaptcha-response':'1234578910'}};
      var httpStub = sinon.stub(https,'get',function(options,cb){
        cb({
          on:function(evt,callback){
            if (evt == 'data') callback('{"success":true}');
            if (evt =='end') callback();
          }
        });
      });

      recaptcha.middleware.verify(req,{}, function(){
        req.recaptcha.should.be.ok;
        (req.recaptcha.error === null).should.be.true;
        done();
      });
    });

    it('Verify with error', function(done){
      recaptcha.init('SITE_KEY','SECRET_KEY');
      var req = {body:{'g-recaptcha-response':'1234578910'}};
      var httpStub = sinon.stub(https,'get',function(options,cb){
        cb({
          on:function(evt,callback){
            if (evt == 'data') callback('{"success":false, "error-codes": [ "invalid-input-response" ]}');
            if (evt =='end') callback();
          }
        });
      });

      recaptcha.middleware.verify(req,{}, function(){
        req.recaptcha.should.be.ok;
        req.recaptcha.error.should.be.equal('invalid-input-response');
        done();
      });
    });
  });
});
