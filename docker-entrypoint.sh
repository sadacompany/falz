#!/bin/sh
set -e

echo "📁 Ensuring persistent uploads directory permissions..."
mkdir -p /app/public/uploads/properties /app/public/uploads/avatars /app/public/uploads/documents
chmod -R 777 /app/public/uploads || true

echo "🚀 Syncing database schema with Prisma..."
npx prisma db push --skip-generate || echo "⚠️ Prisma db push returned non-zero exit code, continuing..."

echo "🌱 Seeding initial database records..."
npx prisma db seed || echo "⚠️ Prisma db seed returned non-zero exit code, continuing..."

echo "✅ Database preparation complete. Starting Next.js standalone server..."
exec node server.js
