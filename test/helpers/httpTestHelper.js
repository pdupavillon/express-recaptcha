const {PassThrough} = require('stream')
const Sinon = require('sinon')
const Https = require('https')

module.exports = class HttpTestHelper {
    constructor() {
        this.testHost = 'www.test-host.com'
        this.httpBodyResponse = '{"success":true, "hostname":"' + this.testHost + '"}'
    }
    withErrorCode(errorCode) {
        this.httpBodyResponse = '{"success":false, "error-codes": [ "' + errorCode + '" ]}'
        return this
    }

    build() {
        this._setHttpsStub()
    }
    checkValidationQueryString(expected) {
        this.writeSpy.calledOnce.should.be.true()
        this.writeSpy.calledWith(expected).should.be.true()
    }
    restore(){
        if (Https.request.restore) Https.request.restore()
    }
    _setHttpsStub() {
        let that = this
        let request = new PassThrough()
        this.writeSpy = Sinon.spy()

        request.push(this.httpBodyResponse)
        request.end()

        this.httpsStub = Sinon.stub(Https, 'request').callsFake((opt, cb) => {
            cb(request)
            return {
                write: that.writeSpy,
                end: Sinon.spy()
            }
        })
    }
}