import pool from "../config/db.js";

export const requestJoin = async (req, res) => {
  const { mandapam_id, requested_role_id, remarks=null } = req.body;
  try {
    const [r] = await pool.query(
      `INSERT INTO join_requests (user_id, mandapam_id, requested_role_id, status, requested_at, remarks)
       VALUES (?, ?, ?, 'pending', NOW(), ?)`,
      [req.user.user_id, mandapam_id, requested_role_id, remarks]
    );
    res.json({ message: "Join request sent", request_id: r.insertId });
  } catch (e) {
    res.status(500).json({ message: "Request failed", error: e.message });
  }
};

export const listJoinRequests = async (req, res) => {
  const mandapam_id = req.params.mandapam_id;
  try {
    const [rows] = await pool.query(
      `SELECT jr.*, u.full_name, r.role_name
       FROM join_requests jr
       JOIN users u ON u.user_id = jr.user_id
       JOIN roles r ON r.role_id = jr.requested_role_id
       WHERE jr.mandapam_id = ? AND jr.status='pending'
       ORDER BY jr.requested_at DESC`,
      [mandapam_id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "List failed", error: e.message });
  }
};

export const decideJoinRequest = async (req, res) => {
  const { status } = req.body; // approved | rejected
  const request_id = req.params.id;
  try {
    const [[jr]] = await pool.query(`SELECT * FROM join_requests WHERE request_id = ?`, [request_id]);
    if (!jr) return res.status(404).json({ message: "Request not found" });

    await pool.query(
      `UPDATE join_requests SET status = ?, approved_by = ?, approved_at = NOW() WHERE request_id = ?`,
      [status, req.user.user_id, request_id]
    );

    if (status === "approved") {
      await pool.query(
        `INSERT INTO user_roles (user_id, mandapam_id, role_id, status)
         VALUES (?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE role_id = VALUES(role_id), status='active'`,
        [jr.user_id, jr.mandapam_id, jr.requested_role_id]
      );
    }
    res.json({ message: `Request ${status}` });
  } catch (e) {
    res.status(500).json({ message: "Decision failed", error: e.message });
  }
};
