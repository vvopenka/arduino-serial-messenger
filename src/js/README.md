# Arduino Serial Messenger

NodeJS library for communication with Arduino using Serial Port.

## Installation

```bash
npm install arduino-serial-messenger
```

## Generating Arduino Sources

```javascript
const messengerLib = require("arduino-serial-messenger");
const ArduinoGenerator = messengerLib.ArduinoGenerator;
const FixedSizeType = messengerLib.MessageType.FixedSizeMessageType;
const VariableSizeType = messengerLib.MessageType.VariableSizeMessageType;

let generator = new ArduinoGenerator([
    new FixedSizeType(0, 0),
    new FixedSizeType(1, 2),
    new VariableSizeType(2, 10)
]);

generator.generateCode(__dirname);
```

When you execute the above code it will generate two files:

- Messenger.h
- Messenger.cpp

Both files can be directly included in your arduino project folder and loaded to the arduino script using:

```cpp
#include "Messenger.h"
```

See a [sample](../arduino/main.ino) of a simple Arduino program using Messenger.

## Using Messenger in your javascript

```javascript
const messengerLib = require("arduino-serial-messenger");
const SerialMessenger = messengerLib.SerialMessenger;
const FixedSizeType = messengerLib.MessageType.FixedSizeMessageType;
const VariableSizeType = messengerLib.MessageType.VariableSizeMessageType;
const Message = messengerLib.Message;

const MESSAGE0 = new FixedSizeType(0, 0);
const MESSAGE1 = new FixedSizeType(1, 2);
const MESSAGE2 = new VariableSizeType(2, 10);

let messenger = new SerialMessenger({
    path: "/dev/ttyUSB0",
    messagetypes: [
        MESSAGE0,
        MESSAGE1,
        MESSAGE2
    ]
});

messenger.on("unknowntype", function (data) {
    console.log("Unknown message type received: " + data);
});

messenger.on("message", function (message) {
    if (message.getMessageType().isFixedSize()) {
        console.log(`Received fixed size message type: ${message.getMessageType().getTypeId()} with data: ${message.getData()}`);
    } else {
        console.log("Received variable size message with data: " + message.getData());
    }
});

function sendMessage() {
    messenger.sendMessage(new Message(MESSAGE0));
}

setTimeout(sendMessage, 2000);
```

The path in SerialMessenger configuration is a path to serial port device. For more details see the documentation for [serialport](https://github.com/node-serialport/node-serialport). In case you need a different parameters for serial port you can initialize it yourself and pass it as a second parameter.

Remember that Arduion gets restarted when a serial port connects to it and it takes a while to load. You need to either wait a safe amount of time to start communicating with it or keep sending ack messages until you get one back.