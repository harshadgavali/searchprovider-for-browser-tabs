# flatpaked chromium
appdata_conf = configuration_data()
appdata_conf.set('appAlphaNumId', appAlphaNumId)
appdata_conf.set('connectorexepath', HOME_DIR / '.local/bin/flatpak-sp-connector')
output_file = '@0@.json'.format(appAlphaNumId)
configure_file(
    configuration: appdata_conf,
    input: '@0@.in'.format(output_file),
    output: output_file,
    install: true,
    install_dir: join_paths(HOME_DIR, '.var/app/org.chromium.Chromium/config/chromium/NativeMessagingHosts/')
)