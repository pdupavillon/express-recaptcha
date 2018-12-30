///<reference path="../../src/typings/express-recaptcha.ts" />
import { expect } from 'chai';
import { Request, Response } from 'express';

import { RecaptchaV2 } from '../../src';
import { RecaptchaOptionsV2, RecaptchaResponseDataV2 } from '../../src/interfaces';

export class RecaptchaWrapperV2{
  private _isMiddleware:boolean;
  private _recaptcha:RecaptchaV2;
    constructor(isMiddleware:boolean, opt?:RecaptchaOptionsV2){
      this._isMiddleware = isMiddleware
      this._recaptcha = new RecaptchaV2('SITE_KEY', 'SECRET_KEY', opt)
    }
    static Init(isMiddleware:boolean, opt?:RecaptchaOptionsV2){
      return new RecaptchaWrapperV2(isMiddleware, opt)
    }
    render(){
      if (this._isMiddleware) {
        let res = <Response>{};
        this._recaptcha.middleware.render(<Request>{}, res,() => {});
        return res.recaptcha
      }
      return this._recaptcha.render()
    }
    renderWith(opt:RecaptchaOptionsV2){
      if (this._isMiddleware) {
        let res = <Response>{};
        this._recaptcha.middleware.renderWith(opt)(<Request>{}, res,() => {});
        return res.recaptcha
      }
      return this._recaptcha.renderWith(opt);
    }
    verify(req:Request, cb:(error?:string,data?:RecaptchaResponseDataV2)=>void){
      if (this._isMiddleware) {
        this._recaptcha.middleware.verify(req,<Response>{}, () => {
          expect(req).to.have.property('recaptcha');

          if (req.recaptcha.error === null) {
            cb(null, <RecaptchaResponseDataV2>req.recaptcha.data)
          } else {
            cb(req.recaptcha.error, null)
          }
        })
      }
      else this._recaptcha.verify(req,cb)
    }
  }