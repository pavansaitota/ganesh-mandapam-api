// controllers/mandapamController.js
import db from "../config/db.js";

/* ===========================================================
   REGISTER MANDAPAM  (Assign creator as PRESIDENT)
   =========================================================== */
export const registerMandapam = async (req, res) => {
  try {
    const {
      mandapam_name,
      address = null,
      city = null,
      district = null,
      state = null,
      contact_number = null,
      latitude,
      longitude,
      created_by = null,
      qr = null
    } = req.body;

    console.log("📥 Mandapam Register Request:", req.body);

    // required checks
    if (!mandapam_name || !latitude || !longitude) {
      return res.status(400).json({
        message: "mandapam_name, latitude and longitude are required"
      });
    }

    // 1) Create mandapam
    const [result] = await db.query(
      `INSERT INTO mandapam 
      (mandapam_name, address, city, district, state, contact_number, latitude, longitude, created_by, qr)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mandapam_name,
        address,
        city,
        district,
        state,
        contact_number,
        latitude,
        longitude,
        created_by,
        qr
      ]
    );

    const newMandapamId = result.insertId;
    console.log("✅ Mandapam Created with ID:", newMandapamId);

    // 2) Assign PRESIDENT role to creator (role_id = 1)
    if (created_by) {
      await db.query(
        `INSERT INTO user_roles (user_id, mandapam_id, role_id, status)
         VALUES (?, ?, 1, 'active')`,
        [created_by, newMandapamId]
      );
      console.log("🎭 Role assigned → PRESIDENT (1) to user:", created_by);
    }

    return res.status(201).json({
      message: "Mandapam registered successfully",
      mandapam_id: newMandapamId
    });

  } catch (err) {
    console.log("❌ registerMandapam error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


/* ===========================================================
   GET Mandapam by ID
   =========================================================== */
export const getMandapam = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT mandapam_id, mandapam_name, address, city, district, state,
              contact_number, latitude, longitude, qr, created_by, created_at
       FROM mandapam WHERE mandapam_id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Mandapam not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.log("❌ getMandapam error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


/* ===========================================================
   GET All mandapams
   =========================================================== */
export const getAllMandapams = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT mandapam_id, mandapam_name, city, district, state, latitude, longitude 
       FROM mandapam ORDER BY mandapam_name ASC`
    );

    return res.json(rows);
  } catch (err) {
    console.log("❌ getAllMandapams error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
