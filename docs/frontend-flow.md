# 🌐 Frontend Flow: Vehicle Linking via Enode

Detta dokument beskriver hur frontend-delen av Enode-länkningsflödet fungerar i EVLink-projektet med en enkel HTML + JavaScript-lösning.

---

## 🔁 Översikt

```text
[1] Användaren klickar "Länka fordon" i link.html
      ↓
[2] Frontend anropar GET /api/user/{user_id}/link?vendor=XPENG
      ↓
[3] Backend returnerar { linkUrl, linkToken }
      ↓
[4] Frontend:
    - Sparar linkToken i sessionStorage
    - Öppnar linkUrl i en popup
      ↓
[5] Enode-länkning sker i popup
      ↓
[6] Enode redirectar till callback.html i popupen
      ↓
[7] callback.html:
    - Läser linkToken från sessionStorage
    - Skickar tillbaka token till ursprungssidan via window.postMessage
    - Stänger popup
      ↓
[8] Ursprungssidan:
    - Mottar token
    - POSTar till /api/confirm-link
    - Visar länkstatus till användaren
---

## 🧪 Utvecklingsläge (Mock)

Under utveckling kan du aktivera ett mock-läge där `linkToken` inte verifieras mot Enode utan returnerar testdata direkt.

### Så aktiverar du mock:

1. Lägg till i `.env`:

2. Då returnerar `get_link_result()` följande värde:
```json
{
  "userId": "rogasp",
  "vendor": "XPENG"
}
