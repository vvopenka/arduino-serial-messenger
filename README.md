# A Serial Port Messenger for Arduino

A library which helps you to send messages from your os (either your PC or Raspberry Pi) to Arduino and back.

Because Arduino has a pretty limited amount of memory, you cannot communicate using a complicated protocol (sending xml or JSON). This library is designe to help you communicate using a simple binary protocol. It will wait for the entire message to be received and provides you the result.

## Protocol

This library uses a simple custom protocol. There are two types of messages:

 - Fixed size messages
 - Variable size messages

### Fixed Size Messages

