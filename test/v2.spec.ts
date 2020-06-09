import { expect } from 'chai';
import { Request } from 'express';

import { RecaptchaV2 } from '../src';
import { HostName, HttpTestHelper } from './helpers/HttpTestHelper';
import { RecaptchaWrapperV2 } from './helpers/RecaptchaWrapperV2';

const API_URL = 'www.google.com/recaptcha/api.js'

describe('Recaptcha v2', () => {
  let _httpTestHelper:HttpTestHelper;
  let _isMiddleware = false;
  const Render = () => {
    const result = RecaptchaWrapperV2.Init(_isMiddleware).render()
    const expected = '<script src="//'+API_URL+'" async defer></script>'+
    '<div class="g-recaptcha" data-sitekey="SITE_KEY"></div>'
    expect(result).to.equal(expected)
  }
  const RenderWithOption = () => {
    const result = RecaptchaWrapperV2.Init(_isMiddleware ,{
      onload:'cb',
      render:'explicit',
      hl:'fr',
      theme:'dark',
      type:'audio',
      callback:'callback',
      expired_callback:'expired_callback',
      size:'size',
      tabindex:'tabindex'
    }).render();
    const expected = '<script src="//'+API_URL+'?onload=cb&render=explicit&hl=fr" async defer></script>'+
    '<div class="g-recaptcha" data-sitekey="SITE_KEY" data-theme="dark" data-type="audio" data-callback="callback" data-expired-callback="expired_callback" data-size="size" data-tabindex="tabindex"></div>'
    expect(result).to.equal(expected)
  }

  const RenderWithOverridedOptions = () => {
    const result = RecaptchaWrapperV2.Init(_isMiddleware ,{
      onload:'cb',
      render:'explicit',
      hl:'fr',
      theme:'dark',
      type:'audio',
      callback:'callback',
      expired_callback:'expired_callback',
      size:'size',
      tabindex:'tabindex'
    }).renderWith({
      theme:'light'
    });
    const expected = '<script src="//'+API_URL+'?onload=cb&render=explicit&hl=fr" async defer></script>'+
    '<div class="g-recaptcha" data-sitekey="SITE_KEY" data-theme="light" data-type="audio" data-callback="callback" data-expired-callback="expired_callback" data-size="size" data-tabindex="tabindex"></div>'
    expect(result).to.equal(expected)
  }

  const Verify = (done: ()=>void, reqType = 'body') => {
      let req = <Request>{};
      (<any>req)[reqType] = {'g-recaptcha-response':'1234578910'};
      _httpTestHelper.build();
      RecaptchaWrapperV2.Init(_isMiddleware).verify(req, (error, data) => {
        expect(error).to.be.null;
        expect(data).to.have.property('hostname').which.be.equal(HostName);

        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910')
        done()
      })
  }
  const VerifyError = (done:()=>void) => {
      _httpTestHelper.withErrorCode('invalid-input-response').build()

      RecaptchaWrapperV2.Init(_isMiddleware).verify(<Request>{body:{'g-recaptcha-response':'1234578910'}}, (error, data) => {
        expect(data).to.be.null;

        expect(error).to.be.equal("invalid-input-response")
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910')
        done()
      })
  }
  const VerifyErrorWithBadJSONResponse = (done: () => void) => {
    _httpTestHelper.withBadJSONBody().build();

    RecaptchaWrapperV2.Init(_isMiddleware).verify(
      <Request>{ body: { 'g-recaptcha-response': '1234578910' } },
      (error, data) => {
        expect(data).to.be.null;

        expect(error).to.be.equal('invalid-json-response');
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910');
        done();
      }
    );
  }
  const VerifyClientIpHeader = (done:()=>void) => {
      _httpTestHelper.build()
      let req = {
        body:{'g-recaptcha-response':'1234578910'},
        headers:{'x-forwarded-for':'10.0.0.1'}
      };
      RecaptchaWrapperV2.Init(_isMiddleware, {checkremoteip: true}).verify(<Request><any>req, (error) => {
        expect(error).to.be.null;
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910&remoteip=10.0.0.1')
        done()
      })
  }
  const VerifyClientIpRemoteAddr = (done:()=>void) => {
      _httpTestHelper.build()
    let req = {body:{'g-recaptcha-response':'1234578910'}, connection:{remoteAddress:'10.0.0.1'}};
      RecaptchaWrapperV2.Init(_isMiddleware, {checkremoteip: true}).verify(<Request><any>req, (error) => {
        expect(error).to.be.null;
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910&remoteip=10.0.0.1')
        done()
      })
  }
  const VerifyErrorWithBadRequest = (done: () => void) => {
    _httpTestHelper.withRequestError().build();

    RecaptchaWrapperV2.Init(_isMiddleware).verify(
      <Request>{ body: { 'g-recaptcha-response': '1234578910' } },
      (error, data) => {
        expect(data).to.be.null;

        expect(error).to.be.equal('google.com dns not found');
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910');
        done();
      }
    );
  }  
  beforeEach(() => {
    _httpTestHelper = new HttpTestHelper();
  })
	afterEach(() => {
    _httpTestHelper.restore()
	})

  it('Init', () => {
    let recaptcha = new RecaptchaV2('SITE_KEY','SECRET_KEY')
    expect(recaptcha).to.be.instanceof(RecaptchaV2);
    expect(recaptcha).to.have.property('_site_key').equal('SITE_KEY');
    expect(recaptcha).to.have.property('_secret_key').equal('SECRET_KEY');
    expect(recaptcha).to.have.property('_options').that.have.property('checkremoteip').that.is.false;
  })

  it('Init with options', () => {
    let recaptcha = new RecaptchaV2('SITE_KEY','SECRET_KEY',{
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
    })
    expect(recaptcha).to.be.instanceof(RecaptchaV2);
    expect(recaptcha).to.have.property('_site_key').to.be.equal('SITE_KEY')
    expect(recaptcha).to.have.property('_secret_key').to.be.equal('SECRET_KEY')
    expect(recaptcha).to.have.property('_options')
    .to.include({
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
  })

  it('Not init', () => {
    expect(() => new RecaptchaV2(<any>null, <any>null)).to.throw('site_key is required');
    expect(() => new RecaptchaV2('SITE_KEY', <any>null)).to.throw('secret_key is required');
  })

  describe('Direct use', () => {
    beforeEach(() => { _isMiddleware = false})
    it('Render', () => Render())
    it('Render with options', () => RenderWithOption())
    it('Render with overrided options', () => RenderWithOverridedOptions())
    it('Verify in req.body', (done) => Verify(done, 'body'))
    it('Verify in req.query', (done) => Verify(done, 'query'))
    it('Verify in req.params', (done) => Verify(done, 'params'))
    it('Verify with error', (done) => VerifyError(done))
    it('Verify with bad JSON response', done => VerifyErrorWithBadJSONResponse(done))
    it('Verify client ip - x-forwarded-for header', (done) => VerifyClientIpHeader(done))
    it('Verify client ip - connection remote addr', (done) => VerifyClientIpRemoteAddr(done))
    it('Verify with request error', (done) => VerifyErrorWithBadRequest(done))
  })

  describe('Middleware use', () => {
    beforeEach(() => { _isMiddleware = true })
    it('Render', () => Render())
    it('Render with options', () => RenderWithOption())
    it('Render with overrided options', () => RenderWithOverridedOptions())
    it('Verify in req.body', (done) => Verify(done, 'body'))
    it('Verify in req.query', (done) => Verify(done, 'query'))
    it('Verify in req.params', (done) => Verify(done, 'params'))
    it('Verify with error', (done) => VerifyError(done))
    it('Verify with bad JSON response', done => VerifyErrorWithBadJSONResponse(done))
    it('Verify client ip - x-forwarded-for header', (done) => VerifyClientIpHeader(done))
    it('Verify client ip - connection remote addr', (done) => VerifyClientIpRemoteAddr(done))
    it('Verify with request error', (done) => VerifyErrorWithBadRequest(done))
  })
})
