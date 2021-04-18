install: install-deps build

install-deps:
	npm install

start:
	DEBUG=app:* DEBUG_COLORS=true heroku local -f Procfile

start-backend sb:
	npx nodemon --exec npx babel-node server/bin/index.js

start-frontend sf:
	npx webpack serve

build:
	npm run build

db-migrate:
	npx knex migrate:latest

test:
	npm test

cover:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

fix:
	npx eslint --fix .

.PHONY: test start