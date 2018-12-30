export interface RecaptchaOptionsV2 {
    onload?: string;
    checkremoteip?: boolean;
    render?: string;
    hl?: string;
    theme?: string;
    type?: string;
    callback?: string;
    expired_callback?: string;
    size?: string;
    tabindex?: string;
}
export interface RecaptchaOptionsV3 {
    onload?: string;
    checkremoteip?: boolean;
    hl?: string;
    callback?: string;
    action?:string;
}