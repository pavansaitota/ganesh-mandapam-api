import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const registerUser = async (req, res) => {
  const { full_name, mobile_no, email, password } = req.body;
  try {
    const hash = bcrypt.hashSync(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (full_name, mobile_no, email, password_hash) VALUES (?, ?, ?, ?)",
      [full_name, mobile_no, email || null, hash]
    );
    res.json({ message: "User registered", user_id: result.insertId });
  } catch (e) {
    res.status(500).json({ message: "Register failed", error: e.message });
  }
};

export const loginUser = async (req, res) => {
  const { mobile_no, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE mobile_no = ?", [mobile_no]);
    if (!rows.length) return res.status(401).json({ message: "Invalid credentials" });
    const user = rows[0];
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login successful", token, user });
  } catch (e) {
    res.status(500).json({ message: "Login failed", error: e.message });
  }
};
