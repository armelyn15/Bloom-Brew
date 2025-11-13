document.addEventListener("DOMContentLoaded", () => {
  // --- Elements (may be null on some pages) ---
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const menuGrid = document.getElementById("menuGrid");
  const cartItemsDiv = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const orderTableBody = document.getElementById("orderTableBody");
  const historyTableBody = document.getElementById("historyTableBody");
  const notifBtn = document.getElementById("notifBtn");
  const notifBox = document.getElementById("notifBox");
  const notifList = document.getElementById("notifList");
  const receiptModal = document.getElementById("receiptModal");
  const receiptDetails = document.getElementById("receiptDetails");
  const closeReceipt = document.getElementById("closeReceipt");
  const toastEl = document.getElementById("toast");
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mainNav = document.getElementById("mainNav");

  // --- Mobile Menu Toggle ---
  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenuToggle.classList.toggle("active");
      mainNav.classList.toggle("active");
    });

    // Close mobile menu when clicking on a link
    if (mainNav) {
      const navLinks = mainNav.querySelectorAll("a");
      navLinks.forEach(link => {
        link.addEventListener("click", () => {
          mobileMenuToggle.classList.remove("active");
          mainNav.classList.remove("active");
        });
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (mainNav && mobileMenuToggle && 
          !mainNav.contains(e.target) && 
          !mobileMenuToggle.contains(e.target) &&
          mainNav.classList.contains("active")) {
        mobileMenuToggle.classList.remove("active");
        mainNav.classList.remove("active");
      }
    });
  }

  // --- State (persistent) ---
  let users = JSON.parse(localStorage.getItem("users")) || [
    { username: "admin", password: "12345", role: "admin" },
    { username: "staff", password: "staff123", role: "staff" }
  ];
  localStorage.setItem("users", JSON.stringify(users));
  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

  function normalizeMenuEntries(items) {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      name: item?.name || "Milk Tea",
      price: Number(item?.price) || 0,
      img: item?.img || item?.image || ""
    }));
  }

  function cacheDefaultMenu(items) {
    if (!Array.isArray(items) || !items.length) return;
    if (typeof window !== "undefined") {
      window.__DEFAULT_MENU__ = items.map(entry => ({ ...entry }));
    }
    try {
      sessionStorage.setItem("__DEFAULT_MENU__", JSON.stringify(items));
    } catch (_) {}
  }

  function readMenuFromSession() {
    try {
      const stored = sessionStorage.getItem("__DEFAULT_MENU__");
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (_) {
      return [];
    }
  }

  function readMenuFromScriptTag() {
    const dataNode = document.getElementById("defaultMenuData");
    if (!dataNode) return [];
    try {
      return JSON.parse(dataNode.textContent || "[]");
    } catch (_) {
      return [];
    }
  }

  function getDefaultMenu() {
    if (typeof window !== "undefined" && Array.isArray(window.__DEFAULT_MENU__)) {
      const normalized = normalizeMenuEntries(window.__DEFAULT_MENU__);
      cacheDefaultMenu(normalized);
      return normalized;
    }
    const fromSession = normalizeMenuEntries(readMenuFromSession());
    if (fromSession.length) {
      cacheDefaultMenu(fromSession);
      return fromSession;
    }
    const fromScript = normalizeMenuEntries(readMenuFromScriptTag());
    if (fromScript.length) {
      cacheDefaultMenu(fromScript);
      return fromScript;
    }
    return [];
  }

  const defaultMenu = getDefaultMenu();
  const defaultMenuFallbackImage = defaultMenu.find(item => item.img)?.img || "";

  let menu = JSON.parse(localStorage.getItem("menu"));
  if (!Array.isArray(menu) || menu.length === 0) {
    menu = [...defaultMenu];
    localStorage.setItem("menu", JSON.stringify(menu));
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // --- Helpers ---
  function ensureToastInfrastructure() {
    // Inject toast style once if missing
    if (!document.getElementById("global-toast-style")) {
      const style = document.createElement("style");
      style.id = "global-toast-style";
      style.textContent = `
        .toast {
          visibility: hidden;
          min-width: 300px;
          max-width: 90vw;
          background-color: #5b3a29;
          color: #fff8ee;
          text-align: left;
          border-radius: 14px;
          padding: 14px 18px;
          position: fixed;
          left: 50%;
          bottom: 40px;
          transform: translateX(-50%);
          z-index: 2000;
          font-family: "Poppins", sans-serif;
          font-size: 15px;
          opacity: 0;
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
          transition: opacity .35s ease, bottom .35s ease, transform .35s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .toast.show {
          visibility: visible;
          opacity: 1;
          bottom: 60px;
        }
        .toast.toast-success { background-color: #2e7d32; color: #eaffea; }
        .toast.toast-error { background-color: #b71c1c; color: #ffebee; }
        .toast.toast-info { background-color: #37474f; color: #e0f7fa; }
        .toast .toast-icon { font-size: 18px; line-height: 1; }
        .toast .toast-message { flex: 1; }
      `;
      document.head.appendChild(style);
    }
    // Ensure toast element exists
    if (!document.getElementById("toast")) {
      const div = document.createElement("div");
      div.id = "toast";
      div.className = "toast";
      div.innerHTML = `<span class="toast-icon">✨</span><span class="toast-message"></span>`;
      document.body.appendChild(div);
    }
  }

  function showToast(message, type = "info", duration = 2500) {
    ensureToastInfrastructure();
    const el = document.getElementById("toast");
    if (!el) return alert(message);
    const icon = el.querySelector(".toast-icon");
    const msg = el.querySelector(".toast-message");
    const typeClass =
      type === "success" ? "toast-success" :
      type === "error" ? "toast-error" : "toast-info";
    const iconChar =
      type === "success" ? "✅" :
      type === "error" ? "⚠️" : "💡";

    el.className = `toast ${typeClass} show`;
    icon.textContent = iconChar;
    msg.textContent = message;
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => { el.className = `toast ${typeClass}`; }, duration);
  }

  function ensureConfirmInfrastructure() {
    if (!document.getElementById("global-confirm-style")) {
      const style = document.createElement("style");
      style.id = "global-confirm-style";
      style.textContent = `
        .confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(44, 27, 23, 0.35);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity .3s ease;
          z-index: 2500;
        }
        .confirm-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }
        .confirm-modal {
          width: min(92vw, 360px);
          background: #fff8ee;
          border-radius: 18px;
          padding: 24px 26px 20px;
          box-shadow: 0 18px 45px rgba(44,27,23,0.25);
          font-family: "Poppins", sans-serif;
          color: #4b2d22;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transform: translateY(16px);
          transition: transform .32s ease;
        }
        .confirm-overlay.show .confirm-modal {
          transform: translateY(0);
        }
        .confirm-modal.confirm-warning .confirm-icon { background: #fff2cc; color: #d97706; }
        .confirm-modal.confirm-danger .confirm-icon { background: #fde4e7; color: #c62828; }
        .confirm-modal.confirm-info .confirm-icon { background: #e3f2fd; color: #1565c0; }
        .confirm-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 600;
        }
        .confirm-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        .confirm-message {
          margin: 0;
          color: #5b3a29;
          font-size: 15px;
          line-height: 1.5;
        }
        .confirm-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .confirm-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .confirm-btn:focus-visible {
          outline: 2px solid rgba(91,58,41,0.35);
          outline-offset: 2px;
        }
        .confirm-btn.cancel {
          background: #f5ebe0;
          color: #5b3a29;
        }
        .confirm-btn.confirm {
          background: linear-gradient(135deg, #e07a5f, #d64545);
          color: #fff7f2;
          box-shadow: 0 6px 14px rgba(214, 69, 69, 0.25);
        }
        .confirm-btn:hover {
          transform: translateY(-1px);
        }
      `;
      document.head.appendChild(style);
    }
    if (!document.getElementById("confirmOverlay")) {
      const overlay = document.createElement("div");
      overlay.id = "confirmOverlay";
      overlay.className = "confirm-overlay";
      overlay.innerHTML = `
        <div class="confirm-modal confirm-warning" role="dialog" aria-modal="true" aria-labelledby="confirmTitle" aria-describedby="confirmMessage">
          <div class="confirm-icon" id="confirmIcon">⚠️</div>
          <div class="confirm-content">
            <h3 class="confirm-title" id="confirmTitle">Are you sure?</h3>
            <p class="confirm-message" id="confirmMessage"></p>
          </div>
          <div class="confirm-actions">
            <button type="button" class="confirm-btn cancel" id="confirmCancelBtn">Cancel</button>
            <button type="button" class="confirm-btn confirm" id="confirmOkBtn">Yes</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    }
  }

  function showConfirm(message, options = {}) {
    const {
      title = "Are you sure?",
      confirmText = "Yes, continue",
      cancelText = "Cancel",
      variant = "warning"
    } = options;

    ensureConfirmInfrastructure();
    const overlay = document.getElementById("confirmOverlay");
    const modal = overlay.querySelector(".confirm-modal");
    const titleEl = overlay.querySelector("#confirmTitle");
    const messageEl = overlay.querySelector("#confirmMessage");
    const iconEl = overlay.querySelector("#confirmIcon");
    const confirmBtn = overlay.querySelector("#confirmOkBtn");
    const cancelBtn = overlay.querySelector("#confirmCancelBtn");

    const variantClass =
      variant === "danger" ? "confirm-danger" :
      variant === "info" ? "confirm-info" : "confirm-warning";
    const iconChar =
      variant === "danger" ? "🛑" :
      variant === "info" ? "💡" : "⚠️";

    modal.classList.remove("confirm-danger", "confirm-info", "confirm-warning");
    modal.classList.add(variantClass);
    titleEl.textContent = title;
    messageEl.textContent = message;
    iconEl.textContent = iconChar;
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    return new Promise((resolve) => {
      let active = true;
      const cleanup = (result) => {
        if (!active) return;
        active = false;
        overlay.classList.remove("show");
        document.removeEventListener("keydown", onKeyDown);
        overlay.removeEventListener("click", onBackdropClick);
        confirmBtn.removeEventListener("click", onConfirm);
        cancelBtn.removeEventListener("click", onCancel);
        setTimeout(() => resolve(result), 180);
      };

      const onConfirm = () => cleanup(true);
      const onCancel = () => cleanup(false);
      const onKeyDown = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          cleanup(false);
        }
        if (e.key === "Enter") {
          e.preventDefault();
          cleanup(true);
        }
      };
      const onBackdropClick = (e) => {
        if (e.target === overlay) cleanup(false);
      };

      document.addEventListener("keydown", onKeyDown);
      overlay.addEventListener("click", onBackdropClick);
      confirmBtn.addEventListener("click", onConfirm);
      cancelBtn.addEventListener("click", onCancel);

      overlay.classList.add("show");
      setTimeout(() => confirmBtn.focus(), 50);
    });
  }

  function showCenteredMessage(message) {
    const box = document.createElement("div");
    box.textContent = message;
    Object.assign(box.style, {
      position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
      background: "#5c2b29", color: "#fff", padding: "20px 40px", borderRadius: "10px",
      fontSize: "18px", zIndex: "9999", textAlign: "center",
      boxShadow: "0 4px 10px rgba(0,0,0,0.3)", transition: "opacity 0.5s ease", opacity: "1"
    });
    document.body.appendChild(box);
    setTimeout(() => { box.style.opacity = "0"; setTimeout(() => box.remove(), 500); }, 1500);
  }

  // --- Login ---
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("username").value.trim();
      const pass = document.getElementById("password").value.trim();
      if (pass.length < 8) return alert("Password must be at least 8 characters!");
      const foundUser = users.find(u => u.username === user && u.password === pass);
      if (foundUser) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(foundUser));
        currentUser = foundUser;
        if (foundUser.role === "admin") window.location.href = "dashboard-admin.html";
        else if (foundUser.role === "staff") window.location.href = "dashboard-staff.html";
        else window.location.href = "index.html";
      } else {
        const msg = document.getElementById("loginMessage");
        if (msg) {
          msg.textContent = "Invalid username or password!";
          msg.className = "login-message error show";
          setTimeout(() => msg.classList.remove("show"), 3000);
        } else alert("Invalid username or password!");
      }
    });
  }

  // --- Signup ---
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newUser = document.getElementById("newUsername").value.trim();
      const newPass = document.getElementById("newPassword").value.trim();
      const role = document.getElementById("role").value;
      if (newPass.length < 8) return alert("Password must be at least 8 characters!");
      if (users.find(u => u.username === newUser)) return alert("Username already exists!");
      users.push({ username: newUser, password: newPass, role });
      localStorage.setItem("users", JSON.stringify(users));
      alert("Account created successfully! You can now log in.");
      window.location.href = "login.html";
    });
  }

  // --- Logout ---
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("cart");
      window.location.href = "login.html";
    });
  }

  // --- Page protection ---
  const path = window.location.pathname;
  if ((path.includes("index") || path.includes("dashboard")) && !currentUser) {
    if (!path.includes("login") && !path.includes("signup")) {
      window.location.href = "login.html";
    }
  }
  if (path.includes("dashboard-admin") && currentUser?.role !== "admin") {
    alert("Access denied! Admin only."); window.location.href = "login.html";
  }
  if (path.includes("dashboard-staff") && currentUser?.role !== "staff") {
    alert("Access denied! Staff only."); window.location.href = "login.html";
  }

  // --- Customer: Menu & Cart ---
function renderMenuForCustomer() {
  if (!menuGrid) return;

  // Always get the latest menu from localStorage
  menu = JSON.parse(localStorage.getItem("menu")) || [];
  if (!Array.isArray(menu)) menu = [];

  if (menu.length === 0) {
    menuGrid.innerHTML = `<p class="empty-menu">No menu items available yet.</p>`;
    return;
  }

  const fallbackImage =
    menu.find(item => item?.img)?.img ||
    defaultMenuFallbackImage ||
    "";

  menuGrid.innerHTML = menu.map((m) => {
    const price = Number(m.price) || 0;
    const imgSrc = m.img || m.image || fallbackImage;
    return `
      <div class="menu-item">
        <img src="${imgSrc || ""}" alt="${m.name}">
        <h3>${m.name}</h3>
        <p>₱${price.toFixed(2).replace(/\.00$/, '')}</p>
        <button class="add-to-cart-btn" data-name="${m.name}" data-price="${price}">Add to Cart</button>
      </div>
    `;
  }).join("");

  if (fallbackImage) {
    menuGrid.querySelectorAll(".menu-item img").forEach(imgEl => {
      imgEl.addEventListener("error", () => {
        if (imgEl.dataset.fallbackApplied === "true") return;
        imgEl.dataset.fallbackApplied = "true";
        imgEl.src = fallbackImage;
      }, { once: true });
    });
  }

  document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const price = parseFloat(btn.getAttribute("data-price"));
      addToCart(name, price);
    });
  });
}

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function addToCart(name, price) {
    let existing = cart.find(i => i.name === name);
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else cart.push({ name, price, qty: 1 });
    saveCart();
    showCenteredMessage(`${name} added to cart!`);
    renderCart();
  }
  window.addToCart = addToCart;

  function renderCart() {
    if (!cartItemsDiv) return;
    cart = JSON.parse(localStorage.getItem("cart")) || cart;
    if (cart.length === 0) {
      cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
      if (totalPriceEl) totalPriceEl.textContent = "Total: ₱0";
      return;
    }
    cartItemsDiv.innerHTML = cart.map((c, i) => `
      <div class="cart-item">
        ${c.name} x ${c.qty || 1} - ₱${(c.price * (c.qty || 1)).toFixed(2)} 
        <button class="remove-cart-btn" data-index="${i}">Remove</button>
      </div>
    `).join("");
    document.querySelectorAll(".remove-cart-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.getAttribute("data-index"), 10);
        cart.splice(i, 1);
        saveCart();
        renderCart();
      });
    });
    if (totalPriceEl) {
      const total = cart.reduce((sum, c) => sum + c.price * (c.qty || 1), 0);
      totalPriceEl.textContent = `Total: ₱${total.toFixed(2)}`;
    }
  }

  // --- Checkout with Receipt Notification ---
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart.length === 0) return showToast("Your cart is empty!");

      const paymentInput = document.querySelector('input[name="payment"]:checked');
      const payment = paymentInput ? paymentInput.value : null;
      if (!payment) return showToast("Please select a payment method!");

      const total = cart.reduce((sum, c) => sum + c.price * (c.qty || 1), 0);
      const curr = JSON.parse(localStorage.getItem("currentUser"));
      const order = {
        user: curr ? curr.username : "Guest",
        items: [...cart], // Copy cart items
        total: Number(total.toFixed(2)),
        payment,
        status: "Pending",
        createdAt: new Date().toISOString(),
        orderId: 'ORD' + Date.now() // Add unique order ID
      };

      let orders = JSON.parse(localStorage.getItem("orders")) || [];
      orders.push(order);
      localStorage.setItem("orders", JSON.stringify(orders));

      // Show receipt notification
      showReceiptNotification(order);

      cart = [];
      saveCart();
      renderCart();
      renderOrderHistory();
      renderNotifications();
    });
  }

  // --- Receipt Notification Function ---
  function showReceiptNotification(order) {
    if (receiptDetails && receiptModal) {
      let html = `
        <div class="receipt-header">
          <h3>Bloom & Brew</h3>
          <p>Order Receipt</p>
        </div>
        <div class="receipt-body">
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Customer:</strong> ${order.user}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${order.payment}</p>
          <hr>
          <div class="receipt-items">
            <h4>Items:</h4>
            <ul>
              ${order.items.map(i => `
                <li>${i.name} x ${i.qty || 1} - ₱${(i.price*(i.qty||1)).toFixed(2)}</li>
              `).join("")}
            </ul>
          </div>
          <hr>
          <p class="receipt-total"><strong>Total: ₱${order.total.toFixed(2)}</strong></p>
          <p class="receipt-status"><strong>Status:</strong> ${order.status}</p>
        </div>
        <div class="receipt-footer">
          <p>Thank you for your order! 🧋</p>
        </div>
      `;
      receiptDetails.innerHTML = html;
      receiptModal.style.display = "flex"; // Changed to flex for centering
    } else {
      // Fallback if modal doesn't exist
      showToast(`Order placed! Total: ₱${order.total.toFixed(2)}`);
    }
  }

  if (closeReceipt) {
    closeReceipt.addEventListener("click", () => {
      if (receiptModal) receiptModal.style.display = "none";
    });
  }

  // Close modal when clicking outside
  if (receiptModal) {
    receiptModal.addEventListener("click", (e) => {
      if (e.target === receiptModal) {
        receiptModal.style.display = "none";
      }
    });
  }

  // --- STAFF: View & Manage Orders ---
  function renderOrders() {
    if (!orderTableBody) return;
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orderTableBody.innerHTML = "";
    if (orders.length === 0) {
      orderTableBody.innerHTML = `<tr><td colspan="6">No orders found.</td></tr>`;
      return;
    }

    orders.forEach((order, index) => {
      const items = (order.items || []).map(i => `${i.name} x ${i.qty || 1}`).join(", ");
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${order.user}</td>
        <td>${items}</td>
        <td>₱${Number(order.total).toFixed(2)}</td>
        <td>${order.payment}</td>
        <td>${order.status}</td>
        <td>
          ${order.status === "Pending"
            ? `<button class="complete-btn" data-index="${index}">Mark as Completed</button>`
            : `<span>Completed</span>
               <button class="remove-btn" data-index="${index}" style="margin-left:10px;background:#b71c1c;color:#fff;border:none;border-radius:5px;padding:5px 10px;cursor:pointer;">Remove</button>`
          }
        </td>
      `;
      orderTableBody.appendChild(tr);
    });

    document.querySelectorAll(".complete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.getAttribute("data-index"), 10);
        let orders = JSON.parse(localStorage.getItem("orders")) || [];
        if (!orders[i]) return;
        orders[i].status = "Completed";
        localStorage.setItem("orders", JSON.stringify(orders));
        renderOrders();
        renderOrderHistory();
        renderNotifications();
        showToast("Order marked as completed.", "success");
      });
    });

    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const i = parseInt(btn.getAttribute("data-index"), 10);
        const confirmed = await showConfirm(
          "Removing this order will permanently clear it from the list. Continue?",
          { confirmText: "Yes, remove", cancelText: "Keep order", variant: "danger" }
        );
        if (!confirmed) return;
        let orders = JSON.parse(localStorage.getItem("orders")) || [];
        orders.splice(i, 1);
        localStorage.setItem("orders", JSON.stringify(orders));
        renderOrders();
        renderOrderHistory();
        renderNotifications();
        showToast("Order removed successfully.", "success");
      });
    });
  }

  // --- Customer: Order History ---
  function renderOrderHistory() {
    if (!historyTableBody) return;
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      historyTableBody.innerHTML = `<tr><td colspan="4">No orders found.</td></tr>`;
      return;
    }
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    const myOrders = orders.filter(o => o.user === currentUser.username);
    if (myOrders.length === 0) {
      historyTableBody.innerHTML = `<tr><td colspan="4">No orders found.</td></tr>`;
      return;
    }
    historyTableBody.innerHTML = myOrders.map(order => {
      const items = (order.items || []).map(i => `${i.name} x ${i.qty || 1}`).join(", ");
      return `
        <tr>
          <td>${items}</td>
          <td>₱${Number(order.total).toFixed(2)}</td>
          <td>${order.payment}</td>
          <td>${order.status}</td>
        </tr>
      `;
    }).join("");
  }

  // --- Notifications ---
  function renderNotifications() {
    if (!notifBtn || !notifBox || !notifList) return;
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    const myOrders = orders.filter(o => o.user === currentUser.username);
    notifList.innerHTML = "";
    if (myOrders.length === 0) {
      notifList.innerHTML = `<li>No orders yet.</li>`;
      notifBtn.removeAttribute("data-count");
      return;
    }
    let pendingCount = 0;
    myOrders.forEach(order => {
      const items = (order.items || []).map(i => i.name).join(", ");
      const statusClass = order.status === "Pending" ? "pending" : "completed";
      if (order.status === "Pending") pendingCount++;
      const li = document.createElement("li");
      li.innerHTML = `${items} — <span class="${statusClass}">${order.status}</span>`;
      notifList.appendChild(li);
    });
    if (pendingCount > 0) notifBtn.setAttribute("data-count", pendingCount);
    else notifBtn.removeAttribute("data-count");
  }

  if (notifBtn && notifBox && notifList) {
    notifBtn.addEventListener("click", () => notifBox.classList.toggle("hidden"));
    setInterval(renderNotifications, 5000);
    renderNotifications();
  }

  // --- Cross-tab updates ---
  window.addEventListener('storage', (e) => {
    if (e.key === 'orders' || e.key === 'cart') {
      renderOrderHistory();
      renderOrders();
      renderNotifications();
      renderCart();
    }
    if (e.key === 'menu') {
      renderMenuForCustomer();
    }
  });

  if (typeof window !== "undefined") {
    window.showToast = showToast;
    window.showConfirm = showConfirm;
  }

  // --- Initial render ---
  renderMenuForCustomer();
  renderCart();
  renderOrders();
  renderOrderHistory();
  renderNotifications();
});