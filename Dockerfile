# First stage: compile things.
FROM node:lts-alpine AS complier
RUN apk add python3 make g++
WORKDIR /usr/src/app

# (Install OS dependencies; include -dev packages if needed.)

# Install the Javascript dependencies, including all devDependencies.
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install

# Copy the rest of the application in and build it.
COPY . .
# RUN npm build
RUN npm run build

# Now /usr/src/app/dist has the built files.

# Second stage: run things.
FROM node:lts-alpine AS builder
WORKDIR /usr/src/app

# (Install OS dependencies; just libraries.)

# Install the Javascript dependencies, only runtime libraries.
COPY ["package.json", "package-lock.json*", "./"]
RUN apk add python3 make g++
RUN npm install --omit=dev

# Copy the dist tree from the first stage.
COPY --from=complier /usr/src/app/dist dist

FROM node:lts-alpine
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist dist
COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=builder /usr/src/app/package.json package.json
COPY --from=builder /usr/src/app/package-lock.json package-lock.json

# Run the built application when the container starts.
EXPOSE 4000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]