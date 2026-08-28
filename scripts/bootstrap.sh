#!/bin/bash
set -euo pipefail

cp .dev.vars.example .dev.vars 2>/dev/null || true
cp .env.example .env

# Install dependencies
nub install --frozen-lockfile

# Run migrations
yes | nub run db:setup
