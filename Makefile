install: install-deps

install-deps:
	npm ci

start:
	DEBUG="http" DEBUG_COLORS=true npm start

lint:
	npx eslint .

fix:
	npx eslint --fix .

test:
	npm test -s

cover:
	npm test -- --coverage --coverageProvider=v8

.PHONY: test