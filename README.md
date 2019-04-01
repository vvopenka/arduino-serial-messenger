# A Serial Port Messenger for Arduino

A library which helps you to send messages from your os (either your PC or Raspberry Pi) to Arduino and back.

Because Arduino has a pretty limited amount of memory, you cannot communicate using a complicated protocol (sending xml or JSON). This library is designe to help you communicate using a simple binary protocol. It will wait for the entire message to be received and provides you the result.

## Protocol

This library uses a simple custom protocol. There are two types of messages:

 - Fixed size messages
 - Variable size messages

Each messages starts with a type byte. The least significant bit of type byte represents the type of message (0 is fixed size message, 1 is variable size message). The rest of
the bites are type number. The biggest type number permitted is 125. Type 126 of each type of message is reserved for further enhancements.

### Fixed Size Messages

This is the simples message type. It transmits only the type byte followed by fixed number of data bytes. The message can have 0 number of data bytes.

The maximal length of data is 254.

### Variable size Message

Suitable for transmitting strings of variable sizes. The message transmits the type byte followed by one byte representing the number of bytes of data that will follow.

The maximal length of data is 253.

## Usage

Currently the library is implemented only for arduino and nodejs. In case you would need a python version feel free to send me a pull request.

### Arduino

Arduino sources may be found [here](src/arduino). But they have few sections missing, as they must be generated based on the used messages. The easiest way
to get arduino sources is to have them generated by nodejs [library](src/js/README.md).

For a sample usage from Arduino, see [example](src/arduino/main.ino).

### NodeJS

See the library [README](src/js/README.md) for more details.