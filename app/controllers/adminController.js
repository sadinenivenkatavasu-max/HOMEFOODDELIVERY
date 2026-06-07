import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const listUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select("-password");
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body ?? {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });
    const user = await User.create({ name, email, password, role: role || "customer" });
    const safeUser = user.toObject();
    delete safeUser.password;
    res.status(201).json({ user: safeUser });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "No user id" });
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (req.user && req.user._id.toString() === id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    if (target.role === "admin") {
      return res.status(403).json({ message: "Cannot delete an admin account" });
    }
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
export const impersonateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = await User.findById(id).select("-password");
    if (!target) return res.status(404).json({ message: "User not found" });
    if (req.user && req.user._id.toString() === id) {
      return res.status(400).json({ message: "Cannot impersonate your own account" });
    }
    if (target.role === "admin") {
      return res.status(403).json({ message: "Cannot impersonate an admin account" });
    }

    const token = jwt.sign({ id: target._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: target });
  } catch (err) {
    next(err);
  }
};
