import { expect } from 'chai';
import { Request } from 'express';

import { RecaptchaV3 } from '../src';
import { HostName, HttpTestHelper } from './helpers/HttpTestHelper';
import { RecaptchaWrapperV3 } from './helpers/RecaptchaWrapperV3';

const API_URL = 'www.google.com/recaptcha/api.js'

describe('Recaptcha v3', () => {
  let _httpTestHelper:HttpTestHelper;
  let _isMiddleware = false;
  const Render = () => {
    const result = RecaptchaWrapperV3.Init(_isMiddleware,{callback:'cb'}).render()
    const expected = '<script src="//'+API_URL+'?render=SITE_KEY"></script>'+
    '<script>grecaptcha.ready(function(){grecaptcha.execute(\'SITE_KEY\', {action: \'homepage\'}).then(cb);});</script>';
    expect(result).to.equal(expected)
  }
  const RenderWithOption = () => {
    const result = RecaptchaWrapperV3.Init(_isMiddleware ,{
      onload:'cb',
      hl:'fr',
      callback:'callback'
    }).render();
    const expected = '<script src="//'+API_URL+'?render=SITE_KEY&onload=cb&hl=fr"></script>'+
    '<script>grecaptcha.ready(function(){grecaptcha.execute(\'SITE_KEY\', {action: \'homepage\'}).then(callback);});</script>';
    expect(result).to.equal(expected)
  }
  const RenderWithoutAction = () => {
    expect(() => RecaptchaWrapperV3.Init(_isMiddleware ,{
      action:undefined,
      callback:'callback'
    }).render()).to.throw('action is required');
  }

  const RenderWithoutCallback = () => {
    expect(() => RecaptchaWrapperV3.Init(_isMiddleware ,{
      action:'homepage',
      callback:undefined
    }).render()).to.throw('callback is required');
  }

  const RenderWithOverridedOptions = () => {
    const result = RecaptchaWrapperV3.Init(_isMiddleware ,{
      onload:'cb',
      hl:'fr',
      callback:'callback'
    }).renderWith({
      hl:'de'
    });
    const expected = '<script src="//'+API_URL+'?render=SITE_KEY&onload=cb&hl=de"></script>'+
    '<script>grecaptcha.ready(function(){grecaptcha.execute(\'SITE_KEY\', {action: \'homepage\'}).then(callback);});</script>';
    expect(result).to.equal(expected)
  }

  const Verify = (done: ()=>void, reqType = 'body') => {
      let req = <Request>{};
      (<any>req)[reqType] = {'g-recaptcha-response':'1234578910'};
      _httpTestHelper.build();
      RecaptchaWrapperV3.Init(_isMiddleware).verify(req, (error, data) => {
        expect(error).to.be.null;
        expect(data).to.have.property('hostname').which.be.equal(HostName);

        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910')
        done()
      })
  }
  const VerifyError = (done:()=>void) => {
      _httpTestHelper.withErrorCode('invalid-input-response').build()

      RecaptchaWrapperV3.Init(_isMiddleware).verify(<Request>{body:{'g-recaptcha-response':'1234578910'}}, (error, data) => {
        expect(data).to.be.null;

        expect(error).to.be.equal("invalid-input-response")
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910')
        done()
      })
  }
  const VerifyErrorWithBadJSONResponse = (done: () => void) => {
    _httpTestHelper.withBadJSONBody().build();

    RecaptchaWrapperV3.Init(_isMiddleware).verify(
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
      RecaptchaWrapperV3.Init(_isMiddleware, {checkremoteip: true}).verify(<Request><any>req, (error) => {
        expect(error).to.be.null;
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910&remoteip=10.0.0.1')
        done()
      })
  }
  const VerifyClientIpRemoteAddr = (done:()=>void) => {
      _httpTestHelper.build()
    let req = {body:{'g-recaptcha-response':'1234578910'}, connection:{remoteAddress:'10.0.0.1'}};
      RecaptchaWrapperV3.Init(_isMiddleware, {checkremoteip: true}).verify(<Request><any>req, (error) => {
        expect(error).to.be.null;
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910&remoteip=10.0.0.1')
        done()
      })
  }
  const VerifyErrorWithBadRequest = (done: () => void) => {
    _httpTestHelper.withRequestError().build();

    RecaptchaWrapperV3.Init(_isMiddleware).verify(
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
    let recaptcha = new RecaptchaV3('SITE_KEY','SECRET_KEY')
    expect(recaptcha).to.be.instanceof(RecaptchaV3);
    expect(recaptcha).to.have.property('_site_key').equal('SITE_KEY');
    expect(recaptcha).to.have.property('_secret_key').equal('SECRET_KEY');
    expect(recaptcha).to.have.property('_options').that.have.property('checkremoteip').that.is.false;
  })

  it('Init with options', () => {
    let recaptcha = new RecaptchaV3('SITE_KEY','SECRET_KEY',{
      onload:'cb',
      hl:'fr',
      callback:'callback',
      checkremoteip:true
    })
    expect(recaptcha).to.be.instanceof(RecaptchaV3);
    expect(recaptcha).to.have.property('_site_key').to.be.equal('SITE_KEY')
    expect(recaptcha).to.have.property('_secret_key').to.be.equal('SECRET_KEY')
    expect(recaptcha).to.have.property('_options')
    .to.include({
      onload:'cb',
      hl:'fr',
      callback:'callback',
      checkremoteip:true
    });
  })

  it('Not init', () => {
    expect(() => new RecaptchaV3(<any>null, <any>null)).to.throw('site_key is required');
    expect(() => new RecaptchaV3('SITE_KEY', <any>null)).to.throw('secret_key is required');
  })

  describe('Direct use', () => {
    beforeEach(() => { _isMiddleware = false})
    it('Render', () => Render())
    it('Render with options', () => RenderWithOption())
    it('Render with overrided options', () => RenderWithOverridedOptions())
    it('Render without action', () => RenderWithoutAction())
    it('Render without callback', () => RenderWithoutCallback())
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
    it('Render without action', () => RenderWithoutAction())
    it('Render without callback', () => RenderWithoutCallback())
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
