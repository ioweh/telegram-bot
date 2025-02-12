const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatTitle: { type: String, required: true },
  senderName: { type: String, required: true },
  messageText: { type: String, required: true },
  timestamp: { type: Number, required: true },
  dateUTC: { type: Date, required: true },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
