# What is this ?
This is repository for package which providers browser tab search provider for [GNOME](https://www.gnome.org/)

# Installation
## Browser extension
Install from respective browser addons store
* [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tab-search-provider-for-gnome/)
## Host connector
### For fedora
```
sudo dnf copr enable harshadgavali/searchproviders
sudo dnf install tabsearchproviderconnector
```

### From releases
* Download zip of latest release from [here](https://github.com/harshadgavali/searchprovider-for-browser-tabs/releases/)
```
sudo unzip -o -d / gnome-tabsearchprovider-connector.connector-*.zip
```

### From sources
**Dependencies**: meson, ninja, cargo, rust
```
cd connector
meson --prefix=/usr build
ninja -C build install
```

### If you installed browser addons in different way
* Then update manifest in following locations 
with ids of browser addons
* /etc/opt/chrome/native-messaging-hosts/
* /usr/lib64/mozilla/native-messaging-hosts/

## Shell extension
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