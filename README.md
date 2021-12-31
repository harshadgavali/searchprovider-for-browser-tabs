# What is this ?
This is repository provides browser tab search provider for [GNOME](https://www.gnome.org/)

# Installation
## Browser extension

<a href="https://addons.mozilla.org/en-US/firefox/addon/tab-search-provider-for-gnome/">
<img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" alt="Get for Firefox" width="200"/>
</a>

## Shell extension
<a href="https://extensions.gnome.org/extension/4733/browser-tabs/">
<img src="https://github.com/andyholmes/gnome-shell-extensions-badge/raw/master/get-it-on-ego.svg" alt="Get it on EGO" width="200" />
</a>

Or from source
```
cd shellextension
yarn
yarn build
yarn extension:install
```

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

#### If you installed browser addons in different way
* Then update manifest in following locations 
with ids of browser addons
  * /etc/opt/chrome/native-messaging-hosts/
  * /usr/lib64/mozilla/native-messaging-hosts/

#### After installation
* Oopen browser
* Start searching with `Super` key
  * Browser tabs(except active tabs) will appear in search results