%global debug_package       %{nil}
%global gitrepo_name        searchprovider-for-browser-tabs
%global subpackage_name     connector
%global tarball_version     %{subpackage_name}-v%%(echo %{version} | tr '~' '-')

Name:           tabsearchproviderconnector
Version:        0.1.1
Release:        1%{?dist}
Summary:        Browser tab search provider for GNOME

License:        MIT
URL:            https://github.com/harshadgavali/%{gitrepo_name}
Source0:        %{url}/archive/refs/tags/%{tarball_version}.tar.gz

BuildRequires:  cargo >= 1.39
BuildRequires:  meson >= 0.59.0
BuildRequires:  rust >= 1.39

Requires:       dbus-daemon

%description
Host connector for browser tab search provider for GNOME
See ${url} for information for installing shell and browser extension

%prep
%autosetup -v -n %{gitrepo_name}-%{tarball_version}/%{subpackage_name}

%build
%meson --buildtype=release
%meson_build

%install
%meson_install
strip --strip-all %{buildroot}%{_bindir}/*

%files
%{_prefix}/bin/*%{name}
%{_sysconfdir}/opt/chrome/native-messaging-hosts/*%{name}.json
%{_prefix}/lib64/mozilla/native-messaging-hosts/*%{name}.json

%changelog
