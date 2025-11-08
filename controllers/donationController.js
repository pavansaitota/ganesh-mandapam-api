import pool from "../config/db.js";

/* ===========================================================
   1️⃣ Add Donation
   =========================================================== */
export const addDonation = async (req, res) => {
  const {
    mandapam_id,
    event_id = null,
    donor_user_id = null,
    donor_name = null,
    amount,
    payment_mode,
    transaction_ref = null,
    received_by = null,
    remarks = null,
  } = req.body;

  try {
    if (!mandapam_id || !amount || !payment_mode) {
      return res.status(400).json({
        message: "mandapam_id, amount, and payment_mode are required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO donations
       (mandapam_id, event_id, donor_user_id, donor_name, amount, payment_mode,
        transaction_ref, donation_date, received_by, status, approved_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'pending', NULL, ?)`,
      [
        mandapam_id,
        event_id,
        donor_user_id,
        donor_name,
        amount,
        payment_mode,
        transaction_ref,
        received_by || req.user?.user_id || null,
        remarks,
      ]
    );

    console.log("✅ Donation added successfully with ID:", result.insertId);

    res.status(201).json({
      message: "Donation added successfully",
      donation_id: result.insertId,
    });
  } catch (e) {
    console.error("❌ addDonation error:", e);
    res.status(500).json({ message: "Add donation failed", error: e.message });
  }
};

/* ===========================================================
   2️⃣ List Donations (with Mandapam QR)
   =========================================================== */
export const listDonations = async (req, res) => {
  const { mandapam_id, status } = req.query;

  try {
    const params = [];
    let sql = `
      SELECT
        d.donation_id,
        d.mandapam_id,
        d.event_id,
        d.donor_user_id,
        d.donor_name,
        d.amount,
        d.payment_mode,
        d.transaction_ref,
        d.donation_date,
        d.status,
        d.remarks,
        m.mandapam_name,
        m.qr AS mandapam_qr         -- ✅ fetch mandapam QR
      FROM donations d
      LEFT JOIN mandapam m ON d.mandapam_id = m.mandapam_id
      WHERE 1=1
    `;

    if (mandapam_id) {
      sql += ` AND d.mandapam_id = ?`;
      params.push(mandapam_id);
    }

    if (status) {
      sql += ` AND d.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY d.donation_date DESC, d.donation_id DESC`;

    const [rows] = await pool.query(sql, params);
    console.log(`✅ Retrieved ${rows.length} donations`);
    res.json(rows);
  } catch (e) {
    console.error("❌ listDonations error:", e);
    res.status(500).json({ message: "List donations failed", error: e.message });
  }
};

/* ===========================================================
   3️⃣ Update Donation Status
   =========================================================== */
export const updateDonationStatus = async (req, res) => {
  const { status, remarks = null } = req.body;
  const id = req.params.id;

  try {
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const approvedBy = req.user?.user_id || null;

    await pool.query(
      `UPDATE donations
       SET status = ?, approved_by = ?, remarks = ?
       WHERE donation_id = ?`,
      [status, approvedBy, remarks, id]
    );

    console.log(`✅ Donation ${id} updated to status: ${status}`);
    res.json({ message: `Donation ${status}` });
  } catch (e) {
    console.error("❌ updateDonationStatus error:", e);
    res.status(500).json({ message: "Update status failed", error: e.message });
  }
};
