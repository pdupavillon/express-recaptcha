import {Request, Response, NextFunction} from 'express';
import { RecaptchaOptionsV2, RecaptchaOptionsV3 } from './RecaptchaOptions';

export interface RecaptchaMiddleware {
    renderWith(optionsToOverride: RecaptchaOptionsV2 | RecaptchaOptionsV3): (req : Request, res : Response, next : NextFunction) => void; 
    render(req: Request, res : Response, next : NextFunction): void; 
    verify(req : Request, res : Response, next : NextFunction): void;
}