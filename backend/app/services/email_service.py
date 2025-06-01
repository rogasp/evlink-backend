# app/services/email_service.py
import os
from dotenv import load_dotenv

# Ladda .env (om du inte redan gör det i app/main.py)
load_dotenv()

# Importera rätt modul enligt README
import brevo_python
from brevo_python.rest import ApiException

# Kontrollera att API-nyckel finns
API_KEY = os.getenv("BREVO_API_KEY")
if not API_KEY:
    raise RuntimeError("Ingen SENDINBLUE_API_KEY definierad i .env")

# Konfigurera SDK-konfigurationen
configuration = brevo_python.Configuration()
configuration.api_key['api-key'] = API_KEY

def sanity_check():
    """
    Enkel kontroll för att se om vi kan nå Brevo API och hämta konto-info.
    Kör: python app/services/email_service.py
    """
    try:
        api_client = brevo_python.ApiClient(configuration)
        account_api = brevo_python.AccountApi(api_client)
        account_info = account_api.get_account()
        print("✅ Brevo API nåbart. Företagsnamn:", account_info.company_name)
    except ApiException as e:
        print("❌ Kunde inte nå Brevo-API:", e)

# Möjlighet att köra sanity_check när filen exekveras direkt
if __name__ == "__main__":
    sanity_check()
