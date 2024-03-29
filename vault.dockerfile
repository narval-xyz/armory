FROM node:21

# Set the working directory
WORKDIR /usr/src/app

COPY package*.json ./

# Copy the local code to the container's workspace.
COPY . .

RUN npm install
RUN make vault/db/generate-types
RUN make vault/build/script

COPY apps/vault/.env .env

EXPOSE 3011

CMD npx dotenv -e apps/vault/.env -- node dist/apps/vault/main.js
