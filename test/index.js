const Should = require('should')
const Sinon = require('sinon')
const Recaptcha = require('../lib/express-recaptcha.js')
const HttpTestHelper = require('./helpers/httpTestHelper')
const RecaptchaWrapper = require('./helpers/recaptchaWrapper')
const API_URL = 'www.google.com/recaptcha/api.js'

describe('Recaptcha', () => {
  let _httpTestHelper = null
  let _isMiddleware = false
  const Render = () => {
    const result = RecaptchaWrapper.Init(_isMiddleware).render()
    const expected = '<script src="//'+API_URL+'" async defer></script>'+
    '<div class="g-recaptcha" data-sitekey="SITE_KEY"></div>'
    result.should.be.equal(expected)
  }
  const RenderWithOption = () => {
    const result = RecaptchaWrapper.Init(_isMiddleware ,{
      onload:'cb',
      render:'explicit',
      hl:'fr',
      theme:'dark',
      type:'audio',
      callback:'callback',
      expired_callback:'expired_callback',
      size:'size',
      tabindex:'tabindex'
    }).render()
    const expected = '<script src="//'+API_URL+'?onload=cb&render=explicit&hl=fr" async defer></script>'+
    '<div class="g-recaptcha" data-sitekey="SITE_KEY" data-theme="dark" data-type="audio" data-callback="callback" data-expired-callback="expired_callback" data-size="size" data-tabindex="tabindex"></div>'
    result.should.be.equal(expected)
  }

  const Verify = (done) => {
      _httpTestHelper.build()
      RecaptchaWrapper.Init(_isMiddleware).verify({body:{'g-recaptcha-response':'1234578910'}}, (error, data) => {
        Should(error).be.exactly(null)

        data.should.have.property('hostname').which.be.equal(_httpTestHelper.testHost)
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910')
        done()
      })
  }
  const VerifyError = (done) => {
      _httpTestHelper.withErrorCode('invalid-input-response').build()

      RecaptchaWrapper.Init(_isMiddleware).verify({body:{'g-recaptcha-response':'1234578910'}}, (error, data) => {
        Should(data).be.exactly(null)

        error.should.be.equal("invalid-input-response")
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910')
        done()
      })
  }
  const VerifyClientIpHeader = (done) => {
      _httpTestHelper.build()

      RecaptchaWrapper.Init(_isMiddleware, {checkremoteip: true}).verify({body:{'g-recaptcha-response':'1234578910'},headers:{'x-forwarded-for':'10.0.0.1'}}, (error) => {
        (error === null).should.be.true()
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910&remoteip=10.0.0.1')
        done()
      })
  }
  const VerifyClientIpRemoteAddr = (done) => {
      _httpTestHelper.build()

      RecaptchaWrapper.Init(_isMiddleware, {checkremoteip: true}).verify({body:{'g-recaptcha-response':'1234578910'}, connection:{remoteAddress:'10.0.0.1'}}, (error) => {
        (error === null).should.be.true()
        _httpTestHelper.checkValidationQueryString('secret=SECRET_KEY&response=1234578910&remoteip=10.0.0.1')
        done()
      })
  }  
  beforeEach(() => {
    _httpTestHelper = new HttpTestHelper()
  })
	afterEach(() => {
    _httpTestHelper.restore()
	})

  it('Init', () => {
    let recaptcha = new Recaptcha('SITE_KEY','SECRET_KEY')
    recaptcha.should.be.ok
    recaptcha._site_key.should.be.ok().and.be.equal('SITE_KEY')
    recaptcha._secret_key.should.be.ok().and.be.equal('SECRET_KEY')
    recaptcha._options.checkremoteip.should.be.false()
  })

  it('Init with options', () => {
    let recaptcha = new Recaptcha('SITE_KEY','SECRET_KEY',{
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
    recaptcha.should.be.ok
    recaptcha._site_key.should.be.ok().and.be.equal('SITE_KEY')
    recaptcha._secret_key.should.be.ok().and.be.equal('SECRET_KEY')
    recaptcha._options.should.be.ok
    recaptcha._options.onload.should.be.equal('cb')
    recaptcha._options.render.should.be.equal('explicit')
    recaptcha._options.hl.should.be.equal('fr')
    recaptcha._options.theme.should.be.equal('dark')
    recaptcha._options.type.should.be.equal('audio')
    recaptcha._options.callback.should.be.equal('callback')
    recaptcha._options.expired_callback.should.be.equal('expired_callback')
    recaptcha._options.size.should.be.equal('size')
    recaptcha._options.tabindex.should.be.equal('tabindex')
    recaptcha._options.checkremoteip.should.be.true()
  })

  it('Not init', () => {
    (() => new Recaptcha()).should.throw('site_key is required');
    (() => new Recaptcha('SITE_KEY')).should.throw('secret_key is required');
  })

  describe('Direct use', () => {
    beforeEach(() => { _isMiddleware = false})
    it('Render', () => Render())
    it('Render with options', () => RenderWithOption())
    it('Verify', (done) => Verify(done))
    it('Verify with error', (done) => VerifyError(done))
    it('Verify client ip - x-forwarded-for header', (done) => VerifyClientIpHeader(done))
    it('Verify client ip - connection remote addr', (done) => VerifyClientIpRemoteAddr(done))
  })

  describe('Middleware use', () => {
    beforeEach(() => { _isMiddleware = true })
    it('Render', () => Render())
    it('Render with options', () => RenderWithOption())
    it('Verify', (done) => Verify(done))
    it('Verify with error', (done) => VerifyError(done))
    it('Verify client ip - x-forwarded-for header', (done) => VerifyClientIpHeader(done))
    it('Verify client ip - connection remote addr', (done) => VerifyClientIpRemoteAddr(done))
  })
})
