"""One-off script to build courses/seed_data.json from frontend JS."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def js_to_json(s: str):
    s = re.sub(r"(\s)([a-zA-Z_][a-zA-Z0-9_]*)(\s*):", r'\1"\2"\3:', s)
    return json.loads(s)


def main():
    js = (ROOT / "js/data/courses.js").read_text(encoding="utf-8")
    meta = (ROOT / "js/lib/course-meta.js").read_text(encoding="utf-8")
    courses = js_to_json(re.search(r"window\.BARWAAQO_COURSES\s*=\s*(\[.*\]);", js, re.S).group(1))
    roadmaps = js_to_json(re.search(r"window\.COURSE_ROADMAPS\s*=\s*(\{.*?\});", meta, re.S).group(1))
    for c in courses:
        c["roadmap"] = roadmaps.get(c["id"], [])
    out = Path(__file__).resolve().parent / "courses" / "seed_data.json"
    out.write_text(json.dumps(courses, indent=2), encoding="utf-8")
    print(f"Wrote {len(courses)} courses to {out}")


if __name__ == "__main__":
    main()
