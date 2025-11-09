// controllers/mandapamController.js
import db from "../config/db.js";

/* ===========================================================
   1️⃣ Register a New Mandapam
   =========================================================== */
export const registerMandapam = async (req, res) => {
  try {
    const {
      mandapam_name,
      address = null,
      latitude = null,
      longitude = null,
      mobile_no = null,
      email = null,
    } = req.body;

    // ✅ Validate required fields
    if (!mandapam_name) {
      return res.status(400).json({ message: "Mandapam name is required" });
    }

    // ✅ Insert new mandapam record
    const [result] = await db.query(
      `INSERT INTO mandapam
       (mandapam_name, address, latitude, longitude, contact_number, email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [mandapam_name, address, latitude, longitude, mobile_no, email]
    );

    console.log("✅ Mandapam created with ID:", result.insertId);

    return res.status(201).json({
      message: "Mandapam registered successfully",
      mandapam_id: result.insertId,
    });
  } catch (err) {
    console.error("❌ registerMandapam error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ===========================================================
   2️⃣ Get Mandapam(s)
   - Fetch by ID or Nearby (within fixed 0.5 km)
   =========================================================== */
export const getNearbyMandapams = async (req, res) => {
  try {
    const { id, lat, lng } = req.query;
    const radius_km = 0.5; // ✅ Fixed search radius = 0.5 km (500 meters)

    // ✅ Case 1: Fetch specific mandapam by ID
    if (id) {
      const [rows] = await db.query(
        `SELECT 
            mandapam_id,
            mandapam_name,
            address,
            latitude,
            longitude,
            contact_number,
            email
         FROM mandapam
         WHERE mandapam_id = ?`,
        [id]
      );

      if (!rows.length) {
        return res.status(404).json({ message: "Mandapam not found" });
      }

      console.log("✅ Mandapam fetched by ID:", id);
      return res.json(rows[0]);
    }

    // ✅ Case 2: Fetch mandapams near user's location
    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude (lat) and Longitude (lng) query parameters are required",
      });
    }

    const query = `
      SELECT
        mandapam_id,
        mandapam_name,
        address,
        latitude,
        longitude,
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

    const [rows] = await db.query(query, [lat, lng, lat, radius_km]);

    console.log(`✅ Found ${rows.length} mandapam(s) within ${radius_km} km`);

    return res.json(rows);
  } catch (err) {
    console.error("❌ getNearbyMandapams error:", err);
    return res.status(500).json({
      message: "Server error while fetching mandapams",
      error: err.message,
    });
  }
};

/* ===========================================================
   3️⃣ (Optional) Get All Mandapams (no filters)
   =========================================================== */
export const getAllMandapams = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT mandapam_id, mandapam_name, address, latitude, longitude FROM mandapam ORDER BY mandapam_name ASC`
    );
    console.log(`✅ Retrieved ${rows.length} total mandapams`);
    return res.json(rows);
  } catch (err) {
    console.error("❌ getAllMandapams error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
