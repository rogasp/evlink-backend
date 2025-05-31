"""
app/logger.py

Centralized logger configuration for EVLink backend.
"""
import logging
import logging.config

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d - %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
            "level": "INFO",
            "stream": "ext://sys.stdout"
        }
    },
    "loggers": {
        # Suppress noisy libraries
        "httpx": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False
        },
        "uvicorn.access": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False
        },
        "uvicorn.error": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False
        }
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO"
    }
}

# Apply the logging configuration
logging.config.dictConfig(LOGGING_CONFIG)

# Provide a module-level logger for use in other modules
logger = logging.getLogger(__name__)
