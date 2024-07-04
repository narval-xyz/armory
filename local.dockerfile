# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory
WORKDIR /app

# Install make
RUN apt-get update && apt-get install -y make

# Install the OPA binary, which we'll need to actually run evals
RUN curl -L -o opa https://openpolicyagent.org/downloads/v0.64.1/opa_linux_amd64_static && \
  chmod 755 opa && \
  mv opa /usr/local/bin/opa && \
  opa version

COPY package*.json ./

COPY .npmrc ./

RUN npm ci

# Install nx globally
RUN npm add --global nx@latest

# Copy the local code to the container's workspace.
COPY packages ./packages
COPY apps ./apps
COPY Makefile ./
COPY nx.json ./
COPY tsconfig*.json ./

RUN make armory-sdk/build

RUN make policy-engine/db/generate-types
RUN make armory/db/generate-types
RUN make vault/db/generate-types

EXPOSE 3010

# Command to run the application
# CMD ["make", "policy-engine/start/dev"]
CMD ["tail", "-f", "/dev/null"]
