# Security Policy

## Supported prototype

Security fixes are applied to the latest `v0.6.x` prototype on `main`. Earlier prototype branches are not supported deployment targets.

Sentinel's public GitHub Pages site and repository are fictional-data-only. The interim encrypted browser vault is not an Army authorization, approved hosting environment, CAC/PIV identity system, enterprise permission model, or system of record.

## Report a vulnerability

Do not place credentials, real inspection records, operational details, CUI, PII, exploit payloads containing real data, or sensitive screenshots in a public issue or pull request.

If the repository's **Security** tab offers private vulnerability reporting, use **Report a vulnerability**. Otherwise, contact the repository owner through an already-approved private channel and share only the minimum synthetic reproduction needed to establish a secure reporting path.

For a suspected exposure of real data, stop using the affected copy, preserve evidence according to the responsible organization's incident process, and notify the information owner and security office through approved channels. Do not upload the affected data to GitHub or an AI service.

## Safe reproductions

- Use only synthetic fixtures whose filenames begin with `Sentinel_Fictional_`.
- Remove names, contacts, identifiers, facility details, schedules, and operational metadata from screenshots and logs.
- Never attach browser vault backups or exported CSV files.
- Include the Sentinel version, browser, operating system, exact synthetic steps, and expected versus actual behavior.
