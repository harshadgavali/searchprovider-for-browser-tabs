BUILDDIR=build

all: 

install: clean
	ninja -C ${BUILDDIR} install

setup:
	meson --prefix ${HOME}/.local \
		 -Drelease-bindir=${HOME}/.local/bin \
		 -Dflatpak-chromium=true \
		 --buildtype=release \
		 ${BUILDDIR}

clean:
	ninja -C ${BUILDDIR} clean 

meson-wipe:
	rm -r './${BUILDDIR}/'
	