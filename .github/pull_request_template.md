## Summary

Describe what changed and why.

## Data and security boundary

- [ ] This change contains no operational data, CUI, PII, credentials, real exports, encrypted backups, screenshots of real records, or non-fictional CSV files.
- [ ] Public/demo behavior remains clearly labeled as fictional and non-authoritative.
- [ ] Encryption, imports, exports, lifecycle locking, service workers, and CSP changes include focused security tests when applicable.
- [ ] No Army approval, ATO, CAC/PIV, FIPS, hosting, or system-of-record claim is implied.

## Validation

- [ ] Every `test-*.js` file passes.
- [ ] `git diff --check` passes.
- [ ] `test-public-data-policy.js` passes.
- [ ] Relevant phone/browser behavior was checked when the UI changed.

## Reviewer notes

Call out residual risks, migration concerns, or follow-up work.
