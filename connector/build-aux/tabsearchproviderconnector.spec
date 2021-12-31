%global debug_package %{nil}

Name:           tabsearchproviderconnector
Version:	0.1.0
Release:        1%{?dist}
Summary:        A simple hello script

License:        MIT
#URL:            
Source0:        %{name}-%{version}.tar.gz


#BuildRequires:  
BuildRequires: cargo >= 1.39
BuildRequires: meson
BuildRequires: rust >= 1.39

Requires:      gnome-shell

%description
A demo RPM build

%prep
%setup -q
#autosetup

%build
%meson
%meson_build

%install
%meson_install
strip --strip-all %{buildroot}%{_bindir}/*

%files
%{_prefix}/*
%{_sysconfdir}/*

%changelog
