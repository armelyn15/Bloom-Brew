function renderUsers() {
  if (!userTableBody) return;
  users = JSON.parse(localStorage.getItem("users")) || [];
  userTableBody.innerHTML = users.map((u, i) => `
    <tr>
      <td>${u.username}</td>
      <td>${u.role}</td>
      <td>${u.username !== currentUser?.username ? 
        `<button class="delete-btn" data-index="${i}">Delete</button>` : `<span>You</span>`}</td>
    </tr>
  `).join("");
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.getAttribute("data-index"), 10);
      if (confirm("Delete this user?")) {
        users.splice(i, 1);
        localStorage.setItem("users", JSON.stringify(users));
        renderUsers();
      }
    });
  });
}
renderUsers();

function renderMenu() {
  if (!menuTableBody) return;
  menuTableBody.innerHTML = menu.map((m, i) => `
    <tr>
      <td>${m.name}</td>
      <td>₱${m.price}</td>
      <td><img src="${m.img}" width="50"></td>
      <td><button class="delete-menu-btn" data-index="${i}">Delete</button></td>
    </tr>
  `).join("");
  document.querySelectorAll(".delete-menu-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = parseInt(btn.getAttribute("data-index"), 10);
      menu.splice(i, 1);
      localStorage.setItem("menu", JSON.stringify(menu));
      renderMenu();
    });
  });
}

if (menuForm) {
  menuForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("itemName").value.trim();
    const price = parseFloat(document.getElementById("itemPrice").value);
    const img = document.getElementById("itemImage").value.trim();
    if (!name || !price || !img) return alert("Fill all fields!");
    menu.push({ name, price, img });
    localStorage.setItem("menu", JSON.stringify(menu));
    renderMenu();
    menuForm.reset();
  });
  renderMenu();
}

document.addEventListener("DOMContentLoaded", () => {
  // Access localStorage and needed elements
  const userTableBody = document.getElementById("userTableBody");
  const menuForm = document.getElementById("menuForm");
  const menuTableBody = document.getElementById("menuTableBody");
  const logoutBtn = document.getElementById("logoutBtn");

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  let menu = JSON.parse(localStorage.getItem("menu")) || [];

  // Initialize default menu if empty
  if (menu.length === 0) {
    menu = [
      { name: "Classic Milk Tea", price: 39, img: "img/classic.jpeg" },
      { name: "Wintermelon Milk Tea", price: 55, img: "img/inJoy-Wintermelon-Milk-Tea-Drinks.jpeg" },
      { name: "Okinawa Milk Tea", price: 49, img: "img/okinawa.jpeg" },
      { name: "Matcha Milk Tea", price: 59, img: "img/matcha.jpeg" },
      { name: "Taro Milk Tea", price: 39, img: "img/taro.jpeg" },
      { name: "Strawberry Milk Tea", price: 59, img: "img/strawberry.jpeg" },
      { name: "Chocolate Milk Tea", price: 45, img: "img/chocolate.jpeg" },
      { name: "Brown Sugar Milk Tea", price: 49, img: "img/brownsugar.jpeg" },
      { name: "Caramel Milk Tea", price: 55, img: "img/caramel-milk-tea-.jpeg" },
      { name: "Honeydew Milk Tea", price: 49, img: "img/honeydew_milk_tea_.jpeg" },
      { name: "Cookies & Cream Milk Tea", price: 49, img: "img/Oreo-Bubble-Milk-Tea-Boba,jpeg.jpg" },
      { name: "Mango Milk Tea", price: 49, img: "img/MangoMilkTea.jpeg" }
    ];
    localStorage.setItem("menu", JSON.stringify(menu));
  }

  // --- User Management ---
  function renderUsers() {
    if (!userTableBody) return;
    users = JSON.parse(localStorage.getItem("users")) || [];
    userTableBody.innerHTML = users.map((u, i) => `
      <tr>
        <td>${u.username}</td>
        <td>${u.role}</td>
        <td>${u.username !== currentUser?.username ? 
          `<button class="delete-btn" data-index="${i}">Delete</button>` : `<span>You</span>`}</td>
      </tr>
    `).join("");
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.getAttribute("data-index"), 10);
        if (confirm("Delete this user?")) {
          users.splice(i, 1);
          localStorage.setItem("users", JSON.stringify(users));
          renderUsers();
        }
      });
    });
  }

  // --- Menu Management ---
  function renderMenu() {
    if (!menuTableBody) return;
    menu = JSON.parse(localStorage.getItem("menu")) || [];
    menuTableBody.innerHTML = menu.map((m, i) => `
      <tr>
        <td>${m.name}</td>
        <td>₱${m.price}</td>
        <td><img src="${m.img}" width="50" height="50" style="object-fit: cover; border-radius: 5px;"></td>
        <td><button class="delete-menu-btn" data-index="${i}">Delete</button></td>
      </tr>
    `).join("");
    
    document.querySelectorAll(".delete-menu-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.getAttribute("data-index"), 10);
        if (confirm("Delete this menu item?")) {
          menu.splice(i, 1);
          localStorage.setItem("menu", JSON.stringify(menu));
          renderMenu();
        }
      });
    });
  }

  // Add new menu item
  if (menuForm) {
    menuForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("itemName").value.trim();
      const price = parseFloat(document.getElementById("itemPrice").value);
      const img = document.getElementById("itemImage").value.trim();
      
      if (!name || !price || !img) {
        alert("Please fill all fields!");
        return;
      }
      
      if (price <= 0) {
        alert("Price must be greater than 0!");
        return;
      }

      // Check if item already exists
      if (menu.find(item => item.name.toLowerCase() === name.toLowerCase())) {
        alert("Menu item with this name already exists!");
        return;
      }

      menu.push({ name, price, img });
      localStorage.setItem("menu", JSON.stringify(menu));
      renderMenu();
      menuForm.reset();
      
      alert("Menu item added successfully!");
    });
  }

  // --- Logout ---
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

  // --- Page protection ---
  if (currentUser?.role !== "admin") {
    alert("Access denied! Admin only.");
    window.location.href = "login.html";
    return;
  }

  // Initial render
  renderUsers();
  renderMenu();
});