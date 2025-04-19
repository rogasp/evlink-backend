
---

## 📄 `docs/link-flow.md` (🔄 uppdaterad version)

```markdown
# 🔗 Enode Vehicle Link Flow (v3)

Detta dokument beskriver hela backendflödet för hur en användare länkar sitt fordon via Enode och hur det hanteras i backend.

---

## 🧭 Backendflöde

```text
[1] Frontend anropar: GET /api/user/{user_id}/link?vendor=XPENG
      ↓
[2] Backend anropar: POST /users/{user_id}/link (mot Enode)
      ↓
[3] Backend returnerar:
    {
      "linkUrl": "https://sandbox.link.enode.com/abc123",
      "linkToken": "eyJhbGci..."
    }
      ↓
[4] Frontend:
    - Sparar token i sessionStorage
    - Öppnar linkUrl i popup
      ↓
[5] Enode redirectar till REDIRECT_URI (t.ex. /static/callback.html)
      ↓
[6] callback.html:
    - Läser token från sessionStorage
    - Skickar token till ursprungssida via window.postMessage
      ↓
[7] Ursprungssidan:
    - POSTar token till /api/confirm-link
      ↓
[8] Backend:
    - POST /links/token (mot Enode)
    - Sparar userId + vendor
    - Returnerar "Vendor linked"
