use serde::{de::DeserializeOwned, Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use zvariant::Type;

use super::native_messaging;

#[derive(Serialize, Deserialize)]
struct ActivateTabRequestData {
    id: u64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
enum Routes {
    // History,
    Tabs,
    Tab,
}

#[derive(Serialize, Deserialize)]
struct RequestData<T: Serialize> {
    route: Routes,
    data: Option<T>,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[allow(clippy::upper_case_acronyms)]
enum Request<T: Serialize> {
    GET(RequestData<T>),
    POST(RequestData<T>),
}

#[derive(Serialize, Deserialize, Type, Default, Debug)]
#[serde(default)]
pub struct TabsResponseData {
    pub id: u64,
    pub title: String,
    pub url: String,
}

#[derive(Serialize_repr, Deserialize_repr)]
#[repr(u16)]
enum ResponseStatus {
    Ok = 200,
    NotFound = 404,
}

#[derive(Serialize, Deserialize)]
struct Response<T> {
    status: ResponseStatus,
    data: T,
}

fn read_vec_data<T: Serialize, R: DeserializeOwned + Serialize>(req: &Request<T>) -> Vec<R> {
    if native_messaging::write_output(std::io::stdout(), &req).is_err() {
        return vec![];
    }

    let response =
        native_messaging::read_input::<Response<Vec<R>>, std::io::Stdin>(std::io::stdin());

    match response {
        Ok(response) => response.data,
        Err(_) => vec![],
    }
}

pub fn get_tabs() -> Vec<TabsResponseData> {
    let req = Request::GET(RequestData::<String> {
        route: Routes::Tabs,
        data: None,
    });
    read_vec_data(&req)
}

pub fn activate_tab(id: u64) {
    let req = Request::POST(RequestData {
        route: Routes::Tab,
        data: Some(ActivateTabRequestData { id }),
    });
    if native_messaging::write_output(std::io::stdout(), &req).is_err() {}
}
