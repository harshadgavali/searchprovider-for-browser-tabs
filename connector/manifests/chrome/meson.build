# chrome
appdata_conf = configuration_data()
appdata_conf.set('app_id', app_id)
appdata_conf.set('connectorexepath', release_bindir / app_id)
output_file = '@0@.json'.format(app_id)
configure_file(
    configuration: appdata_conf,
    input: 'manifest.json.in',
    output: output_file,
    install: true,
    install_dir:  get_option('sysconfdir') / 'opt/chrome/native-messaging-hosts/'
)
