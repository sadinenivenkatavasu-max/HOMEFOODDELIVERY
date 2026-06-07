import User from "../models/User.js";
import Food from "../models/Food.js";

export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price description image category",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ wishlist: user.wishlist ?? [] });
  } catch (err) {
    next(err);
  }
};

export const updateWishlist = async (req, res, next) => {
  try {
    const { foodId, action } = req.body ?? {};
    if (!foodId || !["add", "remove"].includes(action)) {
      return res.status(400).json({ message: "Invalid wishlist request" });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.wishlist = user.wishlist || [];
    const exists = user.wishlist.some((item) => item.toString() === foodId);

    if (action === "add" && !exists) {
      user.wishlist.push(foodId);
    }

    if (action === "remove") {
      user.wishlist = user.wishlist.filter((item) => item.toString() !== foodId);
    }

    await user.save();
    await user.populate({
      path: "wishlist",
      select: "name price description image category",
    });

    res.json({ wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ user: updatedUser, message: "Profile updated successfully" });
  } catch (err) {
    if (err.code === 11000 && err.keyValue?.email) {
      return res.status(400).json({ message: "Email already in use" });
    }
    next(err);
  }
};
