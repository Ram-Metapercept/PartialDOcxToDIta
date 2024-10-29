const mongoose = require("mongoose");


const ditaTagSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value:{ type: String}

  },
  { timestamps: true }
);

module.exports = mongoose.model("ditaTag", ditaTagSchema);


