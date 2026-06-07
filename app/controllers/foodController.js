import Food from "../models/Food.js";

export const getFoods = async (req, res) => {
  const foods = await Food.find();
  res.json(foods);
};

export const addFood = async (req, res) => {
  const food = await Food.create(req.body);
  res.json(food);
};
