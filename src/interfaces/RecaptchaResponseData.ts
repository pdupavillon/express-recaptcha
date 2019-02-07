export interface RecaptchaResponseDataV2 {
    hostname?: string
}
export interface RecaptchaResponseDataV3 extends RecaptchaResponseDataV2 {
    score:number;
    action:string;
}