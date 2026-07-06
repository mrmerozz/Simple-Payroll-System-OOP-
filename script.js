class Employee {
  constructor(name, position, ratePerDay) {
    this.id = Date.now();
    this.name = name;
    this.position = position;
    this.ratePerDay = parseFloat(ratePerDay);
  }

  isValid() {
    return this.name.trim() !== "" && this.position.trim() !== "" && !isNaN(this.ratePerDay) && this.ratePerDay > 0;
  }

  getGross(daysWorked) {
    return this.ratePerDay * daysWorked;
  }
}

class Deduction {
  constructor(gross) {
    this.gross = gross;
  }

  getSSS()       { return 100; }
  getPhilHealth(){ return parseFloat((this.gross * 0.02).toFixed(2)); }
  getPagIBIG()   { return 100; }
  getTax()       { return parseFloat((this.gross * 0.05).toFixed(2)); }

  getTotal() {
    return this.getSSS() + this.getPhilHealth() + this.getPagIBIG() + this.getTax();
  }
}

class PayrollEngine {
  constructor(employee, daysWorked) {
    this.employee  = employee;
    this.daysWorked = parseFloat(daysWorked);
    this.gross     = employee.getGross(this.daysWorked);
    this.deduction = new Deduction(this.gross);
    this.netPay    = this.gross - this.deduction.getTotal();
  }

  isValid() {
    return !isNaN(this.daysWorked) && this.daysWorked > 0;
  }
}

class App {
  constructor() {
    this.currentPayroll = null;
    this.activeTab = "add";
    this.render("add");
  }

  getEmployees() {
    return JSON.parse(localStorage.getItem("employees") || "[]");
  }

  saveEmployees(list) {
    localStorage.setItem("employees", JSON.stringify(list));
  }

  peso(n) {
    return "&#8369;" + parseFloat(n).toFixed(2);
  }

  render(tab) {
    this.activeTab = tab;
    const tabs = [
      { key: "add",     label: "Add Employee" },
      { key: "list",    label: "Employee List" },
      { key: "compute", label: "Compute" },
      { key: "payslip", label: "Payslip" },
    ];

    const navHTML = tabs.map(t =>
      `<button class="nav-btn${this.activeTab === t.key ? " active" : ""}" onclick="app.render('${t.key}')">${t.label}</button>`
    ).join("");

    let content = "";
    if (tab === "add")     content = this.viewAdd();
    if (tab === "list")    content = this.viewList();
    if (tab === "compute") content = this.viewCompute();
    if (tab === "payslip") content = this.viewPayslip();

    document.body.innerHTML = `
      <div class="wrapper">
        <div class="brand">
          <div class="brand-label">Payroll</div>
          <h1>Simple Payroll System</h1>
        </div>
        <nav class="nav-strip">${navHTML}</nav>
        <div class="card">${content}</div>
      </div>
    `;
  }

  viewAdd() {
    return `
      <div class="card-title">Add Employee</div>
      <div class="field">
        <label>Full Name</label>
        <input type="text" id="name" placeholder="Juan Dela Cruz">
      </div>
      <div class="field">
        <label>Position</label>
        <input type="text" id="position" placeholder="Staff">
      </div>
      <div class="field">
        <label>Daily Rate (&#8369;)</label>
        <input type="number" id="rate" placeholder="500" min="1">
      </div>
      <button class="btn btn-primary" onclick="app.addEmployee()">Add Employee</button>
      <div id="toast"></div>
    `;
  }

  addEmployee() {
    const name     = document.getElementById("name").value;
    const position = document.getElementById("position").value;
    const rate     = document.getElementById("rate").value;
    const toast    = document.getElementById("toast");

    const emp = new Employee(name, position, rate);
    if (!emp.isValid()) {
      toast.className = "toast error";
      toast.innerHTML = "Fill in all fields correctly.";
      return;
    }

    const list = this.getEmployees();
    list.push(emp);
    this.saveEmployees(list);

    toast.className = "toast";
    toast.innerHTML = emp.name + " added successfully.";

    document.getElementById("name").value     = "";
    document.getElementById("position").value = "";
    document.getElementById("rate").value     = "";
  }

  viewList() {
    const list = this.getEmployees();
    if (list.length === 0) {
      return `<div class="card-title">Employee List</div><div class="empty">No employees yet.</div>`;
    }

    const rows = list.map(e => `
      <div class="emp-row">
        <div class="emp-info">
          <span class="emp-name">${e.name}</span>
          <span class="emp-meta">${e.position} &middot; ${this.peso(e.ratePerDay)}/day</span>
        </div>
        <button class="btn btn-danger" onclick="app.deleteEmployee(${e.id})">Remove</button>
      </div>
    `).join("");

    return `<div class="card-title">Employee List</div><div class="emp-list">${rows}</div>`;
  }

  deleteEmployee(id) {
    this.saveEmployees(this.getEmployees().filter(e => e.id !== id));
    this.render("list");
  }

