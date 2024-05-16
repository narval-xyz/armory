# DB Migrator

`db-migrator.sh` is a script for running prisma db migrations within an application docker image.
Our goal is to

- Automate database migration in CI/CD; no manually performing sensitive database operations.
- Use gitops; git is our source-of-truth.
- Ensure we always run migrations before a new application version deploys.

Database migrations should all be done in a non-breaking method.

### TLDR

Include the `db-migrator.sh` and a few commands in your Docker image, then you run the migrations in a pre-install Helm hook before a new version deploys.

## Usage

To use this image, you can follow these steps:

1. Copy the schema/migrations & the migrator script in the final image

```dockerfile
# vault.dockerfile
# ...
FROM node:21 as final

# Copy the schema & the migrations
COPY apps/<path-to-prisma-schema-folder>/schema ./schema
COPY ./db-migrator.sh .
RUN chmod +x ./db-migrator.sh

```

2. Build the Docker image:

```bash
docker build -f vault.dockerfile -t armory/vault:latest .
```

or just use `vault/docker/build`

3. Run the container, overriding the default cmd. Include migrator db env variables:

```bash
docker run \
  -rm \
  -e APP_DATABASE_USERNAME="postgres" \
  -e APP_DATABASE_PASSWORD="your-password" \
  -e APP_DATABASE_HOST="host.docker.internal" \
  -e APP_DATABASE_PORT=5432 \
  -e APP_DATABASE_NAME="vault" \
  armory/vault /bin/bash ./db-migrator.sh
```

or just use `make vault/docker/migrate`

This will execute the migration script inside the container, which will run the database migrations using Prisma.

Note: Make sure you have the necessary Prisma schema files in the ./schema directory of your project before building the image.

### Adding the Migrator to your CD deployment

1. Create a `db-migration.yaml` file in your `templates` directory
2. Add the manifest below

```yaml
# db-migration.yaml
apiVersion: batch/v1
kind: Job
metadata:
  # job name should include a unix timestamp to make sure it's unique
  name: '{{ .Release.Name }}-migrate-{{ now | unixEpoch }}'
  labels:
    helm.sh/chart: '{{ .Chart.Name }}-{{ .Chart.Version }}'
  annotations:
    'helm.sh/hook': pre-install,pre-upgrade
    'helm.sh/hook-delete-policy': before-hook-creation,hook-succeeded
spec:
  template:
    metadata:
      name: '{{ .Release.Name }}-db-migration'
      labels:
        app.kubernetes.io/managed-by: { { .Release.Service | quote } }
        app.kubernetes.io/instance: { { .Release.Name | quote } }
        helm.sh/chart: '{{ .Chart.Name }}-{{ .Chart.Version }}'
    spec:
      restartPolicy: Never
      imagePullSecrets:
        - name: { { .Values.imagePullSecret } }
      containers:
        - name: '{{ .Chart.Name }}-db-migrator'
          image: '{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}'
          command: ['/bin/bash', '-c', './db-migrator.sh']
          env:
            - name: APP_DATABASE_USERNAME
              valueFrom:
                secretKeyRef:
                  name: { { .Values.database.username.secretKeyRef.name } }
                  key: { { .Values.database.username.secretKeyRef.key } }
            - name: APP_DATABASE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: { { .Values.database.password.secretKeyRef.name } }
                  key: { { .Values.database.password.secretKeyRef.key } }
            - name: APP_DATABASE_HOST
              value: '{{ .Values.database.host }}'
            - name: APP_DATABASE_PORT
              value: '{{ .Values.database.port }}'
            - name: APP_DATABASE_NAME
              value: '{{ .Values.database.databaseName }}'
```

3. Add the Values to your `values.yaml`; be aware that your database username/password should be managed in Secrets.

```yaml
# ... other values
database:
  username:
    secretKeyRef:
      name: db-master-credentials
      key: username
  password:
    secretKeyRef:
      name: db-master-credentials
      key: password
  host: armory-dev-db.caenfnzrkfmg.us-east-2.rds.amazonaws.com
  port: '5432'
  databaseName: vault_test
```

## ENV Variables

We use separate db variables rather than a single connection string, which is why we need the `db-migrator.sh` script to build the connection string.

- APP_DATABASE_USERNAME
- APP_DATABASE_PASSWORD
- APP_DATABASE_HOST
- APP_DATABASE_PORT
- APP_DATABASE_NAME

Why do we do this?

The Migrator will run with more privileged credentials than the App has at runtime. The credentials are generated dynamically by AWS directly into Secrets Manager (we never see them). RDS will also rotate the credentials. They store the credentials as individual username/password values. So that's it -- Prisma only accepts a full string, but RDS generates the password separately, and we want to use their built-in password rotation.
