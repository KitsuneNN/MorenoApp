import os

# Los tests unitarios no abren conexión; esta URL permite cargar la configuración.
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://test:test@localhost:5432/test")
