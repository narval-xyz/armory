FROM node:21 as build

# Set the working directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./

RUN npm ci && npm cache clean --force

# Copy the local code to the container's workspace.
COPY packages ./packages
COPY apps ./apps
COPY Makefile ./
COPY nx.json ./
COPY tsconfig*.json ./

RUN make vault/db/generate-types && \
    make vault/build && \
    rm -rf src/

FROM node:21 as final

COPY --from=build /usr/src/app .

EXPOSE 3011

CMD ["node", "dist/apps/vault/main.js"]

