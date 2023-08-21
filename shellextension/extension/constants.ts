const DOMAIN_NAME = 'com.github.harshadgavali';
export const DBUS_BASE_ID = `${DOMAIN_NAME}.SearchProvider`;
export const EXENAME = `${DOMAIN_NAME}.tabsearchproviderconnector`;

export enum SettingKeys {
    ExcludeSlash = 'exclude-forward-slash',
    MinTermLength = 'min-term-length',
}

export const SettingValues = {
    ExcludeSlash: true,
    MinTermLength: 2,
};