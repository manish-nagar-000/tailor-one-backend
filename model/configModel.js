import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
  emailjsServiceId: String,
  emailjsTemplateId: String,
  emailjsPublicKey: String,
});

const Config = mongoose.model("Config", configSchema);
export default Config;
