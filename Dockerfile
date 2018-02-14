FROM node:5
COPY package.json package.json
RUN npm i
COPY index.js index.js
COPY credentials.js credentials.js
ENTRYPOINT [ "node", "index.js" ]
