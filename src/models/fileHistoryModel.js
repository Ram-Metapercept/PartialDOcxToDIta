const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const fileHistorySchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    userId: {
      type: ObjectId,
      ref: "User",
      requiredPaths: true,
    },

    email: { type: String, required: true },
    os:{
      type: String, required: true
    },

    ip:{
      type: String
    },
    
    location: {
      country: String,
      city: String,
    },
    browser:{
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("fileHistory", fileHistorySchema);
