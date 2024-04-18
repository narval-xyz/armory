FROM node:21 as build

# Set the working directory
WORKDIR /usr/src/app

COPY package*.json ./

# Copy the local code to the container's workspace.
COPY node_modules ./node_modules
COPY packages ./packages
COPY apps ./apps
COPY Makefile ./
COPY nx.json ./
COPY tsconfig*.json ./

# NOTE: This expects the .npmrc file to be passed as a build secret
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install

RUN make vault/db/generate-types && \
    make vault/build/script && \
    rm -rf src/

FROM node:21 as final

COPY --from=build /usr/src/app .

EXPOSE 3011

CMD node dist/out-tsc/apps/vault/src/main.js

