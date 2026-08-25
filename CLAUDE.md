# Sentinel instructions for Claude Code

Read and follow `AGENTS.md` before inspecting or changing the repository. Its
data boundary, security invariants, required checks, change-control rules, and
documentation requirements are mandatory.

In particular:

- Use only the fictional fixtures already committed to this repository.
- Never request, read, upload, reproduce, or expose operational data, secrets,
  credentials, encrypted backups, PDFs, spreadsheets, or database copies.
- Treat Claude as advisory: do not approve releases, grant access, delete
  records, disable security controls, publish, deploy, merge, or change
  repository visibility.
- Run every `test-*.js` file after relevant changes and treat security,
  authorization, encryption, secret, and data-policy failures as blockers.
- Inspect the complete diff before committing and keep changes focused on the
  issue or pull request that invoked Claude.
