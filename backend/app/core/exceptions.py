from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(self, detail: str, code: str, status_code: int = 400) -> None:
        self.detail = detail
        self.code = code
        self.status_code = status_code


def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail, "code": exc.code})
