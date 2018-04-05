import { RecaptchaResponseData } from "./RecaptchaResponseData";

export interface RecaptchaResponse {
    error?: string,
    data?: RecaptchaResponseData
}