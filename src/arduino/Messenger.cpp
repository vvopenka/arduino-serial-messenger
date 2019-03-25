#include "Messenger.h"

MessengerClass::MessengerClass(void) {
  this->messageCallback = NULL;
}

void MessengerClass::begin() {
  Serial.begin(BAUD_RATE);
  this->bufferPos = 0;
  while (!Serial) {}
}

void MessengerClass::end() {
  Serial.end();
}

uint8_t MessengerClass::getFixedMessageLen(uint8_t type) {
  switch(type) {
${{FIX_MESSAGE_SIZE_BLOCK}}
  }
}

void MessengerClass::sendFixedSizeMessage(uint8_t type, const uint8_t * data) {
  uint8_t typeByte = (type << 1);
  Serial.write(typeByte);
  uint8_t len = this->getFixedMessageLen(type);
  if (len) {
    Serial.write(data, len);
  }
}

void MessengerClass::sendVariableSizeMessage(uint8_t type, uint8_t len, const uint8_t * data) {
  uint8_t typeByte = (type << 1) | 1;
  Serial.write(typeByte);
  Serial.write(len);
  if (len) {
    Serial.write(data, len);
  }
}

void MessengerClass::registerMessageReceiveCallback(void (*messageCallback)(uint8_t type, char isFixedSize, uint8_t len, const uint8_t * data)) {
  this->messageCallback = messageCallback;
}

void MessengerClass::readMessageByte(uint8_t data) {
  this->buffer[this->bufferPos] = data;
  this->bufferPos++;
  
  char isFixed = !(this->buffer[0] & 0x1);
  if (!isFixed && this->bufferPos < 2) {
    return;
  }
  uint8_t type = this->buffer[0] >> 1;
  uint8_t messageLen = isFixed ? this->getFixedMessageLen(type) : this->buffer[1];
  uint8_t dataLen = this->bufferPos - (isFixed ? 1 : 2);
  if (dataLen == messageLen) {
    if (this->messageCallback) {
      this->messageCallback(type, isFixed, messageLen, (this->buffer + (isFixed ? 1 : 2)));
    }
    this->bufferPos = 0;
  }
}

void MessengerClass::processIncommingData() {
  while (Serial.available() > 0) {
    int data = Serial.read();
    if (data >= 0) {
      this->readMessageByte(data);
    }
  }
}

MessengerClass Messenger;
