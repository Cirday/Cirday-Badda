#!/usr/bin/env python3
"""Xogta rasmiga ah ee webiyada iyo saadaasha toddobaadka -> rasmi.json

  * SWALIM (FAO) FRRIMS: heerka biyaha 8-da saldhig ee Jubba iyo Shabeelle, iyo xadka khatarta
    (https://frrims.faoswalim.org/rivers/levels)
  * ICPAC (IGAD): saadaasha toddobaadka, muddada iyo khariiradaha
    (https://www.icpac.net/weekly-forecast/)

Labadaba API ma leh, CORS-na ma leh; GitHub Action ayaa akhriya, bogga /digniin/ ayaa ka akhriya rasmi.json.
Isticmaal:  python3 rasmi.py OUT.json   [--src DIR  (levels.html, weekly.html: tijaabo)]
Haddii isha la gaari waayo, qaybteedii hore ayaa la haystaa (lama tirtiro).
"""
import html, json, os, re, sys, time, urllib.request
from datetime import datetime, timezone

SW_URL = "https://frrims.faoswalim.org/rivers/levels"
IC_URL = "https://www.icpac.net/weekly-forecast/"
IC_BASE = "https://www.icpac.net"
IC_KINDS = [  # magaca faylka -> nooca khariiradda (kan ugu horreeya ee ku habboon ayaa la qaataa)
    ("precipanomaly", "rain_anom"), ("prec30mm", "rain_heavy"), ("flood", "flood"), ("tavganomaly", "temp_anom"),
    ("heatstress", "heat"), ("tavg", "temp"), ("prec", "rain"),
]


def get(url, src=None, name=None):
    if src:
        with open(os.path.join(src, name), "rb") as f:
            return f.read().decode("utf-8", "replace")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; Cirday/1.0; +https://cirday.com)"})
    for i in range(3):
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.read().decode("utf-8", "replace")
        except Exception:
            if i == 2:
                raise
            time.sleep(5 * (i + 1))


def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def num(s):
    try:
        return round(float(s), 2)
    except ValueError:
        return None


def swalim(raw):
    st = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", raw, re.S | re.I):
        c = [clean(x) for x in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S | re.I)]
        if len(c) < 7 or "river" not in c[0].lower() or not re.match(r"\d{2}-\d{2}-\d{4}$", c[2]):
            continue
        river = "Jubba" if "jub" in c[0].lower() else "Shabelle" if "shab" in c[0].lower() else c[0]
        d, m, y = c[2].split("-")
        st.append({"r": river, "n": c[1], "d": f"{y}-{m}-{d}", "o": num(c[3]), "m": num(c[4]), "h": num(c[5]), "b": num(c[6])})
    if not st:
        raise ValueError("SWALIM: saf la akhriyo lama helin")
    return {"url": SW_URL, "st": st}


def icpac(raw):
    per = re.search(r"(\d{1,2}\s+[A-Z][a-z]+(?:\s+\d{4})?\s*[-–]\s*\d{1,2}\s+[A-Z][a-z]+\s+\d{4})", clean(raw))
    imgs, seen = [], set()
    for path in re.findall(r"""(/media/images/[^"'\s>]+?\.height-600\.width-600\.png)""", raw):
        if path in seen:
            continue
        seen.add(path)
        low = path.rsplit("/", 1)[-1].lower()
        kind = next((k for key, k in IC_KINDS if key in low), None)
        if kind and kind not in {i["k"] for i in imgs}:
            imgs.append({"k": kind, "img": IC_BASE + path, "full": IC_BASE + path.replace(".height-600.width-600.png", ".original.png")})
        if len(seen) >= 7:          # bogga waxaa ugu horreeya toddobaadka ugu dambeeyay (7 khariiradood)
            break
    if not imgs:
        raise ValueError("ICPAC: khariirad lama helin")
    return {"url": IC_URL, "per": per.group(1).replace("–", "-") if per else "", "maps": imgs}


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "rasmi.json"
    src = sys.argv[sys.argv.index("--src") + 1] if "--src" in sys.argv else None
    old = {}
    if os.path.exists(out):
        try:
            with open(out) as f:
                old = json.load(f)
        except Exception:
            pass
    data = {}
    for key, fn, url, name in (("sw", swalim, SW_URL, "levels.html"), ("ic", icpac, IC_URL, "weekly.html")):
        try:
            data[key] = fn(get(url, src, name))
        except Exception as e:
            print(key, "lama helin:", e, file=sys.stderr)
            if old.get(key):
                data[key] = old[key]
    if {k: v for k, v in old.items() if k != "t"} == data:
        print("isbeddel ma jiro")
        return 0
    data["t"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    with open(out, "w") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("->", out, len(data.get("sw", {}).get("st", [])), "saldhig,", len(data.get("ic", {}).get("maps", [])), "khariirad")
    return 0


if __name__ == "__main__":
    sys.exit(main())
