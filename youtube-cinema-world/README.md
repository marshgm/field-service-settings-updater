# YouTube Cinema World

A single-file 3D cinema you can walk around in your browser, with a big screen
that plays any YouTube playlist (or single video). Built with
[Three.js](https://threejs.org/) and the
[YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
— no build step, no dependencies to install. Three.js (v0.160.0, MIT licence)
is vendored in `vendor/three/` so the app has no CDN dependency; the only
external service it talks to is YouTube itself.

## How it works

The cinema (walls, seats, curtains, audience, lighting) is rendered with WebGL.
The YouTube player is a real `<iframe>` positioned in the same 3D space using
Three.js's `CSS3DRenderer`; the WebGL scene punches a transparent hole where
the screen is, so the video shows through in correct perspective and keeps
playing while you wander about.

## Running it

The page uses JavaScript modules and embeds YouTube, so it needs to be served
over HTTP (opening the file directly with `file://` will not work in most
browsers):

```bash
# from the repository root — any static server works
npx serve youtube-cinema-world
# or
python3 -m http.server --directory youtube-cinema-world 8000
```

Then open the printed URL in a desktop browser. It also works out of the box on
GitHub Pages — point Pages at this folder (or the repo root and browse to
`/youtube-cinema-world/`).

## Using it

1. Paste a YouTube **playlist URL** (anything with `?list=PL…`), a **video
   URL**, or a bare playlist/video ID into the box and press **Load onto the
   big screen**.
2. Press **Enter cinema** to start walking (this locks the mouse pointer for
   looking around).

| Key | Action |
| --- | --- |
| `W` `A` `S` `D` / arrow keys | Walk |
| `Shift` | Walk faster |
| Mouse | Look around |
| `Space` | Play / pause |
| `N` / `P` | Next / previous video in the playlist |
| `M` | Mute / unmute |
| `-` / `=` | Volume down / up |
| `Esc` | Leave the walk and reopen the menu |

While the menu is open, the 3D screen is directly clickable — you can use
YouTube's own player controls, including **captions (CC)** and quality
settings.

Note: if the browser blocks unmuted autoplay, press `Esc` and click the play
button on the screen once; everything is keyboard-driven after that.

## Accessibility

- All functionality is available from the keyboard; single-key shortcuts are
  active only while walking (pointer locked), so they never interfere with
  typing in the menu.
- The menu is a standard labelled form with visible focus indicators, inline
  error messages, and a polite live region announcing player status and the
  current video title.
- Captions are available through YouTube's own CC control on the embedded
  player.
- `prefers-reduced-motion` disables the decorative screen-light shimmer.

## Limitations

- Some videos disallow embedding ("Watch on YouTube") — the app reports this
  and you can skip with `N`.
- It's single-player: the "people" in the seats are ambient low-poly locals,
  not other users.
