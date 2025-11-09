import pool from "../config/db.js";

/* ========= VIEW QR ========= */
export const getMandapamQR = async (req, res) => {
  try {
    const { mandapam_id } = req.params;
    const [rows] = await pool.query(
      "SELECT mandapam_id, qr FROM mandapam WHERE mandapam_id = ?",
      [mandapam_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Mandapam not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching QR", error: err.message });
  }
};

/* ========= UPDATE QR ========= */
export const updateMandapamQR = async (req, res) => {
  try {
    const { mandapam_id } = req.params;
    const { qr } = req.body;

    if (!qr) return res.status(400).json({ message: "qr required" });

    await pool.query("UPDATE mandapam SET qr = ? WHERE mandapam_id = ?", [
      qr,
      mandapam_id,
    ]);

    res.json({ message: "QR updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "QR update failed", error: err.message });
  }
};
