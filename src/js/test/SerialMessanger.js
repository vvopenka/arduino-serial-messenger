const chai = require("chai");
const expect  = chai.expect;
const EventEmitter = require('events');

const SerialMessenger = require("../lib/SerialMessenger");
const MessageType = require("../lib/MessageType");
const FixedSizeMessageType = MessageType.FixedSizeMessageType;
const VariableSizeMessageType = MessageType.VariableSizeMessageType;

class FakeSerialPort extends EventEmitter {
    constructor() {
        super();
        this.writes = [];
    }
    write(buffer) {
        this.writes.push(buffer);
    }
}

describe("SerialMessenger", function () {
    it("Send data writes to serial port.", function () {
        let sp = new FakeSerialPort();
        let sm = new SerialMessenger({}, sp);
        let type = new FixedSizeMessageType(0, 1);
        sm.sendData(type, [1]);
        expect(sp.writes.length).to.equal(1);
        expect(sp.writes[0]).to.deep.equal(Buffer.from([0, 1]));
    });

    it("Fixed message with no body recieved correctly", function () {
        let sp = new FakeSerialPort();
        let type = new FixedSizeMessageType(0, 0);
        let sm = new SerialMessenger({
            messageTypes: [type]
        }, sp);
        let message = null;
        sm.on("message", function (msg) {
            message = msg;
        });
        sp.emit("data", Buffer.from([0]));
        expect(message).to.not.equal(null);
        expect(message.getMessageType()).to.equal(type);
        expect(message.getDataSize()).to.equal(0);
    });

    it("Fixed message with body recieved correctly", function () {
        let sp = new FakeSerialPort();
        let type = new FixedSizeMessageType(0, 2);
        let sm = new SerialMessenger({
            messageTypes: [type]
        }, sp);
        let message = null;
        sm.on("message", function (msg) {
            message = msg;
        });
        sp.emit("data", Buffer.from([0, 1, 2]));
        expect(message).to.not.equal(null);
        expect(message.getMessageType()).to.equal(type);
        expect(message.getDataSize()).to.equal(2);
        expect(message.getData()).to.deep.equal([1, 2]);
    });

    it("Variable size message with no body recieved correctly", function () {
        let sp = new FakeSerialPort();
        let type = new VariableSizeMessageType(0, 0);
        let sm = new SerialMessenger({
            messageTypes: [type]
        }, sp);
        let message = null;
        sm.on("message", function (msg) {
            message = msg;
        });
        sp.emit("data", Buffer.from([1, 0]));
        expect(message).to.not.equal(null);
        expect(message.getMessageType()).to.equal(type);
        expect(message.getDataSize()).to.equal(0);
    });

    it("Variable size message with body recieved correctly", function () {
        let sp = new FakeSerialPort();
        let type = new VariableSizeMessageType(0, 5);
        let sm = new SerialMessenger({
            messageTypes: [type]
        }, sp);
        let message = null;
        sm.on("message", function (msg) {
            message = msg;
        });
        sp.emit("data", Buffer.from([1, 2, 1, 2]));
        expect(message).to.not.equal(null);
        expect(message.getMessageType()).to.equal(type);
        expect(message.getDataSize()).to.equal(2);
        expect(message.getData()).to.deep.equal([1, 2]);
    });

    it("Correct message chozen", function () {
        let sp = new FakeSerialPort();
        let type = new FixedSizeMessageType(0, 0);
        let sm = new SerialMessenger({
            messageTypes: [new FixedSizeMessageType(1, 0), new FixedSizeMessageType(2, 0), type]
        }, sp);
        let message = null;
        sm.on("message", function (msg) {
            message = msg;
        });
        sp.emit("data", Buffer.from([0]));
        expect(message).to.not.equal(null);
        expect(message.getMessageType()).to.equal(type);
    });

    it("Unknown message type ignored", function () {
        let sp = new FakeSerialPort();
        let sm = new SerialMessenger({
            messageTypes: [new FixedSizeMessageType(0, 0), new FixedSizeMessageType(1, 0), new FixedSizeMessageType(2, 0)]
        }, sp);
        let message = null;
        let unknowtype = null;
        sm.on("message", function (msg) {
            message = msg;
        });
        sm.on("unknowntype", function (data) {
            unknowtype = data;
        });
        sp.emit("data", Buffer.from([3]));
        expect(message).to.equal(null);
        expect(unknowtype).to.equal(3);
    });

    it("Multiple messages parsed at once", function () {
        let sp = new FakeSerialPort();
        let sm = new SerialMessenger({
            messageTypes: [new FixedSizeMessageType(0, 0), new FixedSizeMessageType(1, 0), new FixedSizeMessageType(2, 0)]
        }, sp);
        let messages = [];
        let unknowtypeEmitted = false;
        sm.on("message", function (msg) {
            messages.push(msg);
        });
        sm.on("unknowntype", function () {
            unknowtypeEmitted = true;
        });
        sp.emit("data", Buffer.from([2 << 1, 1 << 1, 0]));
        expect(unknowtypeEmitted).to.equal(false);
        expect(messages.length).to.equal(3);
        expect(messages[0].getMessageType().getTypeId()).to.equal(2);
        expect(messages[1].getMessageType().getTypeId()).to.equal(1);
        expect(messages[2].getMessageType().getTypeId()).to.equal(0);
        for (let message of messages) {
            expect(message.getDataSize()).to.equal(0);
        }
    });

    it("Correct message parsed after an incorrect message", function () {
        let sp = new FakeSerialPort();
        let type = new VariableSizeMessageType(0, 5);
        let sm = new SerialMessenger({
            messageTypes: [type]
        }, sp);
        let messages = [];
        let unknowtypes = [];
        sm.on("message", function (msg) {
            messages.push(msg);
        });
        sm.on("unknowntype", function (data) {
            unknowtypes.push(data);
        });
        sp.emit("data", Buffer.from([3, 1, 2, 1, 2]));
        expect(unknowtypes).to.deep.equal([3]);
        expect(messages.length).to.equal(1);
        expect(messages[0].getMessageType()).to.equal(type);
        expect(messages[0].getData()).to.deep.equal([1, 2]);
    });

    it("Parses long message from multiple data packets", function () {
        let sp = new FakeSerialPort();
        let type = new FixedSizeMessageType(0, 5);
        let sm = new SerialMessenger({
            messageTypes: [type]
        }, sp);
        let message = null;
        let unknowtypeEmitted = false;
        sm.on("message", function (msg) {
            message = msg;
        });
        sm.on("unknowntype", function () {
            unknowtypeEmitted = true;
        });
        sp.emit("data", Buffer.from([0, 1]));
        expect(message).to.equal(null);
        expect(unknowtypeEmitted).to.equal(false);
        sp.emit("data", Buffer.from([2]));
        expect(message).to.equal(null);
        expect(unknowtypeEmitted).to.equal(false);
        sp.emit("data", Buffer.from([3, 4, 5]));
        expect(message).to.not.equal(null);
        expect(unknowtypeEmitted).to.equal(false);
        expect(message.getMessageType()).to.equal(type);
        expect(message.getData()).to.deep.equal([1, 2, 3, 4, 5]);
    });
});