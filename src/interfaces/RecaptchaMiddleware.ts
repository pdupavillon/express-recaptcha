import {Request, Response, NextFunction} from 'express';

export interface RecaptchaMiddleware {
    render(req : Request, res : Response, next : NextFunction) : void;
    verify(req : Request, res : Response, next : NextFunction) : void;
}