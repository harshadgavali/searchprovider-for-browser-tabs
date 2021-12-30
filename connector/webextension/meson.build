appAlphaNumId = '@0@.@1@'.format(base_id, exeName.replace('-', ''))


if get_option('home') == ''
    cmd = run_command('sh', '-c', 'echo $HOME')
    HOME_DIR = cmd.stdout().strip()
else
    HOME_DIR = get_option('home')
endif

subdir('chromium')
subdir('firefox')