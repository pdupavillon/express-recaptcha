///<reference path="../../typings/index.d.ts" />
import { expect } from 'chai';
import { Request, Response } from 'express';

import { Recaptcha } from '../../src';
import { RecaptchaOptions, RecaptchaResponseData } from '../../src/interfaces';

export class RecaptchaWrapper{
  private _isMiddleware:boolean;
  private _recaptcha:Recaptcha;
    constructor(isMiddleware:boolean, opt?:RecaptchaOptions){
      this._isMiddleware = isMiddleware
      this._recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY', opt)
    }
    static Init(isMiddleware:boolean, opt?:RecaptchaOptions){
      return new RecaptchaWrapper(isMiddleware, opt)
    }
    render(){
      if (this._isMiddleware) {
        let res = <Response>{};
        this._recaptcha.middleware.render(<Request>{}, res,() => {});
        return res.recaptcha
      }
      return this._recaptcha.render()
    }
    verify(req:Request, cb:(error?:string,data?:RecaptchaResponseData)=>void){
      if (this._isMiddleware) {
        this._recaptcha.middleware.verify(req,<Response>{}, () => {
          expect(req).to.have.property('recaptcha');

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