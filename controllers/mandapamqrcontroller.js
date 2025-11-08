import pool from "../config/db.js";
import fs from "fs";

/* ===========================================================
   🟩 1️⃣ GET Mandapam QR (Fetch base64 QR)
   =========================================================== */
export const getMandapamQR = async (req, res) => {
  const { mandapam_id } = req.params;

  if (!mandapam_id) {
    return res.status(400).json({ message: "mandapam_id is required" });
  }

  try {
    const [rows] = await pool.query(
      `SELECT mandapam_id, qr FROM mandapam WHERE mandapam_id = ?`,
      [mandapam_id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Mandapam not found" });
    }

    res.json({
      mandapam_id,
      qr: rows[0].qr || null,
    });
  } catch (e) {
    console.error("❌ getMandapamQR error:", e);
    res.status(500).json({ message: "Failed to fetch QR", error: e.message });
  }
};

/* ===========================================================
   🟦 2️⃣ POST Mandapam QR (Create new QR)
   =========================================================== */
export const createMandapamQR = async (req, res) => {
  const { mandapam_id, qr } = req.body;

  if (!mandapam_id || !qr) {
    return res.status(400).json({ message: "mandapam_id and qr are required" });
  }

  try {
    // Check if Mandapam exists
    const [exists] = await pool.query(
      `SELECT mandapam_id FROM mandapam WHERE mandapam_id = ?`,
      [mandapam_id]
    );
    if (!exists.length) {
      return res.status(404).json({ message: "Mandapam not found" });
    }

    // Convert QR image to Base64 if it's a file path or binary buffer
    let qrBase64 = qr;
    if (!qr.startsWith("data:image")) {
      if (fs.existsSync(qr)) {
        const imageBuffer = fs.readFileSync(qr);
        qrBase64 = `data:image/png;base64,${imageBuffer.toString("base64")}`;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid QR path or format, must be Base64 or valid file" });
      }
    }

    // Save Base64 QR in DB
    await pool.query(`UPDATE mandapam SET qr = ? WHERE mandapam_id = ?`, [
      qrBase64,
      mandapam_id,
    ]);

    console.log(`✅ QR created for mandapam_id: ${mandapam_id}`);
    res.status(201).json({
      message: "Mandapam QR created successfully",
      mandapam_id,
    });
  } catch (e) {
    console.error("❌ createMandapamQR error:", e);
    res.status(500).json({ message: "Failed to create QR", error: e.message });
  }
};

/* ===========================================================
   🟨 3️⃣ PUT Mandapam QR (Update existing QR)
   =========================================================== */
export const updateMandapamQR = async (req, res) => {
  const { mandapam_id, qr } = req.body;

  if (!mandapam_id || !qr) {
    return res.status(400).json({ message: "mandapam_id and qr are required" });
  }

  try {
    // Convert to Base64 if not already in Base64 format
    let qrBase64 = qr;
    if (!qr.startsWith("data:image")) {
      if (fs.existsSync(qr)) {
        const imageBuffer = fs.readFileSync(qr);
        qrBase64 = `data:image/png;base64,${imageBuffer.toString("base64")}`;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid QR path or format, must be Base64 or valid file" });
      }
    }

    // Update QR in DB
    const [result] = await pool.query(
      `UPDATE mandapam SET qr = ? WHERE mandapam_id = ?`,
      [qrBase64, mandapam_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Mandapam not found" });
    }

    console.log(`✅ QR updated for mandapam_id: ${mandapam_id}`);
    res.json({
      message: "Mandapam QR updated successfully",
      mandapam_id,
    });
  } catch (e) {
    console.error("❌ updateMandapamQR error:", e);
    res.status(500).json({ message: "Failed to update QR", error: e.message });
  }
};
