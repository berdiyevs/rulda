from slowapi import Limiter
from slowapi.util import get_remote_address

# Mijoz IP'si uvicorn --proxy-headers orqali X-Forwarded-For'dan olinadi (Heroku/Netlify proxy ortida).
# Eslatma: xotirada saqlanadi, ya'ni har bir dyno/worker o'z hisobini yuritadi.
limiter = Limiter(key_func=get_remote_address)
