import {RecaptchaResponse} from '../src/interfaces';

declare global {
    namespace Express {
        export interface Request {
            recaptcha?: RecaptchaResponse;
        }
        export interface Response {
            recaptcha?: string;
        }
    }
}