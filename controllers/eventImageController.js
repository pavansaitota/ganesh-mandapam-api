import pool from "../config/db.js";

// UPLOAD IMAGE
export const uploadEventImage = async (req, res) => {
  const { event_id, mime_type = "image/jpeg", base64 } = req.body;
  try {
    const buf = Buffer.from(base64, "base64");
    await pool.query(
      `INSERT INTO event_images (event_id, uploaded_by, image_data, mime_type)
       VALUES (?, ?, ?, ?)`,
      [event_id, req.user.user_id, buf, mime_type]
    );
    res.json({ message: "Image uploaded" });
  } catch (e) {
    res.status(500).json({ message: "Upload failed", error: e.message });
  }
};

// GET ALL IMAGES (ALL EVENTS) - WITH BASE64
export const getAllEventImages = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT image_id, event_id, uploaded_by, mime_type, upload_date, image_data
       FROM event_images ORDER BY upload_date DESC`
    );

    const result = rows.map(img => ({
      image_id: img.image_id,
      event_id: img.event_id,
      uploaded_by: img.uploaded_by,
      mime_type: img.mime_type,
      upload_date: img.upload_date,
      base64: img.image_data.toString("base64")
    }));

    res.json(result);

  } catch (e) {
    res.status(500).json({ message: "List ALL images failed", error: e.message });
  }
};

// GET IMAGES BY EVENT ID - WITH BASE64
export const listEventImages = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT image_id, event_id, uploaded_by, mime_type, upload_date, image_data
       FROM event_images WHERE event_id = ? ORDER BY upload_date DESC`,
      [req.params.event_id]
    );

    const result = rows.map(img => ({
      image_id: img.image_id,
      event_id: img.event_id,
      uploaded_by: img.uploaded_by,
      mime_type: img.mime_type,
      upload_date: img.upload_date,
      base64: img.image_data.toString("base64")
    }));

    res.json(result);

  } catch (e) {
    res.status(500).json({ message: "List images failed", error: e.message });
  }
};

// GET SINGLE IMAGE BLOB
export const getEventImageBlob = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT image_data, mime_type FROM event_images WHERE image_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).end();
    res.setHeader("Content-Type", rows[0].mime_type || "image/jpeg");
    res.send(rows[0].image_data);
  } catch {
    res.status(500).end();
  }
};
