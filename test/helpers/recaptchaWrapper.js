const Recaptcha = require('../../lib/express-recaptcha')

module.exports = class RecaptchaWrapper{
    constructor(isMiddleware, opt){
      this._isMiddleware = isMiddleware
      this._recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY', opt)
    }
    static Init(isMiddleware, opt){
      return new RecaptchaWrapper(isMiddleware, opt)
    }
    render(){
      if (this._isMiddleware) { var res = {}; this._recaptcha.middleware.render({}, res,() => {}); return res.recaptcha}
      return this._recaptcha.render()
    }
    verify(req, cb){
      if (this._isMiddleware) {
        this._recaptcha.middleware.verify(req,{}, () => {
          req.recaptcha.should.be.ok()
  
          if (req.recaptcha.error === null) {
            cb(null, req.recaptcha.data)
          } else {
            cb(req.recaptcha.error, null)
          }
        })
      }
      else this._recaptcha.verify(req,cb)
    }
  }