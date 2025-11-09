import pool from "../config/db.js";

/* get my profile */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      "SELECT user_id, full_name, mobile_no, email, address, mandapam_id, status FROM users WHERE user_id = ?",
      [userId]
    );

    if (!rows.length)
      return res.status(404).json({ message: "User not found" });

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Profile fetch failed", error: error.message });
  }
};

/* update my profile */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { full_name, email, address } = req.body;

    await pool.query(
      "UPDATE users SET full_name = ?, email = ?, address = ? WHERE user_id = ?",
      [full_name, email, address, userId]
    );

    res.json({ message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
};

/* admin get user profile by id */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT user_id, full_name, mobile_no, email, address, mandapam_id, status FROM users WHERE user_id = ?",
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "User not found" });

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Fetch user failed", error: error.message });
  }
};
