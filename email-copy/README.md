# Email copy — The One Partner Reset

Two ready-to-send HTML emails for the post-purchase flow. Both follow the locked
brand palette (navy `#203F5C`, coral `#F59075` / `#E5795C`, cream `#FBF7F1`, warm
sand `#F8ECE0`, gold `✦` accents) and reuse the existing card shell.

**Format:** each file is a paste-in fragment — one `<style>` block + the hidden
preheader + the `<table>`. No `<!DOCTYPE>` / `<html>` / `<head>` / `<body>` wrapper.
Paste the whole file into your ESP's HTML editor; it hoists the `<style>` into the
head. The `<style>` block is required — it carries the responsive (mobile) and
dark-mode rules, which cannot live in inline `style=` attributes.

**Dark + light mode:** the inline styles are the light-mode baseline. The `<style>`
block adds `@media (prefers-color-scheme: dark)` (Apple Mail, iOS Mail, Outlook app)
and `[data-ogsc]` (Outlook.com) overrides so dark-mode readers get a deep-navy
surface with light text instead of unreadable navy-on-white. Verified at desktop and
mobile in both modes.

## Files

| File | Audience | What they get |
|---|---|---|
| `non-buyer.html` | Joined the Reset, did **not** add the ₹199 Love Legacy Visualization | 3 PDFs + the Love Legacy Manifesto image (one Drive folder) + WhatsApp community |
| `buyer.html` | Joined the Reset **and** added the ₹199 Love Legacy Visualization | Same bonuses **plus** the meditation video (`.mp4`) and audio (`.wav`), all in one Drive folder + WhatsApp community |

Each email has exactly **two CTAs**: a coral "open the bonus folder" button and a
coral-outline "join the community" button.

## Links baked in

| Where | URL |
|---|---|
| Non-buyer bonus folder | `https://drive.google.com/drive/folders/12-Ba5PLtdOJw25vdNSeUD3C-TlZmA11y?usp=drive_link` |
| Buyer bonus + meditation folder | `https://drive.google.com/drive/folders/1-_8wraXcmg8WpctzDGLzhLo9NyEK6Uog?usp=drive_link` |
| WhatsApp community (both emails) | `https://chat.whatsapp.com/KosdBcA65LqDyUOynlggFZ` |
| Logo | `https://www.sonalibadani.com/logo.png` |
| Hero image (both emails) | `https://www.sonalibadani.com/Section-Images/section-image10.png` |

## Before you send

1. **Drive sharing:** set both Drive folders to **"Anyone with the link → Viewer"**
   so recipients can open the files without requesting access.
2. **First name:** the greeting uses `{{first_name}}`. Swap this token for your
   sending platform's merge field (e.g. Pabbly / your ESP) so it renders the
   recipient's name.
3. **Hero image must be deployed.** Both emails load the hero from
   `https://www.sonalibadani.com/Section-Images/section-image10.png`. That file
   (`public/Section-Images/section-image10.png`) is currently **untracked** — commit
   and deploy it so the URL resolves, or the hero will show as a broken image.
4. No attachments are used — everything is delivered through the Drive folder, which
   sidesteps the 1 GB+ size limit on the meditation video and audio.
