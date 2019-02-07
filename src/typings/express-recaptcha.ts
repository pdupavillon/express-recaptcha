import { RecaptchaResponseV2,RecaptchaResponseV3 } from '../interfaces';

declare global {
    namespace Express {
        export interface Request {
            recaptcha?: RecaptchaResponseV2|RecaptchaResponseV3;
        }
        export interface Response {
            recaptcha?: string;
        }
    }
}
