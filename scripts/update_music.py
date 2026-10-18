"""Refresh the static MP3 catalog; uses only the Python standard library."""
import json
from pathlib import Path


def main():
    music = Path(__file__).resolve().parent.parent / "music"
    tracks = [
        {"file": path.name, "title": path.stem}
        for path in sorted(music.iterdir(), key=lambda path: path.name.casefold())
        if path.is_file() and path.suffix.lower() == ".mp3"
    ]
    (music / "playlist.json").write_text(
        json.dumps({"tracks": tracks}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated music/playlist.json: {len(tracks)} tracks")


if __name__ == "__main__":
    main()
