project('searchprovider-connector', 'rust',
          version: '0.1.0',
    meson_version: '>= 0.59.0',
  default_options: [ 'warning_level=2',
                   ],
)
prefix = get_option('prefix')
bindir = prefix / get_option('bindir')
datadir = prefix / get_option('datadir')
exeName = meson.project_name()
base_id = 'org.me'

cargo_sources = files(
  'Cargo.toml',
  'Cargo.lock',
)

subdir('src')
subdir('webextension')