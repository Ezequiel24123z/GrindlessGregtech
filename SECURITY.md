# Security policy

## Supported versions

Only the newest release (the `releases` channel) gets fixes. Older tags are not patched: update the pack instead.

## Reporting a vulnerability

Report it privately through GitHub: the repository's **Security** tab > **Report a vulnerability** (private
vulnerability reporting). Do not open a public issue, pull request or discussion for a security problem.

A useful report says what is affected (a script, a tool under `tools/`, a workflow, the release channel or the Prism
instance), how to reproduce it and what an attacker gains.

## Scope

In scope: the repository's scripts and tools, its GitHub Actions workflows, the release process (`tools/release/`,
`tools/prism/`, the `releases` channel) and anything the pack ships that runs code on a player's machine or server.

Out of scope: vulnerabilities in Minecraft, Forge or a third-party mod itself (report those to their authors), and
gameplay exploits such as duplication or balance problems, which are ordinary issues.

This is a one-person project: reports are read and answered on a best-effort basis.
