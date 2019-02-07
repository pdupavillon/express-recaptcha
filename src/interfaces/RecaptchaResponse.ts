import { RecaptchaResponseDataV2, RecaptchaResponseDataV3 } from "./RecaptchaResponseData";

export interface RecaptchaResponseV2 {
    error?: string,
    data?: RecaptchaResponseDataV2
}

export interface RecaptchaResponseV3 {
    error?: string,
    data?: RecaptchaResponseDataV3
}