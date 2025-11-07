// controllers/mandapamController.js
import db from "../config/db.js"; // adjust import to your db helper

// Register a new mandapam (requires name + lat + lng ideally)
export const registerMandapam = async (req, res) => {
  try {
    const {
      mandapam_name,
      address = null,
      latitude = null,
      longitude = null,
      contact_name = null,
      mobile_no = null,
      email = null,
    } = req.body;

    if (!mandapam_name) {
      return res.status(400).json({ message: "mandapam_name is required" });
    }

    const [result] = await db.query(
      `INSERT INTO mandapam
       (mandapam_name, address, latitude, longitude, contact_name, mobile_no, email)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [mandapam_name, address, latitude, longitude, contact_name, mobile_no, email]
    );

    return res.status(201).json({
      message: "Mandapam created",
      mandapam_id: result.insertId,
    });
  } catch (err) {
    console.error("registerMandapam error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get nearby mandapams (Haversine formula). Query params: lat, lng, radius_km (optional)
export const getNearbyMandapams = async (req, res) => {
  try {
    const { lat, lng, radius_km = 25 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng query params required" });
    }

    const query = `
      SELECT
        mandapam_id, mandapam_name, address, latitude, longitude,
        (6371 * ACOS(
           COS(RADIANS(?)) * COS(RADIANS(latitude)) *
           COS(RADIANS(longitude) - RADIANS(?)) +
           SIN(RADIANS(?)) * SIN(RADIANS(latitude))
        )) AS distance_km
      FROM mandapam
      HAVING distance_km <= ?
      ORDER BY distance_km ASC
      LIMIT 100;
    `;

    const params = [lat, lng, lat, radius_km];
    const [rows] = await db.query(query, params);

    return res.json(rows);
  } catch (err) {
    console.error("getNearbyMandapams error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
