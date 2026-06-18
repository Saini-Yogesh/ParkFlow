const bcrypt = require("bcrypt");

async function generateAdmin() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash("admin123", salt);
  console.log(`
-- Run this in Supabase SQL Editor to create your first Super Admin
INSERT INTO users (name, email, password_hash, role, status)
VALUES ('Super Admin', 'admin@parkflow.com', '${hash}', 'SUPER_ADMIN', 'ACTIVE');
  `);
}

generateAdmin();
