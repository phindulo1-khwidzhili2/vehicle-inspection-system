import { useEffect, useState } from "react";
import API from "./api";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("dashboard");

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleEditForm, setVehicleEditForm] = useState({});

  const [editingChecklist, setEditingChecklist] = useState(null);
  const [checklistEditForm, setChecklistEditForm] = useState({});

  const [userForm, setUserForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "OPERATOR",
    department: "",
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicle_code: "",
    registration_number: "",
    vehicle_type: "",
    department: "",
    qr_code_value: "",
  });

  const [checklistForm, setChecklistForm] = useState({
    item_name: "",
    description: "",
    category_id: "",
    requires_comment: false,
    requires_photo: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const usersRes = await API.get("/users");
    const vehiclesRes = await API.get("/vehicles");
    const checklistRes = await API.get("/admin/checklist-items");
    const categoriesRes = await API.get("/admin/checklist-categories");

    setUsers(usersRes.data);
    setVehicles(vehiclesRes.data);
    setChecklistItems(checklistRes.data);
    setCategories(categoriesRes.data);
  }

  async function addUser(e) {
    e.preventDefault();

    if (!userForm.full_name || !userForm.email || !userForm.password) {
      alert("Full name, email, and password are required");
      return;
    }

    await API.post("/users", userForm);

    setUserForm({
      full_name: "",
      email: "",
      password: "",
      role: "OPERATOR",
      department: "",
    });

    alert("User added successfully");
    loadData();
  }

  async function deactivateUser(id) {
    await API.patch(`/users/${id}/deactivate`);
    alert("User deactivated");
    loadData();
  }

  async function reactivateUser(id) {
    await API.patch(`/users/${id}/reactivate`);
    alert("User reactivated");
    loadData();
  }

  function startEdit(user) {
    setEditingUser(user.user_id);
    setEditForm({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department || "",
    });
  }

  async function saveEdit(id) {
    await API.patch(`/users/${id}`, editForm);
    alert("User updated successfully");
    setEditingUser(null);
    setEditForm({});
    loadData();
  }

  async function addVehicle(e) {
    e.preventDefault();

    if (
      !vehicleForm.vehicle_code ||
      !vehicleForm.registration_number ||
      !vehicleForm.vehicle_type
    ) {
      alert("Vehicle code, registration number, and vehicle type are required");
      return;
    }

    const qrValue =
      vehicleForm.qr_code_value ||
      `${vehicleForm.vehicle_code}-${vehicleForm.registration_number}`;

    await API.post("/vehicles", {
      ...vehicleForm,
      qr_code_value: qrValue,
    });

    setVehicleForm({
      vehicle_code: "",
      registration_number: "",
      vehicle_type: "",
      department: "",
      qr_code_value: "",
    });

    alert("Vehicle added successfully");
    loadData();
  }

  function startVehicleEdit(vehicle) {
    setEditingVehicle(vehicle.vehicle_id);
    setVehicleEditForm({
      vehicle_code: vehicle.vehicle_code,
      registration_number: vehicle.registration_number,
      vehicle_type: vehicle.vehicle_type,
      department: vehicle.department || "",
      qr_code_value: vehicle.qr_code_value,
      status: vehicle.status || "ACTIVE",
    });
  }

  async function saveVehicleEdit(id) {
    await API.patch(`/vehicles/${id}`, vehicleEditForm);
    alert("Vehicle updated successfully");
    setEditingVehicle(null);
    setVehicleEditForm({});
    loadData();
  }

  async function deactivateVehicle(id) {
    await API.patch(`/vehicles/${id}/deactivate`);
    alert("Vehicle removed from active use");
    loadData();
  }

  async function reactivateVehicle(id) {
    await API.patch(`/vehicles/${id}/reactivate`);
    alert("Vehicle reactivated");
    loadData();
  }

  function downloadQR(vehicle) {
    const canvas = document.querySelector(`#qr-${vehicle.vehicle_id} canvas`);

    if (!canvas) {
      alert("QR code not found");
      return;
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${vehicle.vehicle_code}-qr-code.png`;
    link.click();
  }

  async function addChecklistItem(e) {
    e.preventDefault();

    if (!checklistForm.item_name || !checklistForm.category_id) {
      alert("Item name and category are required");
      return;
    }

    await API.post("/admin/checklist-items", checklistForm);

    alert("Checklist item added successfully");

    setChecklistForm({
      item_name: "",
      description: "",
      category_id: "",
      requires_comment: false,
      requires_photo: false,
    });

    loadData();
  }

  function startChecklistEdit(item) {
    setEditingChecklist(item.item_id);
    setChecklistEditForm({
      item_name: item.item_name,
      description: item.description || "",
      category_id: item.category_id,
      requires_comment: item.requires_comment || false,
      requires_photo: item.requires_photo || false,
      is_active: item.is_active,
    });
  }

  async function saveChecklistEdit(id) {
    await API.patch(`/admin/checklist-items/${id}`, checklistEditForm);
    alert("Checklist item updated successfully");
    setEditingChecklist(null);
    setChecklistEditForm({});
    loadData();
  }

  async function deactivateChecklistItem(id) {
    await API.patch(`/admin/checklist-items/${id}/deactivate`);
    alert("Checklist item deactivated");
    loadData();
  }

  async function reactivateChecklistItem(id) {
    await API.patch(`/admin/checklist-items/${id}/reactivate`);
    alert("Checklist item reactivated");
    loadData();
  }

  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = users.filter((u) => !u.is_active).length;
  const admins = users.filter((u) => u.role === "ADMIN").length;
  const operators = users.filter((u) => u.role === "OPERATOR").length;
  const supervisors = users.filter((u) => u.role === "SUPERVISOR").length;
  const activeVehicles = vehicles.filter(
    (v) => (v.status || "ACTIVE") === "ACTIVE"
  ).length;
  const inactiveVehicles = vehicles.filter(
    (v) => (v.status || "ACTIVE") === "INACTIVE"
  ).length;
  const activeChecklistItems = checklistItems.filter((i) => i.is_active).length;
  const inactiveChecklistItems = checklistItems.filter((i) => !i.is_active).length;

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>V</div>
          <div>
            <h2 style={styles.brandTitle}>VInspect</h2>
            <p style={styles.brandSub}>Admin Console</p>
          </div>
        </div>

        <nav style={styles.nav}>
          <button
            style={active === "dashboard" ? styles.navActive : styles.navItem}
            onClick={() => setActive("dashboard")}
          >
            Dashboard
          </button>

          <button
            style={active === "users" ? styles.navActive : styles.navItem}
            onClick={() => setActive("users")}
          >
            User Management
          </button>

          <button
            style={active === "vehicles" ? styles.navActive : styles.navItem}
            onClick={() => setActive("vehicles")}
          >
            Vehicle & QR Control
          </button>

          <button
            style={active === "checklist" ? styles.navActive : styles.navItem}
            onClick={() => setActive("checklist")}
          >
            Checklist Management
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <p>System Status</p>
          <span style={styles.onlineBadge}>ONLINE</span>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>
              {active === "dashboard" && "Executive Overview"}
              {active === "users" && "User Administration"}
              {active === "vehicles" && "Vehicle & QR Management"}
              {active === "checklist" && "Checklist Management"}
            </h1>
            <p style={styles.pageSubtitle}>
              Mining vehicle pre-use inspection management system
            </p>
          </div>

          <div style={styles.adminPill}>ADMIN</div>
        </header>

        {active === "dashboard" && (
          <>
            <section style={styles.heroPanel}>
              <div>
                <p style={styles.eyebrow}>Control Center</p>
                <h2 style={styles.heroTitle}>Inspection System Operations</h2>
                <p style={styles.heroText}>
                  Manage users, vehicles, QR codes, checklist rules, approvals,
                  inspections and photo-based defect evidence.
                </p>
              </div>

              <div style={styles.heroMetric}>
                <h2>{users.length + vehicles.length + checklistItems.length}</h2>
                <p>Total Managed Records</p>
              </div>
            </section>

            <section style={styles.metricGrid}>
              <MetricCard title="Total Users" value={users.length} />
              <MetricCard title="Active Users" value={activeUsers} success />
              <MetricCard title="Inactive Users" value={inactiveUsers} danger />
              <MetricCard title="Total Vehicles" value={vehicles.length} />
              <MetricCard title="Active Vehicles" value={activeVehicles} success />
              <MetricCard title="Inactive Vehicles" value={inactiveVehicles} danger />
              <MetricCard title="Checklist Items" value={checklistItems.length} />
              <MetricCard title="Active Checklist" value={activeChecklistItems} success />
              <MetricCard title="Inactive Checklist" value={inactiveChecklistItems} danger />
              <MetricCard title="Operators" value={operators} />
              <MetricCard title="Supervisors" value={supervisors} />
              <MetricCard title="Admins" value={admins} />
            </section>

            <section style={styles.panel}>
              <h3 style={styles.panelTitle}>Enabled Modules</h3>

              <div style={styles.moduleGrid}>
                <Module title="QR Vehicle Identification" status="Enabled" />
                <Module title="Dynamic Checklist Management" status="Enabled" />
                <Module title="Supervisor Approval" status="Enabled" />
                <Module title="Photo Evidence Upload" status="Enabled" />
                <Module title="Operator History" status="Enabled" />
                <Module title="Admin Asset Control" status="Enabled" />
              </div>
            </section>
          </>
        )}

        {active === "users" && (
          <div style={styles.twoColumn}>
            <section style={styles.panel}>
              <h3 style={styles.panelTitle}>Create User</h3>

              <form onSubmit={addUser} style={styles.form}>
                <Field
                  label="Full Name"
                  value={userForm.full_name}
                  onChange={(value) =>
                    setUserForm({ ...userForm, full_name: value })
                  }
                />

                <Field
                  label="Email Address"
                  value={userForm.email}
                  onChange={(value) =>
                    setUserForm({ ...userForm, email: value })
                  }
                />

                <Field
                  label="Password"
                  value={userForm.password}
                  onChange={(value) =>
                    setUserForm({ ...userForm, password: value })
                  }
                />

                <label style={styles.label}>Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value })
                  }
                  style={styles.input}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                </select>

                <Field
                  label="Department"
                  value={userForm.department}
                  onChange={(value) =>
                    setUserForm({ ...userForm, department: value })
                  }
                />

                <button style={styles.primaryButton}>Create User</button>
              </form>
            </section>

            <section style={styles.panel}>
              <h3 style={styles.panelTitle}>User Directory</h3>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Department</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id}>
                        <td style={styles.td}>
                          {editingUser === u.user_id ? (
                            <input
                              value={editForm.full_name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  full_name: e.target.value,
                                })
                              }
                              style={styles.smallInput}
                            />
                          ) : (
                            <b>{u.full_name}</b>
                          )}
                        </td>

                        <td style={styles.td}>
                          {editingUser === u.user_id ? (
                            <input
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  email: e.target.value,
                                })
                              }
                              style={styles.smallInput}
                            />
                          ) : (
                            <p style={styles.tableSub}>{u.email}</p>
                          )}
                        </td>

                        <td style={styles.td}>
                          {editingUser === u.user_id ? (
                            <select
                              value={editForm.role}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  role: e.target.value,
                                })
                              }
                              style={styles.smallInput}
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="OPERATOR">OPERATOR</option>
                              <option value="SUPERVISOR">SUPERVISOR</option>
                            </select>
                          ) : (
                            u.role
                          )}
                        </td>

                        <td style={styles.td}>
                          {editingUser === u.user_id ? (
                            <input
                              value={editForm.department}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  department: e.target.value,
                                })
                              }
                              style={styles.smallInput}
                            />
                          ) : (
                            u.department || "N/A"
                          )}
                        </td>

                        <td style={styles.td}>
                          <span
                            style={
                              u.is_active
                                ? styles.activeBadge
                                : styles.inactiveBadge
                            }
                          >
                            {u.is_active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          {editingUser === u.user_id ? (
                            <div style={styles.actionGroup}>
                              <button
                                style={styles.smallSaveButton}
                                onClick={() => saveEdit(u.user_id)}
                              >
                                Save
                              </button>

                              <button
                                style={styles.smallNeutralButton}
                                onClick={() => {
                                  setEditingUser(null);
                                  setEditForm({});
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={styles.actionGroup}>
                              <button
                                style={styles.smallEditButton}
                                onClick={() => startEdit(u)}
                              >
                                Edit
                              </button>

                              {u.is_active ? (
                                <button
                                  style={styles.smallDangerButton}
                                  onClick={() => deactivateUser(u.user_id)}
                                >
                                  Disable
                                </button>
                              ) : (
                                <button
                                  style={styles.smallSuccessButton}
                                  onClick={() => reactivateUser(u.user_id)}
                                >
                                  Reactivate
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
                {active === "vehicles" && (
          <div style={styles.twoColumn}>
            <section style={styles.panel}>
              <h3 style={styles.panelTitle}>Register Vehicle</h3>

              <form onSubmit={addVehicle} style={styles.form}>
                <Field
                  label="Vehicle Code"
                  placeholder="LDV-002"
                  value={vehicleForm.vehicle_code}
                  onChange={(value) =>
                    setVehicleForm({ ...vehicleForm, vehicle_code: value })
                  }
                />

                <Field
                  label="Registration Number"
                  value={vehicleForm.registration_number}
                  onChange={(value) =>
                    setVehicleForm({
                      ...vehicleForm,
                      registration_number: value,
                    })
                  }
                />

                <Field
                  label="Vehicle Type"
                  placeholder="Light Delivery Vehicle"
                  value={vehicleForm.vehicle_type}
                  onChange={(value) =>
                    setVehicleForm({ ...vehicleForm, vehicle_type: value })
                  }
                />

                <Field
                  label="Department"
                  value={vehicleForm.department}
                  onChange={(value) =>
                    setVehicleForm({ ...vehicleForm, department: value })
                  }
                />

                <Field
                  label="Custom QR Value"
                  placeholder="Optional"
                  value={vehicleForm.qr_code_value}
                  onChange={(value) =>
                    setVehicleForm({ ...vehicleForm, qr_code_value: value })
                  }
                />

                <button style={styles.primaryButton}>Register Vehicle</button>
              </form>
            </section>

            <section style={styles.panel}>
              <h3 style={styles.panelTitle}>Vehicle QR Registry</h3>

              <div style={styles.vehicleList}>
                {vehicles.map((v) => (
                  <div key={v.vehicle_id} style={styles.vehicleRow}>
                    <div style={styles.vehicleInfo}>
                      {editingVehicle === v.vehicle_id ? (
                        <>
                          <input
                            value={vehicleEditForm.registration_number}
                            onChange={(e) =>
                              setVehicleEditForm({
                                ...vehicleEditForm,
                                registration_number: e.target.value,
                              })
                            }
                            style={styles.smallInput}
                            placeholder="Registration number"
                          />

                          <input
                            value={vehicleEditForm.vehicle_code}
                            onChange={(e) =>
                              setVehicleEditForm({
                                ...vehicleEditForm,
                                vehicle_code: e.target.value,
                              })
                            }
                            style={styles.smallInput}
                            placeholder="Vehicle code"
                          />

                          <input
                            value={vehicleEditForm.vehicle_type}
                            onChange={(e) =>
                              setVehicleEditForm({
                                ...vehicleEditForm,
                                vehicle_type: e.target.value,
                              })
                            }
                            style={styles.smallInput}
                            placeholder="Vehicle type"
                          />

                          <input
                            value={vehicleEditForm.department}
                            onChange={(e) =>
                              setVehicleEditForm({
                                ...vehicleEditForm,
                                department: e.target.value,
                              })
                            }
                            style={styles.smallInput}
                            placeholder="Department"
                          />

                          <input
                            value={vehicleEditForm.qr_code_value}
                            onChange={(e) =>
                              setVehicleEditForm({
                                ...vehicleEditForm,
                                qr_code_value: e.target.value,
                              })
                            }
                            style={styles.smallInput}
                            placeholder="QR value"
                          />

                          <select
                            value={vehicleEditForm.status}
                            onChange={(e) =>
                              setVehicleEditForm({
                                ...vehicleEditForm,
                                status: e.target.value,
                              })
                            }
                            style={styles.smallInput}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </>
                      ) : (
                        <>
                          <h3 style={styles.vehicleTitle}>
                            {v.registration_number}
                          </h3>

                          <p style={styles.tableSub}>
                            {v.vehicle_code} • {v.vehicle_type}
                          </p>

                          <p style={styles.qrValue}>{v.qr_code_value}</p>

                          <p style={styles.vehicleStatusText}>
                            Status:{" "}
                            <span
                              style={
                                (v.status || "ACTIVE") === "ACTIVE"
                                  ? styles.activeText
                                  : styles.inactiveText
                              }
                            >
                              {v.status || "ACTIVE"}
                            </span>
                          </p>
                        </>
                      )}
                    </div>

                    <div id={`qr-${v.vehicle_id}`} style={styles.qrBox}>
                      <QRCodeCanvas
                        value={
                          editingVehicle === v.vehicle_id
                            ? vehicleEditForm.qr_code_value
                            : v.qr_code_value
                        }
                        size={110}
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    <div style={styles.actionGroup}>
                      {editingVehicle === v.vehicle_id ? (
                        <>
                          <button
                            style={styles.smallSaveButton}
                            onClick={() => saveVehicleEdit(v.vehicle_id)}
                          >
                            Save
                          </button>

                          <button
                            style={styles.smallNeutralButton}
                            onClick={() => {
                              setEditingVehicle(null);
                              setVehicleEditForm({});
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            style={styles.smallEditButton}
                            onClick={() => startVehicleEdit(v)}
                          >
                            Edit
                          </button>

                          <button
                            style={styles.downloadButton}
                            onClick={() => downloadQR(v)}
                          >
                            QR
                          </button>

                          {(v.status || "ACTIVE") === "ACTIVE" ? (
                            <button
                              style={styles.smallDangerButton}
                              onClick={() => deactivateVehicle(v.vehicle_id)}
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              style={styles.smallSuccessButton}
                              onClick={() => reactivateVehicle(v.vehicle_id)}
                            >
                              Restore
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {active === "checklist" && (
          <div style={styles.twoColumn}>
            <section style={styles.panel}>
              <h3 style={styles.panelTitle}>Add Checklist Item</h3>

              <form onSubmit={addChecklistItem} style={styles.form}>
                <Field
                  label="Item Name"
                  placeholder="Example: Check tyres condition"
                  value={checklistForm.item_name}
                  onChange={(value) =>
                    setChecklistForm({ ...checklistForm, item_name: value })
                  }
                />

                <Field
                  label="Description"
                  placeholder="Optional description"
                  value={checklistForm.description}
                  onChange={(value) =>
                    setChecklistForm({ ...checklistForm, description: value })
                  }
                />

                <label style={styles.label}>Category / Hazard Class</label>
                <select
                  value={checklistForm.category_id}
                  onChange={(e) =>
                    setChecklistForm({
                      ...checklistForm,
                      category_id: e.target.value,
                    })
                  }
                  style={styles.input}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name} — Class {cat.hazard_class}
                    </option>
                  ))}
                </select>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={checklistForm.requires_photo}
                    onChange={(e) =>
                      setChecklistForm({
                        ...checklistForm,
                        requires_photo: e.target.checked,
                      })
                    }
                  />
                  Requires defect photo
                </label>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={checklistForm.requires_comment}
                    onChange={(e) =>
                      setChecklistForm({
                        ...checklistForm,
                        requires_comment: e.target.checked,
                      })
                    }
                  />
                  Requires comment
                </label>

                <button style={styles.primaryButton}>Add Checklist Item</button>
              </form>
            </section>

            <section style={styles.panel}>
              <h3 style={styles.panelTitle}>Checklist Items</h3>

              <div style={styles.vehicleList}>
                {checklistItems.map((item) => (
                  <div key={item.item_id} style={styles.vehicleRow}>
                    <div style={styles.vehicleInfo}>
                      {editingChecklist === item.item_id ? (
                        <>
                          <input
                            value={checklistEditForm.item_name}
                            onChange={(e) =>
                              setChecklistEditForm({
                                ...checklistEditForm,
                                item_name: e.target.value,
                              })
                            }
                            style={styles.smallInput}
                            placeholder="Item name"
                          />

                          <input
                            value={checklistEditForm.description}
                            onChange={(e) =>
                              setChecklistEditForm({
                                ...checklistEditForm,
                                description: e.target.value,
                              })
                            }
                            style={styles.smallInput}
                            placeholder="Description"
                          />

                          <select
                            value={checklistEditForm.category_id}
                            onChange={(e) =>
                              setChecklistEditForm({
                                ...checklistEditForm,
                                category_id: e.target.value,
                              })
                            }
                            style={styles.smallInput}
                          >
                            {categories.map((cat) => (
                              <option
                                key={cat.category_id}
                                value={cat.category_id}
                              >
                                {cat.category_name} — Class {cat.hazard_class}
                              </option>
                            ))}
                          </select>

                          <label style={styles.checkboxRowSmall}>
                            <input
                              type="checkbox"
                              checked={checklistEditForm.requires_photo}
                              onChange={(e) =>
                                setChecklistEditForm({
                                  ...checklistEditForm,
                                  requires_photo: e.target.checked,
                                })
                              }
                            />
                            Requires photo
                          </label>

                          <label style={styles.checkboxRowSmall}>
                            <input
                              type="checkbox"
                              checked={checklistEditForm.requires_comment}
                              onChange={(e) =>
                                setChecklistEditForm({
                                  ...checklistEditForm,
                                  requires_comment: e.target.checked,
                                })
                              }
                            />
                            Requires comment
                          </label>

                          <select
                            value={
                              checklistEditForm.is_active ? "ACTIVE" : "INACTIVE"
                            }
                            onChange={(e) =>
                              setChecklistEditForm({
                                ...checklistEditForm,
                                is_active: e.target.value === "ACTIVE",
                              })
                            }
                            style={styles.smallInput}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </>
                      ) : (
                        <>
                          <h3 style={styles.vehicleTitle}>{item.item_name}</h3>

                          <p style={styles.tableSub}>
                            {item.category_name} • Class {item.hazard_class}
                          </p>

                          {item.description && (
                            <p style={styles.tableSub}>{item.description}</p>
                          )}

                          <div style={styles.badgeRow}>
                            {item.requires_photo && (
                              <span style={styles.infoBadge}>Photo Required</span>
                            )}
                            {item.requires_comment && (
                              <span style={styles.infoBadge}>
                                Comment Required
                              </span>
                            )}
                            <span
                              style={
                                item.is_active
                                  ? styles.activeBadge
                                  : styles.inactiveBadge
                              }
                            >
                              {item.is_active ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div style={styles.actionGroup}>
                      {editingChecklist === item.item_id ? (
                        <>
                          <button
                            style={styles.smallSaveButton}
                            onClick={() => saveChecklistEdit(item.item_id)}
                          >
                            Save
                          </button>

                          <button
                            style={styles.smallNeutralButton}
                            onClick={() => {
                              setEditingChecklist(null);
                              setChecklistEditForm({});
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            style={styles.smallEditButton}
                            onClick={() => startChecklistEdit(item)}
                          >
                            Edit
                          </button>

                          {item.is_active ? (
                            <button
                              style={styles.smallDangerButton}
                              onClick={() =>
                                deactivateChecklistItem(item.item_id)
                              }
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              style={styles.smallSuccessButton}
                              onClick={() =>
                                reactivateChecklistItem(item.item_id)
                              }
                            >
                              Activate
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function MetricCard({ title, value, success, danger }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricTitle}>{title}</p>
      <h2
        style={{
          ...styles.metricValue,
          color: success ? "#15803d" : danger ? "#b91c1c" : "#111827",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function Module({ title, status }) {
  return (
    <div style={styles.moduleCard}>
      <span>{title}</span>
      <b>{status}</b>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "" }) {
  return (
    <>
      <label style={styles.label}>{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    background: "#eef2f7",
    fontFamily: "Arial, sans-serif",
  },
  sidebar: {
    width: 260,
    background: "linear-gradient(180deg, #020617, #111827)",
    padding: 22,
    color: "white",
    display: "flex",
    flexDirection: "column",
  },
  brand: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 35,
  },
  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 22,
  },
  brandTitle: {
    margin: 0,
    fontSize: 22,
  },
  brandSub: {
    margin: 0,
    color: "#9ca3af",
    fontSize: 13,
  },
  nav: {
    display: "grid",
    gap: 10,
  },
  navItem: {
    background: "transparent",
    color: "#d1d5db",
    border: "1px solid transparent",
    padding: 13,
    borderRadius: 12,
    textAlign: "left",
    fontWeight: "bold",
    cursor: "pointer",
  },
  navActive: {
    background: "#2563eb",
    color: "white",
    border: "1px solid #3b82f6",
    padding: 13,
    borderRadius: 12,
    textAlign: "left",
    fontWeight: "bold",
    cursor: "pointer",
  },
  sidebarFooter: {
    marginTop: "auto",
    background: "rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 14,
  },
  onlineBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  main: {
    flex: 1,
    padding: 28,
    overflowY: "auto",
  },
  topbar: {
    background: "white",
    padding: 22,
    borderRadius: 20,
    marginBottom: 22,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
  },
  pageTitle: {
    margin: 0,
    fontSize: 28,
    color: "#0f172a",
  },
  pageSubtitle: {
    margin: "6px 0 0 0",
    color: "#64748b",
  },
  adminPill: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: "bold",
  },
  heroPanel: {
    background: "linear-gradient(135deg, #111827, #1e3a8a)",
    color: "white",
    padding: 28,
    borderRadius: 24,
    marginBottom: 22,
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
  },
  eyebrow: {
    color: "#93c5fd",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "bold",
  },
  heroTitle: {
    margin: "6px 0",
    fontSize: 30,
  },
  heroText: {
    color: "#dbeafe",
    maxWidth: 620,
  },
  heroMetric: {
    background: "rgba(255,255,255,0.12)",
    padding: 20,
    borderRadius: 18,
    minWidth: 180,
    textAlign: "center",
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 22,
  },
  metricCard: {
    background: "white",
    padding: 20,
    borderRadius: 18,
    boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
  },
  metricTitle: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
  },
  metricValue: {
    margin: "10px 0 0 0",
    fontSize: 32,
  },
  panel: {
    background: "white",
    padding: 22,
    borderRadius: 20,
    boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
    marginBottom: 22,
  },
  panelTitle: {
    marginTop: 0,
    color: "#0f172a",
  },
  moduleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  moduleCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 15,
    display: "flex",
    justifyContent: "space-between",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: 22,
    alignItems: "start",
  },
  form: {
    display: "grid",
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    padding: 13,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    marginBottom: 13,
    fontSize: 14,
    outline: "none",
  },
  smallInput: {
    width: "100%",
    padding: 9,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 13,
    boxSizing: "border-box",
    marginBottom: 6,
  },
  primaryButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: 14,
    borderRadius: 12,
    fontWeight: "bold",
    cursor: "pointer",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: 12,
    color: "#475569",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 13,
  },
  td: {
    padding: 12,
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top",
  },
  tableSub: {
    margin: "4px 0 0 0",
    color: "#64748b",
    fontSize: 13,
  },
  activeBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  inactiveBadge: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  infoBadge: {
    background: "#e0f2fe",
    color: "#075985",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  badgeRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10,
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    fontSize: 14,
    color: "#334155",
    fontWeight: "bold",
  },
  checkboxRowSmall: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    fontSize: 13,
    color: "#334155",
    fontWeight: "bold",
  },
  actionGroup: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  smallEditButton: {
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "none",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },
  smallSaveButton: {
    background: "#dcfce7",
    color: "#166534",
    border: "none",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },
  smallNeutralButton: {
    background: "#e5e7eb",
    color: "#374151",
    border: "none",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },
  smallDangerButton: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "none",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },
  smallSuccessButton: {
    background: "#dcfce7",
    color: "#166534",
    border: "none",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: "bold",
    cursor: "pointer",
  },
  vehicleList: {
    display: "grid",
    gap: 14,
  },
  vehicleRow: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 16,
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: 16,
    alignItems: "center",
  },
  vehicleInfo: {
    minWidth: 0,
  },
  vehicleTitle: {
    margin: 0,
  },
  qrValue: {
    background: "#e0f2fe",
    color: "#075985",
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  qrBox: {
    background: "white",
    padding: 8,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
  },
  downloadButton: {
    background: "#0f172a",
    color: "white",
    border: "none",
    padding: "11px 14px",
    borderRadius: 12,
    fontWeight: "bold",
    cursor: "pointer",
  },
  vehicleStatusText: {
    fontSize: 13,
    color: "#64748b",
  },
  activeText: {
    color: "#166534",
    fontWeight: "bold",
  },
  inactiveText: {
    color: "#991b1b",
    fontWeight: "bold",
  },
};
        