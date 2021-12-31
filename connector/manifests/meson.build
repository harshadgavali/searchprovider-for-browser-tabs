release_bindir = bindir
if get_option('release-bindir') != ''
	release_bindir = get_option('release-bindir')
endif

subdir('chrome')
subdir('firefox')

if get_option('flatpak-chromium')
    subdir('flatpak-chromium')
endif
