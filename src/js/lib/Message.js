const MessageType = require("./MessageType").MessageType;

class Message {
    constructor(messageType, data) {
        data = data || [];
        if (!(messageType instanceof MessageType)) {
            throw new Error("Message type must be of type MessageType");
        }
        if (messageType.isFixedSize()) {
            if (data.length !== messageType.getSizeOfData()) {
                throw new Error("Data of fixed size message types must be the exact size declared in the message type. Declared: " + messageType.getSizeOfData() + " passed: " + data.length);
            }
        } else {
            if (data.length > messageType.getMaximalLength()) {
                throw new Error("Data exceeded maximum data size");
            }
        }
        this.messageType = messageType;
        this.data = data;
    }
    getMessageType() {
        return this.messageType;
    }
    getData() {
        return this.data;
    }
    getDataSize() {
        return this.data.length;
    }
    buildPacket() {
        let packet = [this.messageType.getTypeByte()];
        if (!this.messageType.isFixedSize()) {
            packet.push(this.data.length);
        }
        this.data.forEach(d => packet.push(d));
        return Buffer.from(packet);
    }
}

module.exports = Message;