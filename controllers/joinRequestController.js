import pool from "../config/db.js";

/* =====================================================
   1️⃣  Send Join Request (with role & remarks)
   ===================================================== */
export const requestJoin = async (req, res) => {
  const { mandapam_id, requested_role_id, remarks = null } = req.body;
  const user_id = req.user.user_id;

  try {
    // 🧩 Validate inputs
    if (!mandapam_id || !requested_role_id) {
      return res.status(400).json({ message: "mandapam_id and requested_role_id are required" });
    }

    console.log("📥 New join request:", { user_id, mandapam_id, requested_role_id, remarks });

    // 🚫 Prevent duplicate pending requests
    const [existing] = await pool.query(
      `SELECT request_id FROM join_requests 
       WHERE user_id = ? AND mandapam_id = ? AND status = 'pending'`,
      [user_id, mandapam_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "You already have a pending request for this mandapam" });
    }

    // 🚫 Optional: prevent multiple presidents in same mandapam
    if (requested_role_id === 1) { // Assuming 1 = President
      const [existingPresident] = await pool.query(
        `SELECT * FROM user_roles WHERE mandapam_id = ? AND role_id = 1 AND status = 'active'`,
        [mandapam_id]
      );
      if (existingPresident.length > 0) {
        return res.status(400).json({ message: "A President already exists for this Mandapam" });
      }
    }

    // ✅ Insert new join request
    const [r] = await pool.query(
      `INSERT INTO join_requests (user_id, mandapam_id, requested_role_id, status, requested_at, remarks)
       VALUES (?, ?, ?, 'pending', NOW(), ?)`,
      [user_id, mandapam_id, requested_role_id, remarks]
    );

    console.log("✅ Join request created with ID:", r.insertId);

    res.json({ message: "Join request sent successfully", request_id: r.insertId });
  } catch (e) {
    console.error("❌ Request join failed:", e);
    res.status(500).json({ message: "Request failed", error: e.message });
  }
};

/* =====================================================
   2️⃣  List Pending Join Requests (by Mandapam)
   ===================================================== */
export const listJoinRequests = async (req, res) => {
  const mandapam_id = req.params.mandapam_id;

  try {
    console.log("📋 Fetching join requests for mandapam:", mandapam_id);

    const [rows] = await pool.query(
      `SELECT 
          jr.request_id,
          jr.user_id,
          jr.mandapam_id,
          jr.requested_role_id,
          jr.status,
          jr.requested_at,
          jr.remarks,
          u.full_name AS user_name,
          u.mobile_no,
          r.role_name
       FROM join_requests jr
       JOIN users u ON u.user_id = jr.user_id
       JOIN roles r ON r.role_id = jr.requested_role_id
       WHERE jr.mandapam_id = ?
       ORDER BY jr.requested_at DESC`,
      [mandapam_id]
    );

    console.log(`✅ Found ${rows.length} join requests`);
    res.json(rows);
  } catch (e) {
    console.error("❌ List join requests failed:", e);
    res.status(500).json({ message: "List failed", error: e.message });
  }
};

/* =====================================================
   3️⃣  Approve or Reject a Join Request
   ===================================================== */
export const decideJoinRequest = async (req, res) => {
  const { status } = req.body; // approved | rejected
  const request_id = req.params.id;
  const approved_by = req.user.user_id;

  try {
    console.log(`⚙️ Processing join request #${request_id} as ${status}`);

    // 🔍 Fetch the join request
    const [[jr]] = await pool.query(`SELECT * FROM join_requests WHERE request_id = ?`, [request_id]);
    if (!jr) {
      return res.status(404).json({ message: "Join request not found" });
    }

    // 🧱 Update join request status
    await pool.query(
      `UPDATE join_requests 
       SET status = ?, approved_by = ?, approved_at = NOW() 
       WHERE request_id = ?`,
      [status, approved_by, request_id]
    );

    // ✅ On approval, update/create user role
    if (status === "approved") {
      await pool.query(
        `INSERT INTO user_roles (user_id, mandapam_id, role_id, status)
         VALUES (?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE role_id = VALUES(role_id), status = 'active'`,
        [jr.user_id, jr.mandapam_id, jr.requested_role_id]
      );

      // Optional: also link user to mandapam if not linked
      await pool.query(
        `UPDATE users SET mandapam_id = ? WHERE user_id = ? AND (mandapam_id IS NULL OR mandapam_id != ?)`,
        [jr.mandapam_id, jr.user_id, jr.mandapam_id]
      );

      console.log(`✅ Approved join request #${request_id} for user #${jr.user_id}`);
    } else {
      console.log(`🚫 Rejected join request #${request_id}`);
    }

    res.json({ message: `Join request ${status} successfully` });
  } catch (e) {
    console.error("❌ Decision join request failed:", e);
    res.status(500).json({ message: "Decision failed", error: e.message });
  }
};