  viewCompute() {
    const list = this.getEmployees();
    if (list.length === 0) {
      return `<div class="card-title">Compute Payroll</div><div class="empty">No employees yet.</div>`;
    }

    const options = list.map(e => `<option value="${e.id}">${e.name}</option>`).join("");

    return `
      <div class="card-title">Compute Payroll</div>
      <div class="field">
        <label>Select Employee</label>
        <select id="empSelect">${options}</select>
      </div>
      <div class="field">
        <label>Days Worked</label>
        <input type="number" id="days" placeholder="22" min="0.5" step="0.5">
      </div>
      <button class="btn btn-primary" onclick="app.compute()">Compute</button>
      <div id="toast"></div>
    `;
  }

  compute() {
    const list    = this.getEmployees();
    const id      = parseInt(document.getElementById("empSelect").value);
    const days    = document.getElementById("days").value;
    const toast   = document.getElementById("toast");

    const empData = list.find(e => e.id === id);
    if (!empData) { toast.className = "toast error"; toast.innerHTML = "Employee not found."; return; }

    const emp     = new Employee(empData.name, empData.position, empData.ratePerDay);
    const payroll = new PayrollEngine(emp, days);
    if (!payroll.isValid()) { toast.className = "toast error"; toast.innerHTML = "Enter valid days worked."; return; }

    this.currentPayroll = payroll;
    toast.className = "toast";
    toast.innerHTML = "Computed. View results in the Payslip tab.";
  }

  viewPayslip() {
    if (!this.currentPayroll) {
      return `<div class="card-title">Payslip</div><div class="empty">No payroll computed yet.</div>`;
    }

    const p = this.currentPayroll;
    const d = p.deduction;

    return `
      <div class="card-title">Payslip</div>
      <div class="slip-block">
        <div class="slip-row"><span class="label">Employee</span><span class="val">${p.employee.name}</span></div>
        <div class="slip-row"><span class="label">Position</span><span class="val">${p.employee.position}</span></div>
        <div class="slip-row"><span class="label">Days Worked</span><span class="val">${p.daysWorked}</span></div>
        <div class="slip-row"><span class="label">Rate / Day</span><span class="val">${this.peso(p.employee.ratePerDay)}</span></div>
        <div class="slip-row"><span class="label">Gross Pay</span><span class="val">${this.peso(p.gross)}</span></div>

        <div class="slip-section-label">Deductions</div>
        <div class="slip-row"><span class="label">SSS</span><span class="val">${this.peso(d.getSSS())}</span></div>
        <div class="slip-row"><span class="label">PhilHealth</span><span class="val">${this.peso(d.getPhilHealth())}</span></div>
        <div class="slip-row"><span class="label">Pag-IBIG</span><span class="val">${this.peso(d.getPagIBIG())}</span></div>
        <div class="slip-row"><span class="label">Tax</span><span class="val">${this.peso(d.getTax())}</span></div>
        <div class="slip-row"><span class="label">Total Deductions</span><span class="val">${this.peso(d.getTotal())}</span></div>

        <div class="slip-total">
          <span>Net Pay</span>
          <span class="val">${this.peso(p.netPay)}</span>
        </div>
      </div>
      <button class="btn btn-print" onclick="app.print()">Print Payslip</button>
    `;
  }

  print() {
    if (!this.currentPayroll) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <style>
        body { font-family: sans-serif; max-width: 420px; margin: 48px auto; color: #111; }
        h2 { font-size: 1rem; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        td { padding: 7px 0; border-bottom: 1px solid #eee; }
        td:last-child { text-align: right; font-family: monospace; }
        .total td { font-weight: 700; font-size: 1rem; border-top: 2px solid #111; border-bottom: none; padding-top: 12px; }
      </style>
    `);
    const p = this.currentPayroll;
    const d = p.deduction;
    const r = (n) => "&#8369;" + parseFloat(n).toFixed(2);
    win.document.write(`
      <h2>Payslip - ${p.employee.name}</h2>
      <table>
        <tr><td>Position</td><td>${p.employee.position}</td></tr>
        <tr><td>Days Worked</td><td>${p.daysWorked}</td></tr>
        <tr><td>Rate / Day</td><td>${r(p.employee.ratePerDay)}</td></tr>
        <tr><td>Gross Pay</td><td>${r(p.gross)}</td></tr>
        <tr><td>SSS</td><td>${r(d.getSSS())}</td></tr>
        <tr><td>PhilHealth</td><td>${r(d.getPhilHealth())}</td></tr>
        <tr><td>Pag-IBIG</td><td>${r(d.getPagIBIG())}</td></tr>
        <tr><td>Tax</td><td>${r(d.getTax())}</td></tr>
        <tr><td>Total Deductions</td><td>${r(d.getTotal())}</td></tr>
        <tr class="total"><td>Net Pay</td><td>${r(p.netPay)}</td></tr>
      </table>
    `);
    win.print();
  }
}

const app = new App();
