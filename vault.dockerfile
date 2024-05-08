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

FROM node:21 as final

WORKDIR /usr/src/app

# Copy built application and node_modules
# We need node_modules to run the application and it's more efficient to copy the whole thing from the previous step
# rather than installing it again, even though this includes devDependencies b/c it can use the cache to speed up builds unless deps change.
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

EXPOSE 3011

CMD ["node", "dist/apps/vault/main.js"]

