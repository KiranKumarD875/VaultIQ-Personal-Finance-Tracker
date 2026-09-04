FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .

# NEXT_PUBLIC_* variables are baked into the client bundle at BUILD time
# (during `next build`), not at container runtime. Previously this was
# passed as a runtime `environment:` var in docker-compose, which silently
# never took effect. Accepting it as a build ARG fixes that.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]