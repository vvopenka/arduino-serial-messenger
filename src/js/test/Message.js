const chai = require("chai");
const expect  = chai.expect;

const Message = require("../lib/Message");
const MessageType = require("../lib/MessageType");
const FixedSizeMessageType = MessageType.FixedSizeMessageType;
const VariableSizeMessageType = MessageType.VariableSizeMessageType;

describe("Message of fixed size", function () {
    it("Creates a message only of defined size.", function () {
        let type = new FixedSizeMessageType(0, 1);
        expect(() => new Message(type, [])).to.throw();
        expect(() => new Message(type, [1, 2])).to.throw();
    });

    it("Builds packet with no data correctly.", function () {
        let type = new FixedSizeMessageType(0, 0);
        let message = new Message(type);
        expect(message.buildPacket()).to.deep.equal(Buffer.from([0]));
    });

    it("Builds packet with data.", function () {
        let type = new FixedSizeMessageType(0, 5);
        let message = new Message(type, [1, 2, 3, 4, 5]);
        expect(message.buildPacket()).to.deep.equal(Buffer.from([0, 1, 2, 3, 4, 5]));
    });
});

describe("Message of variable size", function () {
    it("Doesn't allow message with bigger than allowed size.", function () {
        let type = new VariableSizeMessageType(0, 1);
        expect(() => new Message(type, [1, 2])).to.throw();
    });

    it("Builds packet with no data correctly.", function () {
        let type = new VariableSizeMessageType(0, 1);
        let message = new Message(type, []);
        expect(message.buildPacket()).to.deep.equal(Buffer.from([1, 0]));
    });

    it("Builds packet with data.", function () {
        let type = new VariableSizeMessageType(0, 5);
        let message = new Message(type, [1, 2, 3, 4]);
        expect(message.buildPacket()).to.deep.equal(Buffer.from([1, 4, 1, 2 ,3, 4]));
    });
});