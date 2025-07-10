# backend/app/api/admin/__init__.py

# from .admin import router as admin_router
from .users import router as users_router
from .vehicles import router as vehicles_router
from .settings import router as settings_router
from .webhooks import router as webhooks_router
from .interest import router as interest_router
from .subscription import router as subscription_router
from .insights import router as insights_router
from .finance import router as finance_router

routers = [
    # admin_router,
    users_router,
    vehicles_router,
    settings_router,
    webhooks_router,
    interest_router,
    subscription_router,
    insights_router,
    finance_router,
]
