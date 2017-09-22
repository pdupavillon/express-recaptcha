import Recaptcha from '../src/express-recaptcha'

export default class RecaptchaWrapper{
    constructor(isMiddleware, opt){
      this._isMiddleware = isMiddleware
      this._recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY', opt)
    }
    static Init(isMiddleware, opt){
      return new RecaptchaWrapper(isMiddleware, opt)
    }
    render(req){
      if (this._isMiddleware) { var req = {}; this._recaptcha.middleware.render(req,{},() => {}); return req.recaptcha}
      return this._recaptcha.render()
    }
    verify(req, cb){
      if (this._isMiddleware) {
        this._recaptcha.middleware.verify(req,{}, () => {
          req.recaptcha.should.be.ok()
  
          if (req.recaptcha.error === null) {
            cb(null, {hostname: req.recaptcha.hostname})
          } else {
            cb(req.recaptcha.error, null)
          }
        })
      }
      else this._recaptcha.verify(req,cb)
    }
  }