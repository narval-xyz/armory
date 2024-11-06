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
    rm -rf apps/ && rm -rf packages/

FROM node:21-slim as final

WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y openssl && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set up DB migration capability
COPY apps/vault/src/shared/module/persistence/schema ./schema
COPY ./deploy/db-migrator.sh .
RUN chmod +x ./db-migrator.sh

# Copy built application, which includes a pruned package.json
# Then install just the dependencies we need for that.
COPY --from=build /usr/src/app/dist ./dist
RUN npm ci --prefix ./dist/apps/vault --only=production
COPY --from=build /usr/src/app/node_modules/@prisma/client/vault ./dist/apps/vault/node_modules/@prisma/client/vault

ENV NODE_ENV=production
ENV PORT=3011

EXPOSE 3011
CMD ["node", "dist/apps/vault/main.js"]

