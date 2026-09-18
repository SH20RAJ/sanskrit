use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    pub package: PackageConfig,
    #[serde(default)]
    pub dependencies: HashMap<String, DependencyConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageConfig {
    pub name: String,
    pub version: String,
    #[serde(default)]
    pub authors: Vec<String>,
    #[serde(default = "default_edition")]
    pub edition: String,
}

fn default_edition() -> String {
    "2026".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyConfig {
    pub version: Option<String>,
    pub git: Option<String>,
    pub path: Option<String>,
}

pub fn create_project(name: &str, target_dir: &Path) -> Result<PathBuf, String> {
    let proj_dir = target_dir.join(name);
    if proj_dir.exists() {
        return Err(format!("Directory '{}' already exists", proj_dir.display()));
    }

    fs::create_dir_all(proj_dir.join("src")).map_err(|e| e.to_string())?;
    fs::create_dir_all(proj_dir.join("tests")).map_err(|e| e.to_string())?;
    fs::create_dir_all(proj_dir.join("benches")).map_err(|e| e.to_string())?;
    fs::create_dir_all(proj_dir.join("examples")).map_err(|e| e.to_string())?;

    let manifest_content = format!(
r#"[package]
name = "{}"
version = "0.1.0"
authors = ["Sanskrit Developer"]
edition = "2026"

[dependencies]
"#,
        name
    );
    fs::write(proj_dir.join("Sanskrit.toml"), manifest_content).map_err(|e| e.to_string())?;

    let main_skt = r#"// Sanskrit Next Entry Point
कार्य मुख्य():
    मुद्रण("नमस्ते, संस्कृत विश्वम्! Welcome to Sanskrit Next.")
"#;
    fs::write(proj_dir.join("src/main.skt"), main_skt).map_err(|e| e.to_string())?;

    let gitignore = r#"target/
.sanskrit/
*.lock
"#;
    fs::write(proj_dir.join(".gitignore"), gitignore).map_err(|e| e.to_string())?;

    Ok(proj_dir)
}

pub fn load_manifest(dir: &Path) -> Result<Manifest, String> {
    let manifest_path = dir.join("Sanskrit.toml");
    if !manifest_path.exists() {
        return Err(format!("Could not find Sanskrit.toml in {}", dir.display()));
    }
    let content = fs::read_to_string(&manifest_path).map_err(|e| e.to_string())?;
    let manifest: Manifest = toml::from_str(&content).map_err(|e| format!("Invalid Sanskrit.toml: {}", e))?;
    Ok(manifest)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_manifest_deserialization() {
        let toml_str = r#"
        [package]
        name = "test_ai"
        version = "1.0.0"
        "#;
        let manifest: Manifest = toml::from_str(toml_str).unwrap();
        assert_eq!(manifest.package.name, "test_ai");
        assert_eq!(manifest.package.edition, "2026");
    }
}
