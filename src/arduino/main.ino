#include "Messenger.h"

void setup() {
  Messenger.begin();
  Messenger.registerMessageReceiveCallback(messageRecieved);
}

void messageRecieved(uint8_t type, char isFixedSize, uint8_t len, const uint8_t * data) {
  if (type == 0) {
    const char * message = "HELLO";
    Messenger.sendVariableSizeMessage(3, 6, (const uint8_t*)message);
  } else {
    if (isFixedSize && (type < 3)) {
      Messenger.sendFixedSizeMessage(type, data);
    } else {
      Messenger.sendVariableSizeMessage(type, len, data);
    }
  }
}

void loop() {
  Messenger.processIncommingData();
}
