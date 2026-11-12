# CMS login cookie fix

Deploy this repository to the CMS service on port 4000. The website frontend
is a separate deployment from `Zainisrar/green-ai`.

The login and logout handlers now choose the cookie's `Secure` flag from the
public request protocol instead of `NODE_ENV`. This allows the existing HTTP
portal to keep its login session and retains secure cookies when using HTTPS.
If a reverse proxy terminates HTTPS, configure it to overwrite
`X-Forwarded-Proto` with the public request protocol.

Deployment steps:

1. Pull `main` and preserve the server's environment configuration, database,
   and uploaded media. No database migration or content re-import is required.
2. Install dependencies using the project's package manager. The checked-in
   npm lock file is out of sync; the local verification install used
   `npm install --legacy-peer-deps --no-package-lock`.
3. Run `npm run build`, then restart the existing CMS service with its current
   process manager and port configuration.
4. Sign out and sign back in. Verify Projects, a project's Edit page, Flagship
   Projects, and Navigation edit/save. Confirm the session survives a refresh.

Local validation: the cookie protocol checks passed for HTTP, HTTPS and
reverse-proxy requests. The full production build failed in the existing
`next/font` Google Nunito loader (`app/layout.tsx`, null regex match inside
Next.js 14.2.13). A successful production build still needs to be confirmed
in the deployment environment; it is not a failure in the auth handlers.

## Existing portfolio content

The live CMS already contains 23 projects at `/api/endeavors/projects`.
Additional spreadsheet details (client, scope, year, gallery and animation
metadata) are in the Media Library document `project-portfolio-content.json`,
folder `endeavors/project-portfolio`. The latest website frontend loads that
document together with the project records. Those extra fields do not yet
have a dedicated editor in the CMS project form.

The local development gateway used for verification is temporary and is not
part of this deployment. Deploy both repositories to publish the CMS fix and
the latest portfolio frontend.
