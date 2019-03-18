const chai = require("chai");
const expect  = chai.expect;
const EventEmitter = require('events');

const SerialMessanger = require("../lib/SerialMessanger");
const MessageType = require("../lib/MessageType");
const FixedSizeMessageType = MessageType.FixedSizeMessageType;

class FakeSerialPort extends EventEmitter {
    constructor() {
        super();
        this.writes = [];
    }
    write(buffer) {
        this.writes.push(buffer);
    }
}

describe("SerialMessanger", function () {
    it("Send data writes to serial port.", function () {
        let sp = new FakeSerialPort();
        let sm = new SerialMessanger({}, sp);
        let type = new FixedSizeMessageType(0, 1);
        sm.sendData(type, [1]);
        expect(sp.writes.length).to.equal(1);
        expect(sp.writes[0]).to.deep.equal(Buffer.from([0, 1]));
    });

});