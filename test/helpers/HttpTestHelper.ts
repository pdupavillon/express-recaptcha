import { expect } from 'chai';
import * as Https from 'https';
import * as Sinon from 'sinon';
import { PassThrough } from 'stream';

export const HostName = 'www.test-host.com';

export class HttpTestHelper {
    private httpBodyResponse:string;
    private requestIssue?:string;
    private writeSpy:any;

    constructor() {
        this.httpBodyResponse = '{"success":true, "hostname":"' + HostName + '"}';
    }
    withErrorCode(errorCode:string) {
        this.httpBodyResponse = '{"success":false, "error-codes": [ "' + errorCode + '" ]}';
        return this;
    }
    withBadJSONBody() {
        this.httpBodyResponse =
            '<html><body>404 page not found exception</body></html>';
        return this;
    }
    withRequestError() {
        this.requestIssue = 'google.com dns not found';
        return this;
    }
    build() {
        this._setHttpsStub()
    }
    checkValidationQueryString(expected:any) {
        expect(this.writeSpy.calledOnce).to.be.true;
        expect(this.writeSpy.calledWith(expected)).to.be.true;
    }
    restore(){
        const request = Https.request as Sinon.SinonStub;
        if (request && request.restore) request.restore();
    }
    _setHttpsStub() {
        let that = this
        let request = new PassThrough()
        let _cb = (res:any)=> {}
        let onSpy = Sinon.spy((event:any,listener:any)=>request.on(event,listener))
        let endSpy = Sinon.spy(()=>{
            if(this.requestIssue){
                request.emit('error',new Error(this.requestIssue))
            }
            else{
                _cb(request);
            }
        })
        this.writeSpy = Sinon.spy()
        request.push(this.httpBodyResponse)
        request.end()

        Sinon.stub(Https, 'request').callsFake((opt, cb:any) => {
            _cb = cb;
            return <any>{
                write: that.writeSpy,
                end: endSpy,
                on: onSpy
            }
        })
    }
}