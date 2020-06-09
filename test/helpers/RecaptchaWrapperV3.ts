///<reference path="../../src/typings/express-recaptcha.ts" />
import { expect } from 'chai';
import { Request, Response } from 'express';

import { RecaptchaV3 } from '../../src';
import { RecaptchaOptionsV3, RecaptchaResponseDataV3 } from '../../src/interfaces';

export class RecaptchaWrapperV3{
  private _isMiddleware:boolean;
  private _recaptcha:RecaptchaV3;
    constructor(isMiddleware:boolean, opt?:RecaptchaOptionsV3){
      this._isMiddleware = isMiddleware
      this._recaptcha = new RecaptchaV3('SITE_KEY', 'SECRET_KEY', opt)
    }
    static Init(isMiddleware:boolean, opt?:RecaptchaOptionsV3){
      return new RecaptchaWrapperV3(isMiddleware, opt)
    }
    render(){
      if (this._isMiddleware) {
        let res = <Response>{};
        this._recaptcha.middleware.render(<Request>{}, res,() => {});
        return res.recaptcha
      }
      return this._recaptcha.render()
    }
    renderWith(opt:RecaptchaOptionsV3){
      if (this._isMiddleware) {
        let res = <Response>{};
        this._recaptcha.middleware.renderWith(opt)(<Request>{}, res,() => {});
        return res.recaptcha
      }
      return this._recaptcha.renderWith(opt);
    }
    verify(req:Request, cb:(error?:string,data?:RecaptchaResponseDataV3)=>void){
      if (this._isMiddleware) {
        this._recaptcha.middleware.verify(req,<Response>{}, () => {
          expect(req).to.have.property('recaptcha');
          
          if (req.recaptcha.error === null) {
            cb(null, <RecaptchaResponseDataV3>req.recaptcha.data)
          } else {
            cb(req.recaptcha.error, null)
          }
        })
      }
      else this._recaptcha.verify(req,cb)
    }
  }