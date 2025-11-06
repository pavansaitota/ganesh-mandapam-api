import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const verifyToken = async (req, res, next) => {
  const raw = req.headers["authorization"] || "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { user_id: decoded.user_id };

    // attach active roles
    const [rows] = await pool.query(
      `SELECT r.role_name 
       FROM user_roles ur
       JOIN roles r ON r.role_id = ur.role_id
       WHERE ur.user_id = ? AND ur.status='active'`,
      [decoded.user_id]
    );
    req.user.roles = rows.map(r => r.role_name);
    next();
  } catch (e) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
