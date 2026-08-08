#!/bin/sh
set -e

echo "🚀 Syncing database schema with Prisma..."
npx prisma db push --skip-generate || echo "⚠️ Prisma db push returned non-zero exit code, continuing..."

echo "🌱 Seeding initial database records..."
npx prisma db seed || echo "⚠️ Prisma db seed returned non-zero exit code, continuing..."

echo "✅ Database preparation complete. Starting Next.js standalone server..."
exec node server.js
