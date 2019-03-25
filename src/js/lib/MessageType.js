
class MessageType {
    constructor(typeId, receiveHandler) {
        if (typeId < 0 || typeId > 126) {
            throw new Error("Maximum type allowed is 126. Type passed in: " + typeId);
        }
        this.typeId = typeId;
        this.receiveHandler = receiveHandler;
    }
    getTypeId() {
        return this.typeId;
    }
    isFixedSize() {
        throw new Error("You shouldn't initialize MessageType class, it should be used only from child classes");
    }
    getMaximalPacketSize() {
        throw new Error("You shouldn't initialize MessageType class, it should be used only from child classes");
    }
    getTypeByte() {
        if (isNaN(this.typeByte)) {
            let sizeTypeBit = this.isFixedSize() ? 0 : 1;
            this.typeByte = 0xFF & ((this.typeId << 1) | sizeTypeBit);
        }
        return this.typeByte;
    }
    getReceiveHandler() {
        return this.receiveHandler;
    }
}

class FixedSizeMessageType extends MessageType {
    constructor(typeId, sizeOfData, receiveHandler) {
        super(typeId, receiveHandler);
        if (sizeOfData < 0 || sizeOfData > 255) {
            throw new Error("Maximal size of data is 255");
        }
        this.sizeOfData = sizeOfData;
    }
    isFixedSize() {
        return true;
    }
    getSizeOfData() {
        return this.sizeOfData;
    }
    getMaximalPacketSize() {
        return this.sizeOfData + 1;
    }
}

class VariableSizeMessageType extends MessageType {
    constructor(typeId, maximalLength, receiveHandler) {
        super(typeId, receiveHandler);
        if (isNaN(maximalLength)) {
            maximalLength = 255;
        }
        if (maximalLength < 0 || maximalLength > 255) {
            throw new Error("Maximal lenght allowed is 255");
        }
        this.maximalLength = maximalLength;
    }
    isFixedSize() {
        return false;
    }
    getMaximalLength() {
        return this.maximalLength;
    }
    getMaximalPacketSize() {
        return this.maximalLength + 2;
    }
}

module.exports = {
    MessageType: MessageType,
    FixedSizeMessageType: FixedSizeMessageType,
    VariableSizeMessageType: VariableSizeMessageType
};