##################
# BUILD BASE IMAGE
##################

FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

#############################
# BUILD FOR LOCAL DEVELOPMENT
#############################

FROM base AS development
WORKDIR /app
RUN chown -R node:node /app

# Install all dependencies (including devDependencies)
RUN npm install --force
COPY . .

# Use the node user from the image (instead of the root user)
USER node

FROM base AS builder
WORKDIR /app

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node --from=development /app/src ./src
COPY --chown=node:node --from=development /app/tsconfig.json ./tsconfig.json
COPY --chown=node:node --from=development /app/tsconfig.build.json ./tsconfig.build.json
COPY --chown=node:node --from=development /app/nest-cli.json ./nest-cli.json
COPY --chown=node:node --from=development /app/.env ./.env

RUN npm run build

# Removes unnecessary packages and re-install only production dependencies
ENV NODE_ENV=production
RUN npm ci --omit=dev

USER node

######################
# BUILD FOR PRODUCTION
######################

FROM node:22-alpine AS production
WORKDIR /app

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=builder /app/src/generated/i18n.generated.ts ./src/generated/i18n.generated.ts
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json ./
COPY --chown=node:node --from=builder /app/.env .env

USER node

# Start the server using the production build
CMD npm run migration:up && npm run start:prod