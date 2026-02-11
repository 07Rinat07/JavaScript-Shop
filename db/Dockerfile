ARG POSTGRES_IMAGE=postgres:16-alpine
FROM ${POSTGRES_IMAGE}

COPY database.sql /docker-entrypoint-initdb.d/001-seed.sql

# Normalize Windows CRLF endings to LF so COPY ... FROM STDIN markers are parsed correctly.
RUN sed -i 's/\r$//' /docker-entrypoint-initdb.d/001-seed.sql
