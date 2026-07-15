# IEEE Download Route

Use this route for IEEE Xplore documents or when the user explicitly asks for the IEEE copy.

## Prerequisites

- Use Google Chrome with the Codex Chrome browser-control extension/plugin installed and enabled.
- Prefer a dedicated Chrome profile named `Papers-Codex` with publisher and institution sessions already prepared.
- Before browser actions, read and follow the relevant Chrome control skill when it is available.
- If Chrome control or the intended profile is unavailable, stop and ask the user to fix the browser setup instead of falling back to unauthenticated scraping.

## Boundary

- Use Chrome for gated IEEE access; do not use shell `curl` for authenticated PDFs.
- Do not read, reveal, store, or type passwords, OTPs, cookies, or session tokens.
- Stop for CAPTCHA, QR login, OTP, missing password autofill, wrong saved credentials, or unexpected account prompts.

## Chrome Profile Selection

Do not assume the first Chrome backend is the right one. List Chrome extension backends and choose the profile matching the paper workflow, usually `Papers-Codex`.

Good checks:

- Browser backend metadata: profile name, `profileIsLastUsed`, extension instance ID.
- Open IEEE tabs in each Chrome backend.
- Existing `Access provided by:` signal on IEEE pages.

If Chrome is closed, use the plugin's Chrome-opening helper when available, then reconnect and re-list backends. In the user's current setup, `Papers-Codex` maps to Chrome `Profile 1`.

## IEEE Workflow

1. Open the IEEE document page:
   - `https://ieeexplore.ieee.org/document/<document-id>/`
2. Verify access.
   - Authorized signal: `Access provided by:` plus institution name.
   - For the user's UCAS setup, expected signal: `University of Chinese Academy of SciencesCAS`.
   - Authorized PDF link typically changes from JavaScript-only to `/stamp/stamp.jsp?tp=&arnumber=<document-id>`.
3. If not authorized, click `Institutional Sign In`.
4. Prefer remembered SeamlessAccess institution if it matches:
   - `University of Chinese Academy of Sciences, CAS(CST Cloud)`
5. If missing, use `Add or Change Institution` and search exactly:
   - `University of Chinese Academy of Sciences`
6. Click the matching `Access Through ...` button.
7. Follow the redirect to the identity provider.

## CST Cloud / UCAS Login

Destination may be `passport.escience.cn` with title `中国科技网通行证`.

Allowed automation:

- Click account/password controls.
- Trigger Chrome/password-manager autofill.
- Check only whether username/password fields have values as booleans.
- Click `登录` only if both values are present and the user's request authorized automatic login.

Forbidden automation:

- Do not read or print username/password values.
- Do not manually type a password unless the user explicitly provides it in the current prompt, which should be avoided.
- Do not save passwords or change password-manager settings.

## Iframe Handling

SSO pages often place the login form in an iframe. Do not target bare `iframe` when multiple iframes exist.

Prefer a frame that contains:

- Account placeholder such as `邮箱/手机号/用户名`.
- Password label such as `密码`.
- Login button such as `登录`.

If iframe targeting becomes ambiguous, take a fresh DOM snapshot and rebuild the frame selection from visible login labels.

## PDF Download

For IEEE, clicking `PDF` may navigate to:

```text
https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=<document-id>
```

The actual PDF may be embedded in an iframe:

```text
/stampPDF/getPDF.jsp?tp=&arnumber=<document-id>&ref=...
```

Use browser-controlled media/download APIs on that iframe or PDF element.

After download, wait for `.crdownload` to disappear, then save to:

```text
/Users/wimrhei/arch-research/论文阅读/Inbox/xxx/xxx.pdf
```

Verify with `file` and `pdfinfo`.
