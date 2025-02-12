const XLSX = require("xlsx");
const mongoose = require("mongoose");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const connectDB = require("./db");
const Message = require("./models/Message");
const Account = require("./models/Account");

const clients = [];

async function getChatTitle(client, chatId) {
  if (!chatId) {
    return "Uknown Group";
  }
  try {
    let chat = await client.getEntity(chatId);
    return chat.title || "Unknown Group";
  } catch (error) {
    console.error("Error fetching group name:", error);
    return "Unknown Group";
  }
}

async function getUserName(client, userId) {
  if (!userId) {
    return "Unknown User";
  }
  try {
    let user = await client.getEntity(userId);
    return (
      user.firstName + (user.lastName ? " " + user.lastName : "") ||
      user.username ||
      "Unknown User"
    );
  } catch (error) {
    console.error("Error fetching user name:", error);
    return "Unknown User";
  }
}

async function saveMessageData(chatTitle, senderName, messageText, timestamp) {
  try {
    const dateUTC = new Date(timestamp * 1000); // convert UNIX timestamp

    const newMessage = new Message({
      chatTitle,
      senderName,
      messageText,
      timestamp,
      dateUTC,
    });

    await newMessage.save();
    console.log("Message saved to MongoDB:", newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
  }
}

async function handleUpdate(client, update) {
  if (update.className === "UpdateNewChannelMessage") {
    // handling messages in a channel
    const chatTitle = await getChatTitle(
      client,
      update.message.peerId.channelId.value,
    );
    const senderName = await getUserName(
      client,
      update.message.fromId?.userId?.value,
    );
    const messageText = update.message.message;
    const timestamp = update.message.date;
    saveMessageData(chatTitle, senderName, messageText, timestamp);
    console.log(
      `Message in Channel: ${chatTitle} | ${senderName} | ${messageText} | ${timestamp}`,
    );
  } else if (update.className === "UpdateShortChatMessage") {
    // handling short messages in group chats
    const chatTitle = await getChatTitle(client, update.chatId.value);
    const senderName = await getUserName(client, update.fromId.value);
    const messageText = update.message;
    const timestamp = update.date;
    saveMessageData(chatTitle, senderName, messageText, timestamp);
    console.log(
      `Short Message in Group: ${chatTitle} | ${senderName} | ${messageText} | ${timestamp}`,
    );
  }
}

async function storeAccount(account) {
  try {
    const updatedAccount = await Account.findOneAndUpdate(
      { phoneNumber: account.phoneNumber }, // find account by phone number
      account, // update fields
      { upsert: true, new: true }, // create if not exists
    );

    console.log("Account stored:", updatedAccount);
  } catch (error) {
    console.error("Error storing account:", error);
  }
}

async function startAccount(account) {
  if (clients[account.phoneNumber]) {
    console.log(`Client for ${account.phoneNumber} already running.`);
    return;
  }

  const sessionString = account.session || "";
  const client = new TelegramClient(
    new StringSession(sessionString),
    account.apiId,
    account.apiHash,
    { connectionRetries: 5 },
  );

  console.log(`Connecting ${account.phoneNumber}...`);
  console.log("account: ", account);

  await client.connect();
  await client.sendCode(
    { apiId: account.apiId, apiHash: account.apiHash },
    account.phoneNumber,
  );

  console.log(`Logged in as ${account.phoneNumber}`);
  account.session = client.session.save();

  clients[account.phoneNumber] = client;

  // Store the account in MongoDB
  await storeAccount(account);

  client.addEventHandler((update) => {
    handleUpdate(client, update);
  });
}

async function startAllAccounts() {
  const accounts = await Account.find(); // fetch all accounts from MongoDB

  for (const account of accounts) {
    const client = new TelegramClient(
      new StringSession(account.session),
      account.apiId,
      account.apiHash,
      { connectionRetries: 5 },
    );

    clients[account.phoneNumber] = client; // store the client in memory

    console.log(`Connecting ${account.phoneNumber}...`);
    await client.connect();
    console.log(`Reconnected using session for ${account.phoneNumber}`);
  }
}

async function exportToExcel() {
  try {
    // fetch all messages
    const messages = await Message.find();

    if (messages.length === 0) {
      console.log("No data found!");
      return;
    }

    // convert messages to an array for Excel
    const data = [
      ["Chat Title", "Sender Name", "Message Text", "Timestamp"],
      ...messages.map((msg) => [
        msg.chatTitle,
        msg.senderName,
        msg.messageText,
        new Date(msg.timestamp).toLocaleString(),
      ]),
    ];

    // create a worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Messages");

    const filePath = "telegram-messages.xlsx";
    XLSX.writeFile(workbook, filePath);

    console.log(`Data exported successfully to ${filePath}`);
  } catch (error) {
    console.error("Error exporting data:", error);
  }
}

async function startLogger() {
  await connectDB();
  await startAllAccounts();
}

async function startLogin(req, res) {
  try {
    console.log("Logging in");
    const { phoneNumber, apiId, apiHash } = req.body;
    if (!phoneNumber || !apiId || !apiHash) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const account = { phoneNumber, apiId: parseInt(apiId, 10), apiHash };

    await startAccount(account);

    res.json({ success: true, message: "Code sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function verifyLogin(req, res) {
  const { phoneNumber, phoneCode } = req.body;
  const client = clients[phoneNumber];

  if (!client) return res.status(400).json({ error: "No pending login" });

  try {
    await client.start({
      phoneNumber: async () => phoneNumber,
      phoneCode: async () => phoneCode,
      password: async () => "",
      onError: (err) => console.error(`Error for ${phoneNumber}:`, err),
    });

    res.json({ success: true, message: "Logged in!" });
  } catch (error) {
    res.status(500).json({ error: "Invalid code or login failed" });
  }
}

module.exports = { startLogger, startLogin, verifyLogin };
