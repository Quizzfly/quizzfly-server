#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh db:5432
npm run migration:up
npm run seed:run
npm run start:prod
