# Security Policy

The Sanskrit Next team takes the security of our compiler, runtime, package manager, and extension platform seriously. We welcome responsible security research and vulnerability reports.

---

## Supported Versions

Only the latest active major and maintenance releases receive official security updates and patches:

| Version | Supported | Notes |
| :--- | :--- | :--- |
| **2.0.x (Next)** | :white_check_mark: Yes | Active production development & compiler updates |
| **0.3.x (Legacy)**| :warning: Critical only | Archived branch `legacy/v0.3` (Node.js prototype) |
| **< 0.3.0** | :x: No | End of Life; please upgrade to Sanskrit Next 2.0 |

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

If you believe you have discovered a security vulnerability in the Sanskrit Next compiler, VM, package manager, or VS Code extension, please report it privately using one of the following methods:

1. **GitHub Private Vulnerability Reporting** *(Recommended)*:
   - Navigate to the [Security Advisories](https://github.com/SH20RAJ/sanskrit/security/advisories) tab of this repository.
   - Click **"Report a vulnerability"** to submit a confidential report.

2. **Email Disclosure**:
   - Send an email to **security@sanskrit-lang.org** or directly to the project maintainer at **shaswatraj@users.noreply.github.com**.
   - Include:
     - Description of the vulnerability and its potential impact.
     - Affected component(s) (`crates/sanskrit-vm`, `sanskrit-package`, CLI, or VS Code extension).
     - Minimal reproducible example or proof-of-concept (`.skt` code snippet or CLI command).
     - Proposed remediation or patch if available.

---

## Response Timeline & SLA

We follow coordinated vulnerability disclosure:

- **Initial Acknowledgment**: Within **48 hours** of receiving the report.
- **Triage & Assessment**: Within **5 business days**, confirming severity and scope.
- **Remediation & Patch**: A fix will be developed in a private repository/branch.
- **Public Disclosure**: Once the patch is released and users have had reasonable time to upgrade, a coordinated security advisory with CVE allocation (if applicable) will be published, crediting the reporter.

---

## Scope & Safe Harbor

We consider the following in scope for security vulnerability reports:
- Arbitrary code execution or memory corruption in the Bytecode VM.
- Sandbox escapes or path traversal vulnerabilities in the package manager.
- Command injection or unsafe argument interpolation in the CLI or VS Code extension.
- Malicious package spoofing or integrity check bypasses.

### Safe Harbor
If you conduct vulnerability research in good faith in accordance with this policy:
- We will not pursue legal action against you.
- We will work with you to understand and resolve the issue quickly.
- We will publicly recognize your contribution in our security advisories (unless you prefer anonymity).

Thank you for helping keep the Sanskrit Next ecosystem secure!
