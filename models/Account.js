const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  apiId: { type: Number, required: true },
  apiHash: { type: String, required: true },
  password: { type: String, default: "" },
  session: { type: String, default: "" },
});

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
