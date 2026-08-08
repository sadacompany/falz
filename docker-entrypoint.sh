#!/bin/sh
set -e

echo "🚀 Running database schema sync and seed..."
npx prisma db push --skip-generate
npx prisma db seed

echo "✅ Database schema ready. Starting Next.js app..."
exec node server.js
