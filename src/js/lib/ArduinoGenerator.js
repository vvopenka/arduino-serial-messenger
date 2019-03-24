
class ArduinoGenerator {

    /**
     * Creates a generator or Arduion code from message definitions.
     * @param {int} [options.baudRate] The baudRate to use
     * @param {MessageType[]} options.messageTypes An array of configured message types
     */
    constructor(options) {
        this.options = Object.assign({}, {
            baudRate: 115200,
            messageTypes: []
        }, options);
    }

    generateCode() {
        ;
    }
}

module.exports = ArduinoGenerator;