# Simple Payroll System

Vanilla JavaScript payroll system built with OOP. Computes employee gross pay, deductions (SSS, PhilHealth, Pag-IBIG, tax), and net pay. Data persists via localStorage.

---

## Classes

| Class | Role |
|---|---|
| `Employee` | Stores employee data, validates input, computes gross pay |
| `Deduction` | Computes SSS, PhilHealth, Pag-IBIG, and withholding tax |
| `PayrollEngine` | Wires Employee and Deduction, produces final payroll result |
| `App` | Controller — handles routing, DOM rendering, and localStorage |

## Features

- Add and remove employees
- Compute payroll by days worked
- View itemized payslip (gross, deductions, net pay)
- Print payslip via browser print dialog
- localStorage persistence — data survives page refresh

## Deduction Rates

| Type | Rate |
|---|---|
| SSS | ₱100 fixed |
| PhilHealth | 2% of gross |
| Pag-IBIG | ₱100 fixed |
| Tax | 5% of gross |

## Setup

No dependencies, no build step.

```bash
git clone https://github.com/mrmerozz/oopsys.git
cd oopsys
```

Open `index.html` in a browser — that's it.

## Stack

- HTML / CSS / Vanilla JS (ES6 classes)
- Google Fonts (DM Sans, DM Mono)
- localStorage for persistence

