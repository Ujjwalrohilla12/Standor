import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized - no token" });

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute:", error.message);
    res.status(401).json({ message: "Unauthorized - invalid token" });
  }
};
