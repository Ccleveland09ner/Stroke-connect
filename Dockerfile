# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_API_URL=
RUN npm run build

# Copy frontend to backend static
FROM node:20-alpine AS copier
WORKDIR /app
COPY --from=frontend-builder /app/dist ./dist
COPY backend ./backend
RUN mkdir -p backend/static && cp -r dist/* backend/static/

# Production: Python + Gunicorn
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY --from=copier /app/backend ./
EXPOSE 5000
ENV FLASK_ENV=production
CMD ["sh", "-c", "gunicorn -w 4 -b 0.0.0.0:${PORT:-5000} wsgi:app"]
