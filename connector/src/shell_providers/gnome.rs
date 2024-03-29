use std::collections::HashMap;

use zbus::dbus_interface;
use zvariant::{DeserializeDict, SerializeDict, TypeDict};

use crate::webextension::communication::{self, TabsResponseData};

#[derive(SerializeDict, DeserializeDict, TypeDict)]
struct TabResultMetaData {
    id: String,
    name: String,
    gicon: String,
    description: String,
}

trait GnomeSearchProvider {
    fn get_initial_result_set(&mut self, terms: Vec<String>) -> Vec<String>;
    fn get_subsearch_result_set(
        &self,
        previous_results: Vec<String>,
        terms: Vec<String>,
    ) -> Vec<String>;

    fn get_result_metas(&self, tab_ids: Vec<String>) -> Vec<TabResultMetaData>;
    fn activate_result(&self, tab_id: String, terms: Vec<String>, timestamp: u32);
    fn launch_search(&self, terms: Vec<String>, timestamp: u32);
}

pub struct WebSearchProvider {
    pub name: String,
    gicon: String,
    tabs: HashMap<u64, TabsResponseData>,
}

impl WebSearchProvider {
    pub fn new(name: &str, gicon: &str) -> Self {
        WebSearchProvider {
            name: name.into(),
            gicon: gicon.into(),
            tabs: HashMap::new(),
        }
    }

    pub fn get_app_name(&self) -> String {
        self.name.clone()
    }

    fn get_tab(&self, id: &str) -> Option<&TabsResponseData> {
        let id: Option<u64> = match id.parse() {
            Ok(v) => Some(v),
            Err(_) => None,
        };

        match id {
            Some(id) => self.tabs.get(&id),
            None => None,
        }
    }
}

fn get_string_match_score(text: &str, normalized_terms: &[String]) -> i32 {
    let text = text.to_lowercase();
    normalized_terms
        .iter()
        .map(|term| text.to_lowercase().contains(term) as i32)
        .sum()
}

fn filter_tabs(tabs: Vec<&TabsResponseData>, terms: &[String], app_name: &str) -> Vec<String> {
    let terms: Vec<String> = terms.iter().map(|term| term.to_lowercase()).collect();

    let common_score =
        get_string_match_score(app_name, &terms) + get_string_match_score("tabs", &terms);

    let mut tab_score = HashMap::<u64, i32>::new();
    for tab in &tabs {
        let score = common_score
            + get_string_match_score(tab.title.as_str(), &terms) * 2
            + get_string_match_score(tab.url.as_str(), &terms);

        tab_score.insert(tab.id, score);
    }

    let threshold = 0; // threshold scroe

    let mut tabs = tabs
        .into_iter()
        .filter(|tab| tab_score.get(&tab.id).unwrap_or(&threshold) > &threshold)
        .collect::<Vec<&TabsResponseData>>();
    tabs.sort_by_cached_key(|tab| tab_score.get(&tab.id).unwrap_or(&threshold));
    tabs.into_iter()
        .rev() // reverse sorting to have tabs with more match score at beginning
        .map(|tab| tab.id.to_string())
        .collect()
}

#[dbus_interface(name = "org.gnome.Shell.SearchProvider2")]
impl GnomeSearchProvider for WebSearchProvider {
    fn get_initial_result_set(&mut self, terms: Vec<String>) -> Vec<String> {
        self.tabs.clear();
        for tab in communication::get_tabs() {
            self.tabs.insert(tab.id, tab);
        }
        let tabs = self.tabs.values().collect();
        filter_tabs(tabs, &terms, self.name.as_str())
    }

    fn get_subsearch_result_set(
        &self,
        _previous_results: Vec<String>,
        terms: Vec<String>,
    ) -> Vec<String> {
        let tabs = self.tabs.values().collect();
        filter_tabs(tabs, &terms, self.name.as_str())
    }

    fn get_result_metas(&self, tab_ids: Vec<String>) -> Vec<TabResultMetaData> {
        tab_ids
            .iter()
            .filter_map(|id| self.get_tab(id))
            .map(|tab| TabResultMetaData {
                id: tab.id.to_string(),
                name: tab.title.clone(),
                gicon: self.gicon.clone(),
                description: tab.url.clone(),
            })
            .collect()
    }

    fn activate_result(&self, tab_id: String, _terms: Vec<String>, _timestamp: u32) {
        if let Ok(id) = tab_id.parse() {
            if self.tabs.contains_key(&id) {
                communication::activate_tab(id);
            }
        }
    }

    fn launch_search(&self, _terms: Vec<String>, _timestamp: u32) {
        // todo!()
    }
}
