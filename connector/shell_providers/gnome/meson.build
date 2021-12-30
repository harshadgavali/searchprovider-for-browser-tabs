registerPath = datadir / 'gnome-shell/search-providers'

busBaseName = '@0@.SearchProvider'.format(base_id)

# firefox
appdata_conf = configuration_data()
appdata_conf.set('BusName', '@0@.Firefox'.format(busBaseName))
appdata_conf.set('ObjectPath', '/@0@/Firefox'.format(busBaseName.replace('.', '/')))
output_file = '@0@.Firefox.search-provider.ini'.format(busBaseName)
configure_file(
    configuration: appdata_conf,
    input: output_file,
    output: output_file,
    install: true,
    install_dir: registerPath
)

# chromium
appdata_conf = configuration_data()
appdata_conf.set('BusName', '@0@.Chromium'.format(busBaseName))
appdata_conf.set('ObjectPath', '/@0@/Chromium'.format(busBaseName.replace('.', '/')))
output_file = '@0@.Chromium.search-provider.ini'.format(busBaseName)
configure_file(
    configuration: appdata_conf,
    input: output_file,
    output: output_file,
    install: true,
    install_dir: registerPath
)