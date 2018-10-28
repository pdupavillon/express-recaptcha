import {Request, Response, NextFunction} from 'express';
import { RecaptchaOptions } from './RecaptchaOptions';

export interface RecaptchaMiddleware {
    renderWith(optionsToOverride: RecaptchaOptions): (req : Request, res : Response, next : NextFunction) => void; 
    render(req: Request, res : Response, next : NextFunction): void; 
    verify(req : Request, res : Response, next : NextFunction): void;
}