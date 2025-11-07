import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

/* ===========================================================
   1️⃣ Register as User or Mandapam
   =========================================================== */
export const registerUser = async (req, res) => {
  const {
    full_name,
    mobile_no,
    email,
    password,
    role = "user",
    mandapam_id = null,
    register_as = "user", // 'user' or 'mandapam'
    mandapam_name,
    address,
    latitude,
    longitude,
  } = req.body;

  console.log("📥 Register request:", req.body);

  try {
    // 🧩 Hash password
    const hash = bcrypt.hashSync(password, 10);

    // 🏛 If registering as Mandapam, create mandapam entry first
    let mandapamIdToLink = mandapam_id;

    if (register_as === "mandapam") {
      if (!mandapam_name || !latitude || !longitude) {
        return res.status(400).json({
          message: "Mandapam name and geolocation (lat/lng) required",
        });
      }

      const [mandapamResult] = await pool.query(
        `INSERT INTO mandapam
         (mandapam_name, address, latitude, longitude, contact_name, mobile_no, email)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          mandapam_name,
          address || null,
          latitude,
          longitude,
          full_name,
          mobile_no,
          email || null,
        ]
      );
      mandapamIdToLink = mandapamResult.insertId;
      console.log("✅ New mandapam created:", mandapamIdToLink);
    }

    // 👤 Register user (link to mandapam if available)
    const [userResult] = await pool.query(
      `INSERT INTO users (full_name, mobile_no, email, password_hash, mandapam_id, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, mobile_no, email || null, hash, mandapamIdToLink, role]
    );

    console.log("✅ User registered:", userResult.insertId);

    res.status(201).json({
      message: "Registration successful",
      user_id: userResult.insertId,
      mandapam_id: mandapamIdToLink,
      register_as,
    });
  } catch (e) {
    console.error("❌ Register failed:", e);
    res.status(500).json({ message: "Register failed", error: e.message });
  }
};

/* ===========================================================
   2️⃣ Login
   =========================================================== */
export const loginUser = async (req, res) => {
  const { mobile_no, password } = req.body;
  console.log("📥 Login request:", { mobile_no });

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE mobile_no = ?", [mobile_no]);
    if (!rows.length) {
      console.warn("⚠️ User not found for mobile:", mobile_no);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      console.warn("⚠️ Password mismatch for:", mobile_no);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ Login success for:", user.user_id);

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        mobile_no: user.mobile_no,
        email: user.email,
        mandapam_id: user.mandapam_id,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("❌ Login failed:", e);
    res.status(500).json({ message: "Login failed", error: e.message });
  }
};

/* ===========================================================
   3️⃣ Get Nearby Mandapams
   =========================================================== */
export const getNearbyMandapams = async (req, res) => {
  const { lat, lng, radius_km = 25 } = req.query;
  console.log("📍 Fetching mandapams near:", lat, lng);

  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude and longitude required" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT mandapam_id, mandapam_name, address, latitude, longitude,
        (6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(latitude)) *
          COS(RADIANS(longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(latitude))
        )) AS distance_km
      FROM mandapam
      HAVING distance_km <= ?
      ORDER BY distance_km ASC
      LIMIT 100
      `,
      [lat, lng, lat, radius_km]
    );

    console.log(`✅ Found ${rows.length} mandapams nearby`);
    res.json(rows);
  } catch (e) {
    console.error("❌ Nearby mandapam fetch failed:", e);
    res.status(500).json({ message: "Error fetching nearby mandapams" });
  }
};
