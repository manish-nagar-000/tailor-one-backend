import Config from "../model/configModel.js";

// 🔹 Get current EmailJS config
export const getConfig = async (req, res) => {
  const config = await Config.findOne({});
  res.json(config);
};

// 🔹 Update EmailJS config
export const updateConfig = async (req, res) => {
  const { emailjsServiceId, emailjsTemplateId, emailjsPublicKey } = req.body;
  const updatedConfig = await Config.findOneAndUpdate(
    {},
    { emailjsServiceId, emailjsTemplateId, emailjsPublicKey },
    { upsert: true, new: true }
  );
  res.json({ success: true, config: updatedConfig });
};
