use colored::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Span {
    pub start: usize,
    pub end: usize,
    pub line: usize,
    pub column: usize,
}

impl Span {
    pub fn new(start: usize, end: usize, line: usize, column: usize) -> Self {
        Self {
            start,
            end,
            line,
            column,
        }
    }

    pub fn dummy() -> Self {
        Self {
            start: 0,
            end: 0,
            line: 1,
            column: 1,
        }
    }

    pub fn merge(&self, other: &Span) -> Self {
        Self {
            start: self.start.min(other.start),
            end: self.end.max(other.end),
            line: self.line.min(other.line),
            column: self.column,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiagnosticLevel {
    Error,
    Warning,
    Note,
    Help,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticLabel {
    pub span: Span,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Diagnostic {
    pub level: DiagnosticLevel,
    pub code: Option<String>,
    pub message: String,
    pub primary_span: Option<Span>,
    pub labels: Vec<DiagnosticLabel>,
    pub notes: Vec<String>,
    pub help: Option<String>,
}

impl Diagnostic {
    pub fn error(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            level: DiagnosticLevel::Error,
            code: Some(code.into()),
            message: message.into(),
            primary_span: None,
            labels: Vec::new(),
            notes: Vec::new(),
            help: None,
        }
    }

    pub fn warning(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            level: DiagnosticLevel::Warning,
            code: Some(code.into()),
            message: message.into(),
            primary_span: None,
            labels: Vec::new(),
            notes: Vec::new(),
            help: None,
        }
    }

    pub fn with_span(mut self, span: Span) -> Self {
        self.primary_span = Some(span);
        self
    }

    pub fn with_label(mut self, span: Span, message: impl Into<String>) -> Self {
        self.labels.push(DiagnosticLabel {
            span,
            message: message.into(),
        });
        self
    }

    pub fn with_note(mut self, note: impl Into<String>) -> Self {
        self.notes.push(note.into());
        self
    }

    pub fn with_help(mut self, help: impl Into<String>) -> Self {
        self.help = Some(help.into());
        self
    }

    pub fn render_terminal(&self, source: &str, file_name: &str) -> String {
        let mut out = String::new();
        let code_str = self.code.as_deref().unwrap_or("S0000");

        let header = match self.level {
            DiagnosticLevel::Error => format!("error[{}]", code_str).red().bold(),
            DiagnosticLevel::Warning => format!("warning[{}]", code_str).yellow().bold(),
            DiagnosticLevel::Note => "note".cyan().bold(),
            DiagnosticLevel::Help => "help".green().bold(),
        };

        out.push_str(&format!("{}: {}\n", header, self.message.bold()));

        if let Some(span) = self.primary_span {
            out.push_str(&format!(
                "  {} {}:{}:{}\n",
                "-->".blue().bold(),
                file_name,
                span.line,
                span.column
            ));

            let lines: Vec<&str> = source.lines().collect();
            if span.line > 0 && span.line <= lines.len() {
                let line_str = lines[span.line - 1];
                let line_num_str = format!("{}", span.line);
                let padding = " ".repeat(line_num_str.len());

                out.push_str(&format!(" {} {}\n", padding, "|".blue().bold()));
                out.push_str(&format!(
                    " {} {} {}\n",
                    line_num_str.blue().bold(),
                    "|".blue().bold(),
                    line_str
                ));

                let col_offset = span.column.saturating_sub(1);
                let width = if span.end > span.start {
                    (span.end - span.start).max(1)
                } else {
                    1
                };
                let carets = "^".repeat(width);

                out.push_str(&format!(
                    " {} {} {}{}\n",
                    padding,
                    "|".blue().bold(),
                    " ".repeat(col_offset),
                    carets.red().bold()
                ));
            }
        }

        for label in &self.labels {
            out.push_str(&format!(
                "  {} {}: {}\n",
                "::".blue().bold(),
                "label".cyan(),
                label.message
            ));
        }

        for note in &self.notes {
            out.push_str(&format!(
                "  {} {}: {}\n",
                "=".blue().bold(),
                "note".cyan().bold(),
                note
            ));
        }

        if let Some(help) = &self.help {
            out.push_str(&format!(
                "  {} {}: {}\n",
                "=".blue().bold(),
                "help".green().bold(),
                help
            ));
        }

        out
    }

    pub fn to_json(&self) -> String {
        serde_json::to_string(self).unwrap_or_else(|_| "{}".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diagnostic_rendering() {
        let source = "मान x = 42 + \"text\"\n";
        let span = Span::new(13, 19, 1, 14);
        let diag = Diagnostic::error("S1007", "cannot add Int and String")
            .with_span(span)
            .with_help("convert the value explicitly if that was intended");

        let rendered = diag.render_terminal(source, "main.skt");
        assert!(rendered.contains("error[S1007]"));
        assert!(rendered.contains("cannot add Int and String"));
        assert!(rendered.contains("main.skt:1:14"));
    }
}
