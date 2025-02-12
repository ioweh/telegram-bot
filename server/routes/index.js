var express = require("express");
var router = express.Router();
const connectDB = require("../../db");
const Message = require("../../models/Message");
const { startLogin, verifyLogin } = require("../../logger");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {});
});

// API endpoint to get grouped and paginated messages
router.get("/messages", async (req, res) => {
  await connectDB();
  try {
    const { groupBy = "chatTitle", page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const groupedMessages = await Message.aggregate([
      { $group: { _id: `$${groupBy}`, messages: { $push: "$$ROOT" } } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
    ]);

    res.json(groupedMessages);
  } catch (error) {
    const { message, stack } = error;
    res.status(500).json({ error: "Internal Server Error", message, stack });
  }
});

router.post("/start-login", startLogin);
router.post("/verify-login", verifyLogin);

module.exports = router;
