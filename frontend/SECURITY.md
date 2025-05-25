# Security Policy

## Supported Versions

| Component | Supported Version                                      |
| --------- | ------------------------------------------------------ |
| EVLinkHA  | All active releases (see [CHANGELOG.md](CHANGELOG.md)) |
| FastAPI   | 0.100.x+                                               |
| Next.js   | 15.x                                                   |

## Reporting a Vulnerability

If you discover a security vulnerability in EVLinkHA, please report it as follows:

1. **Email**: Send an email to **[roger@evlinkha.se](mailto:roger@evlinkha.se)** with the subject **"\[SECURITY]\[EVLinkHA] Vulnerability Report"**.
2. **Include**:

   * A clear description of the issue.
   * Steps to reproduce (minimal example).
   * Impact assessment (e.g., data leakage, account takeover).
   * Any suggested remediation or patch.
3. **Response**: We aim to acknowledge all security reports within 48 hours and provide an estimated timeline for a fix.

## Security Vulnerability Response Process

1. **Acknowledge**: Within 48 hours of receiving the report.
2. **Triage**: Assess severity and risk, assign to a maintainer.
3. **Fix**: Develop and test a patch in a private branch.
4. **Release**: Publish a new patch release and update [CHANGELOG.md](CHANGELOG.md).
5. **Public Disclosure**: After release, we will publicly disclose the issue and fix in `RELEASES.md`.

## Reporting Insecure Dependencies

If you find that a third-party dependency (e.g., a Python package or npm library) used by EVLinkHA has a vulnerability, please:

* **Open an issue** on our repository with the tag **dependency-vulnerability**.
* Include the package name, version, and CVE or advisory link.

We will update or patch the dependency promptly.

## Other Security Resources

* [OWASP Top 10](https://owasp.org/www-project-top-ten/)
* [FASTAPI Security Best Practices](https://fastapi.tiangolo.com/tutorial/security/)
* [Next.js Security](https://nextjs.org/docs/advanced-features/security)

---

Thank you for helping keep EVLinkHA secure.
