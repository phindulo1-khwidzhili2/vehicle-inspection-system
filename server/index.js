const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/", (req, res) => {
  res.send("Vehicle Pre-Use Inspection API is running");
});

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
}

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1 AND is_active = true",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid login details" });
    }

    const user = result.rows[0];

   const validPassword = await bcrypt.compare(password, user.password);

if (!validPassword) {
  return res.status(401).json({ error: "Invalid login details" });
}

    const token = jwt.sign(
      {
        user_id: user.user_id,
        full_name: user.full_name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/upload-defect-photo", auth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No photo uploaded" });
    }

    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `defect-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("defect-photos")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("defect-photos")
      .getPublicUrl(fileName);

    res.json({ photo_url: data.publicUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/checklist", auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        ci.item_id,
        ci.item_name,
        ci.description,
        ci.requires_comment,
        ci.requires_photo,
        cc.category_name,
        cc.hazard_class,
        cc.action_required
      FROM checklist_items ci
      JOIN checklist_categories cc ON ci.category_id = cc.category_id
      WHERE ci.is_active = true
      ORDER BY cc.hazard_class, ci.item_name
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/vehicle/:qrCode", auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM vehicles WHERE qr_code_value = $1",
      [req.params.qrCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inspections", auth, allowRoles("OPERATOR"), async (req, res) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const {
      vehicle_id,
      supervisor_id,
      mileage,
      fuel_level,
      overall_result,
      operator_signature,
      answers,
    } = req.body;

    const inspectionResult = await client.query(
      `
      INSERT INTO inspections 
      (vehicle_id, operator_id, supervisor_id, mileage, fuel_level, overall_result, operator_signature)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        vehicle_id,
        req.user.user_id,
        supervisor_id,
        mileage,
        fuel_level,
        overall_result,
        operator_signature,
      ]
    );

    const inspection = inspectionResult.rows[0];

    for (const answer of answers) {
      await client.query(
        `
        INSERT INTO inspection_answers
        (inspection_id, item_id, answer, comment, photo_url)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          inspection.inspection_id,
          answer.item_id,
          answer.answer,
          answer.comment || "",
          answer.photo_url || null,
        ]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Inspection submitted successfully",
      inspection,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.get("/api/pending-inspections", auth, allowRoles("SUPERVISOR"), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        i.*,
        v.registration_number,
        v.vehicle_code,
        v.vehicle_type,
        u.full_name AS operator_name
      FROM inspections i
      JOIN vehicles v ON i.vehicle_id = v.vehicle_id
      JOIN users u ON i.operator_id = u.user_id
      WHERE i.inspection_status = 'PENDING_APPROVAL'
      ORDER BY i.submitted_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/inspections/:id/approve", auth, allowRoles("SUPERVISOR"), async (req, res) => {
  try {
    const { status, supervisor_comment } = req.body;

    const result = await db.query(
      `
      UPDATE inspections
      SET inspection_status = $1,
          approved_at = CURRENT_TIMESTAMP,
          supervisor_comment = $2
      WHERE inspection_id = $3
      RETURNING *
      `,
      [status, supervisor_comment || "", req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/my-inspections", auth, allowRoles("OPERATOR"), async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT 
        i.*,
        v.registration_number,
        v.vehicle_code,
        v.vehicle_type
      FROM inspections i
      JOIN vehicles v ON i.vehicle_id = v.vehicle_id
      WHERE i.operator_id = $1
      ORDER BY i.submitted_at DESC
      `,
      [req.user.user_id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ADMIN ROUTES */

app.get("/api/users", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT user_id, full_name, email, role, department, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const { full_name, email, password, role, department } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `
      INSERT INTO users (full_name, email, password, role, department)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, full_name, email, role, department, is_active
      `,
      [full_name, email, hashedPassword, role, department]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/users/:id/deactivate", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const result = await db.query(
      `
      UPDATE users
      SET is_active = false
      WHERE user_id = $1
      RETURNING user_id, full_name, email, role, is_active
      `,
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/vehicles", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM vehicles
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/vehicles", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const {
      vehicle_code,
      registration_number,
      vehicle_type,
      department,
      qr_code_value,
    } = req.body;

    const result = await db.query(
      `
      INSERT INTO vehicles
      (vehicle_code, registration_number, vehicle_type, department, qr_code_value)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        vehicle_code,
        registration_number,
        vehicle_type,
        department,
        qr_code_value,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/inspections/:id/details", auth, async (req, res) => {
  try {
    const inspectionResult = await db.query(
      `
      SELECT 
        i.*,
        v.registration_number,
        v.vehicle_code,
        v.vehicle_type,
        u.full_name AS operator_name
      FROM inspections i
      JOIN vehicles v ON i.vehicle_id = v.vehicle_id
      JOIN users u ON i.operator_id = u.user_id
      WHERE i.inspection_id = $1
      `,
      [req.params.id]
    );

    const answersResult = await db.query(
      `
      SELECT 
        ia.answer,
        ia.comment,
        ia.photo_url,
        ci.item_name,
        cc.category_name,
        cc.hazard_class
      FROM inspection_answers ia
      JOIN checklist_items ci ON ia.item_id = ci.item_id
      JOIN checklist_categories cc ON ci.category_id = cc.category_id
      WHERE ia.inspection_id = $1
      ORDER BY cc.hazard_class, ci.item_name
      `,
      [req.params.id]
    );

    res.json({
      inspection: inspectionResult.rows[0],
      answers: answersResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/users/:id", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const { full_name, email, role, department } = req.body;

    const result = await db.query(
      `
      UPDATE users
      SET full_name = $1,
          email = $2,
          role = $3,
          department = $4
      WHERE user_id = $5
      RETURNING user_id, full_name, email, role, department, is_active
      `,
      [full_name, email, role, department, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/users/:id/reactivate", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const result = await db.query(
      `
      UPDATE users
      SET is_active = true
      WHERE user_id = $1
      RETURNING user_id, full_name, email, role, is_active
      `,
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.patch("/api/vehicles/:id", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const {
      vehicle_code,
      registration_number,
      vehicle_type,
      department,
      qr_code_value,
      status,
    } = req.body;

    const result = await db.query(
      `
      UPDATE vehicles
      SET vehicle_code = $1,
          registration_number = $2,
          vehicle_type = $3,
          department = $4,
          qr_code_value = $5,
          status = $6
      WHERE vehicle_id = $7
      RETURNING *
      `,
      [
        vehicle_code,
        registration_number,
        vehicle_type,
        department,
        qr_code_value,
        status || "ACTIVE",
        req.params.id,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/vehicles/:id/deactivate", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const result = await db.query(
      `
      UPDATE vehicles
      SET status = 'INACTIVE'
      WHERE vehicle_id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/vehicles/:id/reactivate", auth, allowRoles("ADMIN"), async (req, res) => {
  try {
    const result = await db.query(
      `
      UPDATE vehicles
      SET status = 'ACTIVE'
      WHERE vehicle_id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.patch("/api/change-password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All password fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const result = await db.query(
      "SELECT password FROM users WHERE user_id = $1",
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    const validOldPassword = await bcrypt.compare(oldPassword, user.password);

    if (!validOldPassword) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = $1 WHERE user_id = $2",
      [hashedPassword, req.user.user_id]
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});