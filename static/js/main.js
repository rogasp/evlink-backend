document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("user-id").value;
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id }),
      });

    if (res.ok) {
      localStorage.setItem("userId", id);
      window.location.href = "/static/dashboard.html";
    } else {
      alert("Misslyckades att logga in / skapa användare.");
    }
});

  }

  if (window.location.pathname.includes("dashboard.html")) {
    if (!userId) {
      alert("Du måste logga in först");
      window.location.href = "/static/index.html";
      return;
    }

    document.getElementById("user-info").textContent =
      "Inloggad som: " + userId;
    fetchApiKey();
    listVehicles();
  }
});

async function createApiKey() {
  const userId = localStorage.getItem("userId");
  const res = await fetch(`/api/user/${userId}/apikey`, { method: "POST" });
  const data = await res.json();
  document.getElementById("api-key").textContent = data.api_key || "Fel vid skapande";
}

async function fetchApiKey() {
  const res = await fetch("/api/admin/apikeys", {
    headers: { "X-API-Key": "admin" }, // Tillfälligt adminläge
  });
  const userId = localStorage.getItem("userId");
  const data = await res.json();
  const match = data.find((k) => k.user_id === userId);
  if (match) {
    document.getElementById("api-key").textContent = match.api_key;
  }
}

async function startLink() {
  const userId = localStorage.getItem("userId");
  const vendor = document.getElementById("vendor").value;

  const res = await fetch(`/api/user/${userId}/link?vendor=${vendor}`);
  const data = await res.json();
  window.open(data.linkUrl, "_blank");
}

async function listVehicles() {
  const res = await fetch(`/api/vehicles`);
  const vehicles = await res.json();
  const ul = document.getElementById("vehicle-list");
  ul.innerHTML = "";
  for (let v of vehicles) {
    const li = document.createElement("li");
    li.textContent = `${v.information?.displayName || "Fordonsnamn"} – ${v.chargeState?.batteryLevel || "?"}%`;
    ul.appendChild(li);
  }
}
