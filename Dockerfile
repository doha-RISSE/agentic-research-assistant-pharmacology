FROM node:24-alpine AS frontend-build

WORKDIR /web
COPY web/package.json ./
COPY web/package-lock.json ./
RUN npm ci
COPY web ./
RUN npm run build

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app
COPY pyproject.toml ./
COPY app ./app
RUN pip install --no-cache-dir .
COPY --from=frontend-build /frontend ./frontend
COPY corpus ./corpus
COPY chunks.jsonl ./chunks.jsonl

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
