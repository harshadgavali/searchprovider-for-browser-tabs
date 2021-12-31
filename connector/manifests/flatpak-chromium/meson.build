if get_option('home') == ''
    cmd = run_command('sh', '-c', 'echo $HOME')
    HOME_DIR = cmd.stdout().strip()
else
    HOME_DIR = get_option('home')
endif

appdata_conf = configuration_data()
appdata_conf.set('connectorexepath', bindir / app_id)
local_exe_name = '@0@-flatpak-wrapper.sh'.format(app_id)
local_exe_dir = join_paths(HOME_DIR, '.local/bin')
configure_file(
    configuration: appdata_conf,
    input: 'flatpak-connector.sh.in',
    output: local_exe_name,
    install: true,
    install_dir: local_exe_dir
)

# chromium
appdata_conf = configuration_data()
appdata_conf.set('app_id', app_id)
appdata_conf.set('connectorexepath', join_paths(local_exe_dir, local_exe_name))
output_file = '@0@.json'.format(app_id)
configure_file(
    configuration: appdata_conf,
    input: 'manifest.json.in',
    output: output_file,
    install: true,
    install_dir: join_paths(HOME_DIR, '.var/app/org.chromium.Chromium/config/chromium/NativeMessagingHosts/')
)