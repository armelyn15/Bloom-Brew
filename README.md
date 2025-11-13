# Bloom & Brew Ordering System

> A browser-based ordering experience for Bloom & Brew’s milk tea shop. Customers can browse the menu, add items to their cart, and check out; staff and admin dashboards offer order management and menu configuration tools.

## ✨ Features

- **Customer Dashboard**
  - Dynamic menu sourced from localStorage so updates appear instantly
  - Cart with quantity tracking, persistent totals, and checkout flow
  - Receipt popup with order summary and payment method

- **Staff Dashboard**
  - Live order list with status updates and removal controls
  - Aesthetic toast + confirmation prompts for completing/removing orders
  - Automatic syncing across browser tabs via `storage` events

- **Admin Dashboard**
  - Manage users: add, change role, delete with polished confirmations
  - Manage menu: add drinks with images, delete items, instant customer sync
  - Notifications surfaced through consistent toast interface

## 🛠️ Tech Stack

- HTML, CSS (custom styling, responsive layout)
- JavaScript 
- Bootstrap

## 🚀 Getting Started

1. Clone or download this repository.
2. Open `index.html` in your browser to explore the customer experience.
3. Use `login.html` to sign in:
   - Admin: `admin / 12345`
   - Staff: `staff / staff123`
4. Access admin dashboard via `dashboard-admin.html`; staff dashboard via `dashboard-staff.html`.

> Tip: Because data is stored locally, clearing browser storage resets the app to its default menu and user set.

## 🧭 Project Structure

```
ordering system/
├── index.html              # Customer-facing site
├── dashboard-admin.html    # Admin dashboard (menu & user management)
├── dashboard-staff.html    # Staff dashboard (order processing)
├── script.js               # Shared logic for authentication, menu, carts, dashboards
├── style.css               # Global styles
├── img/                    # Project imagery
└── README.md               # Project overview & guides
```

## 📌 Notes & Tips

- Menu edits on the admin dashboard immediately sync to the customer view thanks to shared `localStorage` and dynamic rendering.
- Toast notifications and confirmation dialogs share a unified aesthetic across pages; both are accessible via `showToast()` and `showConfirm()` helpers.
- The system is designed for local/demo use. For production, consider replacing `localStorage` with a real backend and authentication flow.

## 🤝 Contributing

Feel free to fork the project and submit pull requests for improvements—styling enhancements, new drink categories, or integration with a backend service are all welcome!

## 📄 License

This project is provided for educational and demonstration purposes. Customize as needed for your own Bloom & Brew deployment. Cheers! 🧋

