from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(self, detail: str, code: str, status_code: int = 400) -> None:
        self.detail = detail
        self.code = code
        self.status_code = status_code


def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail, "code": exc.code})


def _validation_field_name(loc: tuple) -> str:
    # Pydantic antepone el origen del dato ("body", "query", "path") al loc.
    parts = [str(part) for part in loc if part not in ("body", "query", "path")]
    return ".".join(parts) or "unknown"


def _validation_message(error: dict) -> str:
    message = str(error.get("msg", "Valor inválido"))
    # Los field_validator/model_validator de Pydantic anteponen "Value error, ".
    return message.removeprefix("Value error, ")


def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    # Uniforma los 422 de Pydantic con el formato de errores de negocio (D14):
    # {"detail": "...", "code": "VALIDATION_ERROR", "fields": [{field, message}]}
    fields = [
        {"field": _validation_field_name(error.get("loc", ())), "message": _validation_message(error)}
        for error in exc.errors()
    ]
    detail = f"{fields[0]['field']}: {fields[0]['message']}" if fields else "Datos inválidos."
    return JSONResponse(
        status_code=422,
        content={"detail": detail, "code": "VALIDATION_ERROR", "fields": fields},
    )
