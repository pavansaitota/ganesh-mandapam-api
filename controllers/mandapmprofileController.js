import pool from "../config/db.js";

/* ===========================================================
   1️⃣ GET Mandapam Profile (Exclude QR)
   =========================================================== */
export const getMandapamProfile = async (req, res) => {
  const { mandapam_id } = req.params;

  if (!mandapam_id) {
    return res.status(400).json({ message: "mandapam_id is required" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT mandapam_id, mandapam_name, address, city, district, state,
              contact_number, created_by, created_at, latitude, longitude
       FROM mandapam
       WHERE mandapam_id = ?`,
      [mandapam_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Mandapam not found" });
    }

    console.log(`✅ Mandapam profile fetched for ID: ${mandapam_id}`);
    res.json(rows[0]);
  } catch (e) {
    console.error("❌ getMandapamProfile error:", e);
    res.status(500).json({ message: "Failed to fetch Mandapam", error: e.message });
  }
};

/* ===========================================================
   2️⃣ PUT / Update Mandapam Profile (Reset/Edit)
   =========================================================== */
export const updateMandapamProfile = async (req, res) => {
  const { mandapam_id } = req.params;
  const {
    mandapam_name,
    address,
    city,
    district,
    state,
    contact_number,
    latitude,
    longitude,
  } = req.body;

  if (!mandapam_id) {
    return res.status(400).json({ message: "mandapam_id is required" });
  }

  try {
    // Prepare update query dynamically (only update provided fields)
    const updates = [];
    const params = [];

    if (mandapam_name) {
      updates.push("mandapam_name = ?");
      params.push(mandapam_name);
    }
    if (address) {
      updates.push("address = ?");
      params.push(address);
    }
    if (city) {
      updates.push("city = ?");
      params.push(city);
    }
    if (district) {
      updates.push("district = ?");
      params.push(district);
    }
    if (state) {
      updates.push("state = ?");
      params.push(state);
    }
    if (contact_number) {
      updates.push("contact_number = ?");
      params.push(contact_number);
    }
    if (latitude) {
      updates.push("latitude = ?");
      params.push(latitude);
    }
    if (longitude) {
      updates.push("longitude = ?");
      params.push(longitude);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const sql = `UPDATE mandapam SET ${updates.join(", ")} WHERE mandapam_id = ?`;
    params.push(mandapam_id);

    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Mandapam not found" });
    }

    // Fetch updated record
    const [rows] = await pool.query(
      `SELECT mandapam_id, mandapam_name, address, city, district, state,
              contact_number, created_by, created_at, latitude, longitude
       FROM mandapam
       WHERE mandapam_id = ?`,
      [mandapam_id]
    );

    console.log(`✅ Mandapam profile updated: ${mandapam_id}`);
    res.json({
      message: "Mandapam profile updated successfully",
      profile: rows[0],
    });
  } catch (e) {
    console.error("❌ updateMandapamProfile error:", e);
    res.status(500).json({ message: "Failed to update Mandapam", error: e.message });
  }
};
