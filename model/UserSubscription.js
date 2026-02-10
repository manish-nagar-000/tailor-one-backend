import mongoose from "mongoose";

const userSubscriptionSchema = new mongoose.Schema(
  {
    // 🔹 User Info
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },

    // 🔹 Address (from user or input)
    address: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    // 🔹 Subscription Plan Info
    subscriptionName: { type: String, required: true },
    durationDays: { type: Number, required: true }, // e.g. 30
    clothLimit: { type: Number, default: 0 },
    price: { type: Number, required: true },

    // 🔹 Status Info
    status: {
      type: String,
      enum: ["Active", "Expired", "Cancelled"],
      default: "Active",
    },

    // 🔹 Date Info
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // 🔹 Daily Reminder
    reminderSentToday: { type: Boolean, default: false },

    // 🔹 Notes or extra info
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// 🔹 Virtual field - Days Left
userSubscriptionSchema.virtual("daysLeft").get(function () {
  const today = new Date();
  const diff = new Date(this.endDate) - today;
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
});

export const UserSubscription = mongoose.model(
  "UserSubscription",
  userSubscriptionSchema
);
