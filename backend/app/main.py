import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import admin, attempts, auth, content, payments, users
from .core.config import settings

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

app = FastAPI(title="Rulda API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(attempts.router)
app.include_router(content.router)
app.include_router(admin.router)
app.include_router(payments.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
