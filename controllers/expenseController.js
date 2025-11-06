import pool from "../config/db.js";

export const addExpense = async (req, res) => {
  const { mandapam_id, event_id=null, expense_name, expense_details=null, amount, payment_mode=null, paid_to=null } = req.body;
  try {
    const [r] = await pool.query(
      `INSERT INTO expenses
       (mandapam_id, event_id, expense_name, expense_details, amount, payment_mode, paid_to, entered_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [mandapam_id, event_id, expense_name, expense_details, amount, payment_mode, paid_to, req.user.user_id]
    );
    res.json({ message: "Expense added", expense_id: r.insertId });
  } catch (e) {
    res.status(500).json({ message: "Add expense failed", error: e.message });
  }
};

export const approveExpense = async (req, res) => {
  const { status } = req.body; // approved/rejected
  const id = req.params.id;
  try {
    await pool.query(
      `UPDATE expenses SET status = ?, approved_by = ? WHERE expense_id = ?`,
      [status, req.user.user_id, id]
    );
    res.json({ message: `Expense ${status}` });
  } catch (e) {
    res.status(500).json({ message: "Approve expense failed", error: e.message });
  }
};

export const listExpenses = async (req, res) => {
  const { mandapam_id, status } = req.query;
  try {
    const params = [];
    let sql = `SELECT * FROM expenses WHERE 1=1`;
    if (mandapam_id) { sql += ` AND mandapam_id = ?`; params.push(mandapam_id); }
    if (status) { sql += ` AND status = ?`; params.push(status); }
    sql += ` ORDER BY expense_date DESC, expense_id DESC`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "List expenses failed", error: e.message });
  }
};
