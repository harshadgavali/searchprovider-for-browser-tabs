use std::env::args;
use zbus::{
    blocking::{fdo, Connection},
    fdo::RequestNameFlags,
};

mod shell_providers;
mod webextension;

use shell_providers::gnome::WebSearchProvider;

fn start_dbus_server(greeter: WebSearchProvider) -> zbus::Result<()> {
    let done_listener = event_listener::Event::new().listen();

    let app_id = format!("org.me.SearchProvider.{}", greeter.get_app_name());
    let app_path = format!("/org/me/SearchProvider/{}", greeter.get_app_name());

    let connection = Connection::session()?;
    let dbus_proxy = fdo::DBusProxy::new(&connection)?;
    connection.object_server().at(app_path, greeter)?;
    dbus_proxy.request_name(
        app_id.try_into()?,
        RequestNameFlags::AllowReplacement | RequestNameFlags::ReplaceExisting,
    )?;

    for _ in dbus_proxy.receive_name_lost()? {
        return Ok(());
    }

    done_listener.wait();
    Ok(())
}

fn main() -> zbus::Result<()> {
    // let args: Vec<String> = args().collect();

    match args().count() {
        3 => {
            start_dbus_server(WebSearchProvider::new("Firefox", "firefox"))?;
        }

        _ => {
            start_dbus_server(WebSearchProvider::new("Chromium", "org.chromium.Chromium"))?;
        }
    };

    Ok(())
}
