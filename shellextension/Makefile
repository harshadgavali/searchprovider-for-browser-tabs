HOST_CMD_PREFIX=$(if ${FLATPAK_ID},flatpak-spawn --host,)
BUILDDIR=dist

all:

lint:
	yarn eslint 'extension/**/*.ts'

session: install
	${HOST_CMD_PREFIX} dbus-run-session gnome-shell --nested

install: pack
	${HOST_CMD_PREFIX} gnome-extensions install --force *.shell-extension.zip

pack: build 
	${HOST_CMD_PREFIX} gnome-extensions pack --force \
		--extra-source=constants.js --extra-source=imports.js \
		--extra-source=src ${BUILDDIR}

setup: package.json
	yarn

build: setup lint
	yarn tsc
	cp -r resources/* ${BUILDDIR}/
	yarn eslint --fix --no-inline-config --no-eslintrc -c .eslintrc.dist.yml 'dist/**/*.js'

clean:
	rm -r './${BUILDDIR}/'
