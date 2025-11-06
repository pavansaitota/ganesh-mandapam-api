import pool from "../config/db.js";

export const addDonation = async (req, res) => {
  const { mandapam_id, event_id=null, donor_user_id=null, donor_name=null, amount, payment_mode, transaction_ref=null, received_by=null } = req.body;
  try {
    const [r] = await pool.query(
      `INSERT INTO donations
       (mandapam_id, event_id, donor_user_id, donor_name, amount, payment_mode, transaction_ref, received_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [mandapam_id, event_id, donor_user_id, donor_name, amount, payment_mode, transaction_ref, received_by || req.user.user_id]
    );
    res.json({ message: "Donation added", donation_id: r.insertId });
  } catch (e) {
    res.status(500).json({ message: "Add donation failed", error: e.message });
  }
};

export const listDonations = async (req, res) => {
  const { mandapam_id, status } = req.query;
  try {
    const params = [];
    let sql = `SELECT * FROM donations WHERE 1=1`;
    if (mandapam_id) { sql += ` AND mandapam_id = ?`; params.push(mandapam_id); }
    if (status) { sql += ` AND status = ?`; params.push(status); }
    sql += ` ORDER BY donation_date DESC, donation_id DESC`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "List donations failed", error: e.message });
  }
};

export const updateDonationStatus = async (req, res) => {
  const { status } = req.body; // 'approved' | 'rejected'
  const id = req.params.id;
  try {
    await pool.query(
      `UPDATE donations SET status = ?, approved_by = ? WHERE donation_id = ?`,
      [status, req.user.user_id, id]
    );
    res.json({ message: `Donation ${status}` });
  } catch (e) {
    res.status(500).json({ message: "Update status failed", error: e.message });
  }
};
