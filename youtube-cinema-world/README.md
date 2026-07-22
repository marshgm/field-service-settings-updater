# YouTube Cinema World

A single-file 3D **five-screen multiplex** you can walk around in your
browser. Give each screen its own YouTube playlist (or single video), then
wander the lobby corridor and step into whichever room takes your fancy — you
hear the audio of the room you're standing in. Built with
[Three.js](https://threejs.org/) and the
[YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
— no build step, no dependencies to install. Three.js (v0.160.0, MIT licence)
is vendored in `vendor/three/` so the app has no CDN dependency; the only
external service it talks to is YouTube itself.

## How it works

The multiplex (lobby corridor, five rooms with seats, curtains, audiences,
door signs and lighting) is rendered with WebGL. Each room's YouTube player is
a real `<iframe>` positioned in the same 3D space using Three.js's
`CSS3DRenderer`; the WebGL scene punches a transparent hole where each screen
is, so the videos show through in correct perspective and keep playing while
you wander between rooms.

Audio follows you: every room starts muted, and whichever room you walk into
gets unmuted (unless you've pressed `M`). Back in the lobby, everything is
quiet.

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

1. Paste up to five YouTube **playlist URLs** (anything with `?list=PL…`),
   **video URLs**, **channel URLs** (`/channel/UC…`, `/@handle`, `/c/…`,
   `/user/…` — these play the channel's uploads), or bare playlist/video/
   channel IDs — one per screen. Google search redirect links
   (`google.com/url?...url=…`) are unwrapped automatically. Leave a screen
   blank to keep that room dark. The inputs come preloaded with the
   [Scottish Summit](https://www.youtube.com/@ScottishSummit) yearly session
   playlists as a demo — swap in your own any time.
2. Press **Load the screens**, then **Enter the multiplex** to start walking
   (this locks the mouse pointer for looking around). Follow the lit signs —
   Screens 1, 3 and 5 are on the left of the lobby, 2 and 4 on the right.

| Key | Action |
| --- | --- |
| `W` `A` `S` `D` / arrow keys | Walk |
| `Shift` | Walk faster |
| Mouse | Look around |
| `Space` | Play / pause the room you're in |
| `N` / `P` | Next / previous video in this room's playlist |
| `M` | Mute / unmute |
| `-` / `=` | Volume down / up |
| `Esc` | Leave the walk and reopen the menu |

While the menu is open, the 3D screens are directly clickable — you can use
YouTube's own player controls, including **captions (CC)** and quality
settings, on any screen you can see.

**Performance mode** (checkbox in the menu) pauses the screens in rooms you're
not in and resumes them when you walk in — kinder to slower machines than
five videos decoding at once.

Note: if the browser blocks unmuted autoplay, press `Esc` and click the play
button on a screen once; everything is keyboard-driven after that.

## Accessibility

- All functionality is available from the keyboard; single-key shortcuts are
  active only while walking (pointer locked), so they never interfere with
  typing in the menu.
- The menu is a standard labelled form with visible focus indicators, inline
  per-screen error messages, and a polite live region announcing room changes,
  player status and current video titles. A "Now showing" list tracks all five
  screens.
- Captions are available through YouTube's own CC control on each embedded
  player.
- `prefers-reduced-motion` disables the decorative screen-light shimmer.

## Limitations

- Some videos disallow embedding ("Watch on YouTube") — the app reports this
  and you can skip with `N` in that room.
- It's single-player: the "people" in the seats are ambient low-poly locals,
  not other users.
