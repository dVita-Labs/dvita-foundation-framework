all: build

build: install
	npm run build

install: node_modules

node_modules: package.json
	npm install

start:
	npm run start

start-dev:
	npm run start --watch

test:
	npm run test

clean:
	-@rm -rf ./dist

distclean: clean
	-@rm -rf ./node_modules

.PHONY: all build install \
		start start-dev \
		test e2e \
		clean distclean

.SILENT: clean docker-clean distclean
