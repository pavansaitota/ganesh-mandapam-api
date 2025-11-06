import pool from "../config/db.js";

export const createEvent = async (req, res) => {
  const { mandapam_id, event_name, event_type = "Other", start_date = null, end_date = null, description = null } = req.body;
  try {
    const [r] = await pool.query(
      `INSERT INTO events (mandapam_id, event_name, event_type, start_date, end_date, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [mandapam_id, event_name, event_type, start_date, end_date, description, req.user.user_id]
    );
    res.json({ message: "Event created", event_id: r.insertId });
  } catch (e) {
    res.status(500).json({ message: "Create event failed", error: e.message });
  }
};

export const listEvents = async (req, res) => {
  const { mandapam_id } = req.query;
  try {
    const params = [];
    let sql = `SELECT * FROM events`;
    if (mandapam_id) { sql += ` WHERE mandapam_id = ?`; params.push(mandapam_id); }
    sql += ` ORDER BY start_date DESC, event_id DESC`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "List events failed", error: e.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM events WHERE event_id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Event not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: "Get event failed", error: e.message });
  }
};
