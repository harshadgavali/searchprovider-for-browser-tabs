declare module "gi://Clutter" {
    export * from '@gi-types/clutter8';
}
declare module "gi://Meta" {
    export * from '@gi-types/meta8';
}

declare module "gi://St" {
    export * from '@gi-types/st1';
}

declare module "gi://Shell" {
    export * from '@gi-types/shell0';
}

declare interface GjsGiImports {
    Clutter: typeof import("@gi-types/clutter8"),
    Meta: typeof import("@gi-types/meta8"),
    St: typeof import("@gi-types/st1"),
    Shell: typeof import("@gi-types/shell0"),
}