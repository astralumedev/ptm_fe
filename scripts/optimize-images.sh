#!/usr/bin/env sh
# Re-encodes the images shipped in /public in place (same names, so no links change):
# photos capped at 1920px, logos at 600px. A file is only replaced when the result is smaller.
# Images uploaded through the admin are optimised in the browser and never need this.
set -e
TMP="${TMPDIR:-/tmp}/ptm-opt"; mkdir -p "$TMP"
opt() { # file maxEdge
  f="$1"; max="$2"; ext=$(echo "${f##*.}" | tr 'A-Z' 'a-z'); out="$TMP/out.$ext"
  vf="scale='if(gt(iw,ih),min($max,iw),-2)':'if(gt(iw,ih),-2,min($max,ih))':flags=lanczos"
  case "$ext" in
    webp) ffmpeg -loglevel error -y -i "$f" -vf "$vf" -c:v libwebp -quality 78 -compression_level 6 "$out" ;;
    jpg|jpeg) ffmpeg -loglevel error -y -i "$f" -vf "$vf" -q:v 4 "$out" ;;
    png) ffmpeg -loglevel error -y -i "$f" -vf "$vf" -compression_level 9 "$out" ;;
    *) return ;;
  esac
  before=$(wc -c < "$f"); after=$(wc -c < "$out")
  if [ "$after" -lt "$before" ]; then mv "$out" "$f"; echo "$(( before / 1024 ))KB -> $(( after / 1024 ))KB  $f"; fi
}
for f in public/mall_images/* public/stores/*_cover.* public/square_silhouette_*; do opt "$f" 1920; done
for f in public/stores/*_logo.* public/stores/qfx/* public/tm_logo_nobg.png; do opt "$f" 600; done
