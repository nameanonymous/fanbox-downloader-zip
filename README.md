# fanbox-downloader-zip

A one-click downloader for [PIXIV FANBOX](https://www.fanbox.cc/) posts. Open a post, click the
**Download** button, and get its images, attachments, and text bundled into a single `.zip`.

## Credits

This is an unofficial fork of [tana3n/fanbox-downloader](https://github.com/tana3n/fanbox-downloader).
All credit for the original extension — the download logic, filename macros, and the idea itself —
goes to **tana3n**. Thank you for building and open-sourcing it. The upstream project appears
unmaintained (last release 2024-01-20), so this fork continues it with a few changes below.

## What's different in this fork

- **ZIP bundling**: a post's images, attachments, and text are packaged into one `.zip` download
  instead of many separate files.
- **English UI, no options page**: download behavior and filename macros are fixed to sensible
  defaults — there's nothing left to configure.
- **A floating Download button** replaces the old right-click context menu. It appears at the
  bottom of FANBOX post pages and tracks navigation as you browse between posts.

## Installation

### Firefox

Grab the latest `.xpi` from [Releases](https://github.com/nameanonymous/fanbox-downloader-zip/releases)
(or build one yourself — see below), then either:
- drag it into a Firefox window to install it, or
- open `about:debugging` → *This Firefox* → *Load Temporary Add-on* and pick the `.xpi`/`manifest.json`
  for a temporary, unsigned install.

### Chrome / Edge

1. Download and unzip the release package (or clone this repo).
2. Open `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the project folder.

## Usage

Open any FANBOX post page, e.g. `https://www.fanbox.cc/@creator/posts/12345` or
`https://creator.fanbox.cc/posts/12345`. A blue **Download** button appears at the bottom of the
page — click it to download everything in that post as a ZIP.

## Filename macros

Files inside the ZIP are named from a fixed template using macros such as `$fanboxname$`,
`$fanboxID$`, `$Title$`, `$PageID$`, `$Diff$`/`$DiffCount$`, `$AttrName$`, and date macros like
`$YYYY$`/`$MM$`/`$DD$`/`$hh$`/`$mm$` (plus 28-hour and "downloaded at" variants). See the top of
[fanbox-downloader.js](fanbox-downloader.js) for the exact defaults.

## Building a release package

[deploy.sh](deploy.sh) bundles the extension into a `.zip`; rename it to `.xpi` to install in
Firefox or submit to [addons.mozilla.org](https://addons.mozilla.org/).

## Privacy

The extension only talks to `*.fanbox.cc` to read the post you're viewing, and to the browser's
own downloads API to save files. It collects and transmits no data anywhere else.

## Changelog

See [release.md](release.md).

## License

MIT — see [LICENSE](LICENSE). Original work © 2022 tana3n.
