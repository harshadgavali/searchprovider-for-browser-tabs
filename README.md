# What is this ?
This is repository for package which providers browser tab search provider for [GNOME](https://www.gnome.org/)

## Installation
### browser extension
Install from respective browser addons store
### host connector
**Dependencies**: meson, ninja, cargo, rust

```
cd connector
meson --prefix=/usr build
ninja -C build install
```

#### If you installed browser addons in different way
* Then update manifest in following locations 
with ids of browser addons
* /etc/opt/chrome/native-messaging-hosts/
* /usr/lib64/mozilla/native-messaging-hosts/

### shellextension
```
cd shellextension
yarn
yarn build
yarn extension:install
```

* After installing all 3 components restart your system
* Then enable shell extension and open browser
* Start searching with `Super` keys
  * Browser tabs(except active tabs) will appear in search results