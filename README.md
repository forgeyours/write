<div align="center">

# ✍️ ForgeYours Write

**Free, open-source document editor. No subscription. No account. Yours.**

[Live App](https://write.forgeyours.space) · [ForgeYours Platform](https://forgeyours.space) · [MIT License](LICENSE)

</div>

-----

## What is Write?

Write is a full-featured document editor that runs entirely in your browser.
No installation. No account. No subscription. Your files stay on your device.

It is part of the [ForgeYours](https://forgeyours.space) platform — a collection of free, open-source tools for human expression and productivity.

-----

## Features

**Editing**

- Rich text editing with full formatting toolbar
- Font family picker — 40+ fonts including Google Fonts + upload your own
- Font size, line spacing, text colour, highlight colour
- Headings H1–H3, bullet and numbered lists, alignment, indent
- Superscript, subscript, blockquote, horizontal rule
- Table insert via visual grid picker
- Image insert from device or URL — resize and align
- Hyperlink insert and edit
- Find and replace with match count
- Undo / Redo

**Document**

- A4 page simulation with zoom and auto-fit
- Multiple document templates with live preview
- Save custom templates from your own documents
- Word count, character count, reading time
- Document rename

**Export**

- Microsoft Word (.docx)
- PDF (via browser print dialog)
- Web Archive (.html)
- Plain Text (.txt)
- OpenDocument Text (.odt)
- Rich Text Format (.rtf)
- Apple Pages (.pages)

**Storage**

- Local save — IndexedDB, works offline, no server
- Google Drive sync — your own 15GB, your data
- File manager — browse, open, delete local and Drive files
- Auto-save every 30 seconds

**AI Assistant**

- Built-in AI writing assistant
- Bring your own API key — Anthropic Claude, Google Gemini, or OpenAI GPT
- Your key stays in your browser — never sent to our servers
- Suggested prompts to get started quickly

**Platform**

- PWA — installable, works fully offline after first load
- Embed in any website via iframe with developer portal
- Dark, light, and ivory themes
- Responsive — works on desktop, tablet, and mobile

-----

## Philosophy

Write exists because cognitive tools — the digital equivalents of pen and paper — should not be rented.

Adobe charges $60/month not because it costs that to serve you. It costs that because they can. Because you are locked in.

Write is different. It runs on your device. Your files are yours. It will never have a paywall, a feature tier, or a subscription. If it gives you value, there is a voluntary support button. No pressure.

[Read the full ForgeYours manifesto →](https://github.com/forgeyours/platform)

-----

## Getting Started

**Use it now:** [write.forgeyours.space](https://write.forgeyours.space)

No setup needed. Open the link and start writing.

**Install as an app:**
On mobile — tap Share → Add to Home Screen
On desktop — click the install icon in your browser’s address bar

-----

## Local Development

```bash
git clone https://github.com/forgeyours/write
cd write
npm install
npm run dev
```

Open <http://localhost:3000>

**Environment variables** — not required for local development.
Google Drive sync requires a Google OAuth access token entered directly in the app.
AI features require your own API key entered directly in the AI panel.

-----

## Tech Stack

|Technology         |Purpose                 |
|-------------------|------------------------|
|React 19           |UI                      |
|Vite 6             |Build tool              |
|TypeScript         |Type safety             |
|Tailwind CSS v4    |Styling                 |
|IndexedDB          |Local file storage      |
|Google Drive API v3|Cloud sync              |
|docx               |Word document generation|
|JSZip              |ODT and Pages export    |
|Lucide React       |Icons                   |
|React Hot Toast    |Notifications           |

-----

## Contributing

Write is open source and welcomes contributors.

See [CONTRIBUTING.md](https://github.com/forgeyours/platform/blob/main/CONTRIBUTING.md) for the full guide.

The short version:

1. Fork this repo
1. Build your improvement
1. Open a Pull Request

All contributions are credited in this README and in the platform contributor list.

-----

## Support

ForgeYours has no ads, no subscriptions, and no investors.

If Write saved you money or helped you create something — there is a support button inside the app. Any amount, any currency, any time. No pressure.

Every contribution is publicly accounted for at [forgeyours.space/finances](https://forgeyours.space/finances)

-----

## License

MIT — copy it, modify it, build on it.

See <LICENSE> for details.

-----

<div align="center">

**ForgeYours — forgeyours.space**

*Cognitive tools are a basic human right.*

</div>
