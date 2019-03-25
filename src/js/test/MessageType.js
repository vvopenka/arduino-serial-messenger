const chai = require("chai");
const expect  = chai.expect;

const MessageType = require("../lib/MessageType");
const FixedSizeMessageType = MessageType.FixedSizeMessageType;
const VariableSizeMessageType = MessageType.VariableSizeMessageType;

describe("FixedSizeMessageType", function () {
    it("Throws error when id bigger than 126.", function () {
        expect(() => new FixedSizeMessageType(127, 0)).to.throw(Error, /.*/, "127 should be invalid id");
        expect(() => new FixedSizeMessageType(-1, 0)).to.throw(Error, /.*/, "-1 should be invalid id");
    });
    it("Throws error when data size is out of bound.", function () {
        expect(() => new FixedSizeMessageType(0, 256)).to.throw(Error, /.*/, "256 shoud be out of bound");
        expect(() => new FixedSizeMessageType(0, -1)).to.throw(Error, /.*/, "-1 should be out of bound");
    });
    it("Type without data created.", function () {
        let type = new FixedSizeMessageType(0, 0);
        expect(type.getTypeByte()).to.equal(0);
        expect(type.getMaximalPacketSize()).to.equal(1);
    });
    it("Type with data created.", function () {
        let type = new FixedSizeMessageType(1, 10);
        expect(type.getTypeByte()).to.equal(2);
        expect(type.getMaximalPacketSize()).to.equal(11);
    })
});

describe("VariableSizeMessageType", function () {
    it("Throws error when id bigger than 126.", function () {
        expect(() => new VariableSizeMessageType(127)).to.throw(Error, /.*/, "127 should be invalid id");
        expect(() => new VariableSizeMessageType(-1)).to.throw(Error, /.*/, "-1 should be invalid id");
    });

    it("Throws error when maximal lenght is out of bound.", function () {
        expect(() => new VariableSizeMessageType(0, 256)).to.throw(Error, /.*/, "256 shoud be out of bound");
        expect(() => new VariableSizeMessageType(0, -1)).to.throw(Error, /.*/, "-1 should be out of bound");
    });

    it("Defaults maximal length to 255.", function () {
        let type = new VariableSizeMessageType(0);
        expect(type.getMaximalLength()).to.equal(255);
    });

    it("Type without data created.", function () {
        let type = new VariableSizeMessageType(0, 0);
        expect(type.getTypeByte()).to.equal(1);
        expect(type.getMaximalPacketSize()).to.equal(2);
    });

    it("Type with data created.", function () {
        let type = new VariableSizeMessageType(1, 10);
        expect(type.getTypeByte()).to.equal(3);
        expect(type.getMaximalPacketSize()).to.equal(12);
    })
});