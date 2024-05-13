#!/bin/bash

# This script is designed to be used inside a Docker image for an application in order to deploy migrations that go along with a specific build.
# We use separate db variables rather than a single connection string because the migration might be a password that is auto-generated & rotated in AWS Secrets Manager so we only receive it injected as an individual var.

if [ -z "${APP_DATABASE_USERNAME}" ]; then
    echo "Warning: APP_DATABASE_USERNAME is not set. Exiting."
    exit 1
fi

if [ -z "${APP_DATABASE_PASSWORD}" ]; then
    echo "Warning: APP_DATABASE_PASSWORD is not set. Exiting."
    exit 1
fi

if [ -z "${APP_DATABASE_HOST}" ]; then
    echo "Warning: APP_DATABASE_HOST is not set. Exiting."
    exit 1
fi

if [ -z "${APP_DATABASE_PORT}" ]; then
    echo "Warning: APP_DATABASE_PORT is not set. Exiting."
    exit 1
fi

if [ -z "${APP_DATABASE_NAME}" ]; then
    echo "Warning: APP_DATABASE_NAME is not set. Exiting."
    exit 1
fi

rawurlencode() {
  local string="${1}"
  local strlen=${#string}
  local encoded=""
  local pos c o

  for (( pos=0 ; pos<strlen ; pos++ )); do
     c=${string:$pos:1}
     case "$c" in
        [-_.~a-zA-Z0-9] ) o="${c}" ;;
        * )               printf -v o '%%%02x' "'$c"
     esac
     encoded+="${o}"
  done
  echo "${encoded}"
}

encoded_password=$(rawurlencode "$APP_DATABASE_PASSWORD")

export APP_DATABASE_URL="postgresql://${APP_DATABASE_USERNAME}:${encoded_password}@${APP_DATABASE_HOST}:${APP_DATABASE_PORT}/${APP_DATABASE_NAME}?schema=public"

npx prisma migrate deploy --schema ./schema/schema.prisma