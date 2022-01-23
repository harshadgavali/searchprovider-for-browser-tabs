use std::env::args;
use zbus::{
    blocking::{fdo, Connection},
    fdo::RequestNameFlags,
};

mod shell_providers;
mod webextension;

use shell_providers::gnome::WebSearchProvider;

const EDGE_EXTENSIONS_IDS: &[&str] = &[
    "chrome-extension://oemddknfonbdjbdggoopmapgojnjdmjc/", // devel id, keeps changing depending on directory where code is
    "chrome-extension://pjidkdbbdemngigldodbdpkpggmgilnl/", // store id
];

const VERSION: Option<&str> = option_env!("CARGO_PKG_VERSION");
const COMMIT: Option<&str> = option_env!("GIT_HEAD_SHA");

fn start_dbus_server(greeter: WebSearchProvider) -> zbus::Result<()> {
    let app_id = format!(
        "com.github.harshadgavali.SearchProvider.{}",
        greeter.get_app_name()
    );
    let app_path = format!(
        "/com/github/harshadgavali/SearchProvider/{}",
        greeter.get_app_name()
    );

    let connection = Connection::session()?;
    let dbus_proxy = fdo::DBusProxy::new(&connection)?;
    connection.object_server().at(app_path, greeter)?;
    dbus_proxy.request_name(
        app_id.try_into()?,
        RequestNameFlags::AllowReplacement | RequestNameFlags::ReplaceExisting,
    )?;

    if (dbus_proxy.receive_name_lost()?).next().is_some() {
        return Ok(());
    }

    Ok(())
}

fn print_help(args: &[String]) {
    println!(
        "You weren't supposed to do that!\n\
        This executable should be started by browser not by users.\n\
        Unknown arguments: {:}\n\
        Supported arguments:\n\
        \t--version\tdisplay version information\n",
        &args[1..args.len()].join(" ")
    );
}

fn print_version() {
    println!("version: {}", VERSION.unwrap_or("unknown"));
    if let Some(commit) = COMMIT {
        println!("commit: {}", commit)
    }
}

fn main() -> zbus::Result<()> {
    let args: Vec<String> = args().collect();

    match args.len() {
        3 => start_dbus_server(WebSearchProvider::new("Firefox", "firefox"))?,

        2 => match args[1].as_str() {
            "--version" => print_version(),
            "--help" => print_help(&args),
            extension_id => {
                if EDGE_EXTENSIONS_IDS.contains(&extension_id) {
                    start_dbus_server(WebSearchProvider::new("Edge", "microsoft-edge"))?
                } else {
                    start_dbus_server(WebSearchProvider::new("Chromium", "org.chromium.Chromium"))?
                }
            }
        },

        _ => print_help(&args),
    };

    Ok(())
}
