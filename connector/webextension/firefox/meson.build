# firefox
appdata_conf = configuration_data()
appdata_conf.set('appAlphaNumId', appAlphaNumId)
appdata_conf.set('connectorexepath', bindir / exeName)
output_file = '@0@.json'.format(appAlphaNumId)
configure_file(
    configuration: appdata_conf,
    input: '@0@.in'.format(output_file),
    output: output_file,
    install: true,
    install_dir: join_paths(HOME_DIR, '.mozilla/native-messaging-hosts/')
)