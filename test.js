var should = require('should');
var sinon = require('sinon');
var recaptcha = require(__dirname + '/lib/express-recaptcha.js');
var api_url = "www.google.com/recaptcha/api.js";
var https = require('https');
var PassThrough = require('stream').PassThrough;

class HttpTestHelper{
  constructor(){
    this.httpBodyResponse = '{"success":true}';
  }
  withErrorCode(errorCode){
    this.httpBodyResponse = '{"success":false, "error-codes": [ "'+errorCode+'" ]}';
    return this;
  }

  build(){
    this._setHttpsStub();
  }
  checkValidationQueryString(expected){
    this.writeSpy.calledOnce.should.be.true();
    this.writeSpy.calledWith(expected).should.be.true();
  }

  _setHttpsStub(){
      var that = this;
      var request = new PassThrough();
      this.writeSpy = sinon.spy();

      request.push(this.httpBodyResponse);
      request.end();

      this.httpsStub = sinon.stub(https,'request').callsFake(function(opt, cb){
        cb(request);
        return {write:that.writeSpy, end:sinon.spy()};
      });
  };
}

describe('Recaptcha', function() {

  beforeEach(function() {
    this.httpTestHelper = new HttpTestHelper(); 
  });
	afterEach(function() {
    if (https.request.restore) https.request.restore();
	});  

  it('Init', function() {
    recaptcha.init('SITE_KEY','SECRET_KEY');
    recaptcha.should.be.ok;
    recaptcha.site_key.should.be.ok().and.be.equal('SITE_KEY');
    recaptcha.secret_key.should.be.ok().and.be.equal('SECRET_KEY');
    recaptcha.options.checkremoteip.should.be.false();
  });

  it('Init with options', function() {
    recaptcha.init('SITE_KEY','SECRET_KEY',{
      onload:'cb',
      render:'explicit',
      hl:'fr',
      theme:'dark',
      type:'audio',
      callback:'callback',
      expired_callback:'expired_callback',
      size:'size',
      tabindex:'tabindex',
      checkremoteip:true
    });
    recaptcha.should.be.ok;
    recaptcha.site_key.should.be.ok().and.be.equal('SITE_KEY');
    recaptcha.secret_key.should.be.ok().and.be.equal('SECRET_KEY');
    recaptcha.options.should.be.ok;
    recaptcha.options.onload.should.be.equal('cb');
    recaptcha.options.render.should.be.equal('explicit');
    recaptcha.options.hl.should.be.equal('fr');
    recaptcha.options.theme.should.be.equal('dark');
    recaptcha.options.type.should.be.equal('audio');
    recaptcha.options.callback.should.be.equal('callback');
    recaptcha.options.expired_callback.should.be.equal('expired_callback');
    recaptcha.options.size.should.be.equal('size');
    recaptcha.options.tabindex.should.be.equal('tabindex');
    recaptcha.options.checkremoteip.should.be.true();
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
        callback:'callback',
        expired_callback:'expired_callback',
        size:'size',
        tabindex:'tabindex'
      });
      var result = recaptcha.render();
      var expected = '<script src="//'+api_url+'?onload=cb&render=explicit&hl=fr" async defer></script>'+
      '<div class="g-recaptcha" data-sitekey="SITE_KEY" data-theme="dark" data-type="audio" data-callback="callback" data-expired-callback="expired_callback" data-size="size" data-tabindex="tabindex"></div>';
      result.should.be.equal(expected);
    });


    it('Verify', function(done){
      this.httpTestHelper.build();
      recaptcha.init('SITE_KEY','SECRET_KEY');

      recaptcha.verify({body:{'g-recaptcha-response':'1234578910'}}, function(error){
        (error === null).should.be.true();
        this.httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910');
        done();        
      }.bind(this));
    });

    it('Verify client ip - x-forwarded-for header', function(done){
      this.httpTestHelper.build();
      recaptcha.init('SITE_KEY','SECRET_KEY', {checkremoteip: true});

      recaptcha.verify({body:{'g-recaptcha-response':'1234578910'},headers:{'x-forwarded-for':'10.0.0.1'}}, function(error){
        (error === null).should.be.true();
        this.httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910&remoteip=10.0.0.1');
        done();
      }.bind(this));
    });

    it('Verify client ip - connection remote addr', function(done){
      this.httpTestHelper.build();
      recaptcha.init('SITE_KEY','SECRET_KEY', {checkremoteip: true});

      recaptcha.verify({body:{'g-recaptcha-response':'1234578910'}, connection:{remoteAddress:'10.0.0.1'}}, function(error){
        (error === null).should.be.true();
        this.httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910&remoteip=10.0.0.1');
        done();
      }.bind(this));
    });

    it('Verify with error', function(done){
      this.httpTestHelper.withErrorCode('invalid-input-response').build();

      recaptcha.init('SITE_KEY','SECRET_KEY');

      recaptcha.verify({body:{'g-recaptcha-response':'1234578910'}},function(error){
        error.should.be.equal("invalid-input-response");
        this.httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910');
        done();
      }.bind(this));
    });
  });

  describe('Middleware use', function() {
    it('Render Html', function(){
      var req = {};
      var expected = '<script src="//'+api_url+'" async defer></script>'+
      '<div class="g-recaptcha" data-sitekey="SITE_KEY"></div>';

      recaptcha.init('SITE_KEY','SECRET_KEY');
      recaptcha.middleware.render(req,{},function(){});

      req.recaptcha.should.be.equal(expected);
    });

    it('Verify', function(done){
      var req = {body:{'g-recaptcha-response':'1234578910'}};
      this.httpTestHelper.build();

      recaptcha.init('SITE_KEY','SECRET_KEY');

      recaptcha.middleware.verify(req,{}, function(){
        req.recaptcha.should.be.ok;
        (req.recaptcha.error === null).should.be.true();
        this.httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910');
        done();
      }.bind(this));
    });

    it('Verify with error', function(done){
      this.httpTestHelper.withErrorCode('invalid-input-response').build();
      var req = {body:{'g-recaptcha-response':'1234578910'}};

      recaptcha.init('SITE_KEY','SECRET_KEY');

      recaptcha.middleware.verify(req,{}, function(){
        req.recaptcha.should.be.ok;
        req.recaptcha.error.should.be.equal('invalid-input-response');
        this.httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910');
        done();
      }.bind(this));
    });
  });
});
