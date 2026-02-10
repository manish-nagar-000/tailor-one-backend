import { UserSubscription } from "../model/userSubscriptionModel.js";
import mongoose from "mongoose";

// 🆕 Create New Subscription (User)
export const createUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, subscriptionName, durationDays, clothLimit, price } = req.body;

    if (!name || !phone || !address || !subscriptionName || !durationDays || !price) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(durationDays));

    const newSub = new UserSubscription({
      userId,
      name,
      phone,
      address,
      subscriptionName,
      durationDays,
      clothLimit,
      price,
      startDate,
      endDate,
      status: "Active",
    });

    await newSub.save();

    res.status(200).json({
      success: true,
      message: "Subscription created successfully",
      subscription: newSub,
    });
  } catch (error) {
    console.error("Create Subscription Error:", error);
    res.status(500).json({ success: false, message: "Error creating subscription", error });
  }
};

// 📋 Admin - Get All Subscriptions
export const getAllUserSubscriptions = async (req, res) => {
  try {
    const subs = await UserSubscription.find().sort({ createdAt: -1 });

    // Auto mark expired
    const now = new Date();
    const updatedSubs = await Promise.all(
      subs.map(async (sub) => {
        if (sub.endDate < now && sub.status !== "Expired") {
          sub.status = "Expired";
          await sub.save();
        }
        return {
          ...sub.toObject(),
          daysLeft: Math.max(Math.ceil((sub.endDate - now) / (1000 * 60 * 60 * 24)), 0),
        };
      })
    );

    res.status(200).json({
      success: true,
      count: updatedSubs.length,
      subscriptions: updatedSubs,
    });
  } catch (error) {
    console.error("Get All Subscriptions Error:", error);
    res.status(500).json({ success: false, message: "Error fetching subscriptions", error });
  }
};

// 🔍 Admin - Get Single Subscription
export const getSingleUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await UserSubscription.findById(id);
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });
    res.status(200).json({ success: true, subscription: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching subscription", error });
  }
};

// 🧾 Admin - Update Subscription Status
export const updateUserSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sub = await UserSubscription.findByIdAndUpdate(id, { status }, { new: true });
    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      subscription: sub,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating subscription", error });
  }
};

// 📊 Admin - Subscription Stats
export const getSubscriptionStats = async (req, res) => {
  try {
    const total = await UserSubscription.countDocuments();
    const active = await UserSubscription.countDocuments({ status: "Active" });
    const expired = await UserSubscription.countDocuments({ status: "Expired" });

    res.status(200).json({
      success: true,
      stats: { total, active, expired },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stats", error });
  }
};
