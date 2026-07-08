import re

from pathlib import Path



ROOT = Path(__file__).resolve().parents[1]

p = ROOT / "js/data/courses.js"

text = p.read_text(encoding="utf-8")



# Homepage featured — always free

FEATURED = {

    "ui-ux-fundamentals",

    "web-development-bootcamp",

    "data-science-python",

    "programming-fundamentals",

}



# 10 premium (locked) — catalog only, never on homepage featured

PREMIUM = set()



parts = re.split(r"(?=\n  \{)", text)

out = parts[0]

for block in parts[1:]:

    m = re.search(r'id: "([^"]+)"', block)

    if not m:

        out += block

        continue

    cid = m.group(1)

    is_free = cid not in PREMIUM

    block = re.sub(

        r"featured: (true|false)",

        f"featured: {'true' if cid in FEATURED else 'false'}",

        block,

        count=1,

    )

    block = re.sub(

        r"free: (true|false)",

        f"free: {'true' if is_free else 'false'}",

        block,

        count=1,

    )

    out += block



p.write_text(out, encoding="utf-8")

free_count = 25 - len(PREMIUM)

print(f"Patched {free_count} free, {len(PREMIUM)} premium, {len(FEATURED)} featured")

