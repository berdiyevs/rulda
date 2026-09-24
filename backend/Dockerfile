FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    SEED_DATA_DIR=/app/seed_data

WORKDIR /app

# psycopg[binary] va bcrypt tayyor wheel bilan keladi, gcc/libpq-dev kerak emas.
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Konteyner root bo'lmagan foydalanuvchi nomidan ishlaydi.
RUN useradd --create-home --uid 1000 app && chown -R app:app /app
USER app

# --proxy-headers: Heroku proxy ortida mijozning haqiqiy IP'si (rate limit uchun) va https sxemasi.
CMD ["sh", "-c", "alembic upgrade head && python -m app.db.seed && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*' --workers ${WEB_CONCURRENCY:-2}"]
