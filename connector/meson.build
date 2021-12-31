project('tabsearchproviderconnector', 'rust',
          version: '0.1.0',
    meson_version: '>= 0.59.0',
  default_options: [ 'warning_level=2',
                   ],
)
prefix = get_option('prefix')
libdir = prefix / get_option('libdir')
bindir = prefix / get_option('bindir')
datadir = prefix / get_option('datadir')

domain_name = 'com.github.harshadgavali'
app_id = '@0@.@1@'.format(domain_name, meson.project_name())

cargo_sources = files(
  'Cargo.toml',
  'Cargo.lock',
)

subdir('src')
subdir('manifests')