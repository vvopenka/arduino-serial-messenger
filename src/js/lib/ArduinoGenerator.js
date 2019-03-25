const path = require("path");
const fs = require("fs");

const H_FILE_PATH = path.join(__dirname, "../templates/Messenger.h");
const CPP_FILE_PATH = path.join(__dirname, "../templates/Messenger.cpp");

class ArduinoGenerator {

    /**
     * Creates a generator or Arduion code from message definitions.
     * @param {MessageType[]} messageTypes An array of configured message types
     */
    constructor(messageTypes) {
        this.messageTypes = messageTypes;
        this.messageTypes.sort(function (a, b) {
            return a.getTypeByte() - b.getTypeByte();
        });
    }

    _generateFixSizeDefinitions() {
        let definition = "";
        this.messageTypes.filter(t => t.isFixedSize()).forEach(type => {
            definition += `#define FIXED_MESSAGE_${type.getTypeId()}_LEN ${type.getSizeOfData()}\n`;
        });
        return definition;
    }

    _generateFixMessageSizeBlock() {
        let block = "";
        this.messageTypes.filter(t => t.isFixedSize()).forEach(type => {
            block += `    case ${type.getTypeId()}:\n      return FIXED_MESSAGE_${type.getTypeId()}_LEN;\n`;
        });
        return block;
    }

    generateCode(outputDir) {
        outputDir = outputDir || process.cwd();
        let file = fs.readFileSync(H_FILE_PATH, {encoding: "utf8"});
        let maxSize = Math.max(...this.messageTypes.map(m => m.getMaximalPacketSize()));
        file = file.replace("${{MAX_MESSAGE_SIZE}}", maxSize);
        file = file.replace("${{MESSAGE_SIZE_DEFINITIONS}}", this._generateFixSizeDefinitions());
        fs.writeFileSync(path.join(outputDir, "Messenger.h"), file);
        
        file = fs.readFileSync(CPP_FILE_PATH, {encoding: "utf8"});
        file = file.replace("${{FIX_MESSAGE_SIZE_BLOCK}}", this._generateFixMessageSizeBlock());
        fs.writeFileSync(path.join(outputDir, "Messenger.cpp"), file);
    }
}

module.exports = ArduinoGenerator;