const EventEmitter = require('events');
const SerialPort = require("serialport");
const Message = require("./Message");

class SerialMessenger extends EventEmitter  {
    /**
     * 
     * @param {String} options.path Path to serial port passed to SerialPort
     * @param {int} [options.baudRate] The baudRate to use
     * @param {MessageType[]} options.messageTypes An array of configured message types
     * @param {SerialPort} [serialport] A serial port to use. If it's not provided, it will be constructed based on options.
     */
    constructor(options, serialport) {
        super();
        this.options = Object.assign({}, {
            baudRate: 115200,
            messageTypes: []
        }, options);

        if (serialport) {
            this.sp = serialport;
        } else {
            this.sp = new SerialPort(this.options.path, {
                baudRate: this.options.baudRate
            });
        }
        this.sp.on("data", this._handleData.bind(this));

        this.buffer = [];
    }

    _getMessageType(messageTypeByte) {
        for (let messageType of this.options.messageTypes) {
            if (messageType.getTypeByte() === messageTypeByte) {
                return messageType;
            }
        }
        return null;
    }

    _processSingleMessage() {
        let removeFromBuffer;
        if (this.buffer.length === 0) {
            return false;
        }
        let messageType = this._getMessageType(this.buffer[0]);
        if (messageType === null) {
            this.emit("unknowtype", this.buffer[0]);
            this.buffer.shift();
            return true;
        }
        let data;
        if (messageType.isFixedSize()) {
            let dataSize = messageType.getSizeOfData();
            if (this.buffer.length < dataSize + 1) {
                return false;
            }
            data = this.buffer.slice(1, dataSize + 1);
            removeFromBuffer = dataSize + 1;
        } else {
            if (this.buffer.length === 1) {
                return false;
            }
            let dataSize = this.buffer[1];
            if (this.buffer.length < dataSize + 2) {
                return false;
            }
            data = this.buffer.slice(2, dataSize + 2);
            removeFromBuffer = dataSize + 2;
        }
        this.buffer.splice(0, removeFromBuffer);
        let message = new Message(messageType, data);
        this.emit("message", message);
        if (messageType.getReceiveHandler()) {
            messageType.getReceiveHandler()(message);
        }
        return true;
    }

    _handleData(data) {
        for (let i = 0; i < data.length; i++) {
            this.buffer.push(data[i]);
        }
        while (this._processSingleMessage()) {
        }
    }

    sendMessage(message) {
        this.sp.write(message.buildPacket());
    }

    sendData(messageType, data) {
        let message = new Message(messageType, data);
        this.sendMessage(message);
    }
}

module.exports = SerialMessenger;