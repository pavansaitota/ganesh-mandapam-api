import pool from "../config/db.js";

/* =====================================================
   Get All Roles
   ===================================================== */
export const listRoles = async (req, res) => {
  try {
    console.log("📋 Fetching all available roles...");
    const [rows] = await pool.query(
      "SELECT role_id, role_name, role_description FROM roles ORDER BY role_id ASC"
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No roles found" });
    }

    console.log(`✅ Found ${rows.length} roles`);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching roles:", error);
    res.status(500).json({ message: "Error fetching roles", error: error.message });
  }
};
