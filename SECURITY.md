# Security Policy

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.

To report a security issue, email the project owner directly at the address
configured in the repository's `EMAIL_OWNER` environment variable. Include:

- A description of the vulnerability and the affected component
- Steps to reproduce, if possible
- The impact you believe the issue may have
- Any suggested mitigation or fix, if you have one

You will receive a response acknowledging your report, and we will keep you
informed as the issue is triaged and addressed. We ask that you refrain from
publicly disclosing the issue until we have had a reasonable chance to fix it.

## Supported versions

This is a continuously deployed project with a `test` integration branch and a
`main` production branch. Security fixes are applied to the latest state of
`test` and released through `main`. Older branches are not separately
maintained.