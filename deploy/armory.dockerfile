FROM node:20 as build

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

RUN make armory/db/generate-types && \
    make armory/build && \
    rm -rf apps/ && rm -rf packages/

FROM node:20 as final

WORKDIR /usr/src/app

# Set up DB migration capability
COPY apps/armory/src/shared/module/persistence/schema ./schema
COPY ./deploy/db-migrator.sh .
RUN chmod +x ./db-migrator.sh

# Copy built application and node_modules
# We need node_modules to run the application and it's more efficient to copy the whole thing from the previous step
# rather than installing it again, even though this includes devDependencies b/c it can use the cache to speed up builds unless deps change.
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

# Set the env variables that don't need to be changed outside this container.
ENV NODE_ENV=production
ENV PORT=3005
ENV RESOURCE_PATH=/usr/src/app/dist/apps/armory/resource

EXPOSE 3005
CMD ["node", "dist/apps/armory/main.js"]

