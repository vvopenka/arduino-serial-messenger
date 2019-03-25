#ifndef MESSENGER_H
#define MESSENGER_H

#ifndef BAUD_RATE
  #define BAUD_RATE 115200
#endif

#define MAX_MESSAGE_SIZE ${{MAX_MESSAGE_SIZE}}

${{MESSAGE_SIZE_DEFINITIONS}}

#include <Arduino.h>

class MessengerClass {
private:
  uint8_t buffer[MAX_MESSAGE_SIZE];
  uint8_t bufferPos;
  void (*messageCallback)(uint8_t type, char isFixedSize, uint8_t len, const uint8_t * data);
  uint8_t getFixedMessageLen(uint8_t type);
  void readMessageByte(uint8_t data);
public:
  MessengerClass(void);
  void begin();
  void end();
  void registerMessageReceiveCallback(void (*messageCallback)(uint8_t type, char isFixedSize, uint8_t len, const uint8_t * data));
  void sendFixedSizeMessage(uint8_t type, const uint8_t * data);
  void sendVariableSizeMessage(uint8_t type, uint8_t len, const uint8_t * data);
  void processIncommingData();
};

extern MessengerClass Messenger;

#endif
