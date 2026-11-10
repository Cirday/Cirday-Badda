#!/usr/bin/env python3
"""Digniinaha SNMA (meteosomalia.so) -> digniin.json

Feed-ka CAP ee Hay'adda Qaranka ee Saadaasha Hawada Soomaaliya ayuu akhriyaa,
wuxuuna u beddelaa JSON yar oo Cirday iyo Badda ay isla domain-ka ka akhrisan karaan
(feed-ka asalka ah CORS ma lahan, browser-ku si toos ah uma akhrin karo).

Isticmaal:  python3 digniin.py OUT.json   [--src DIR  (faylal xml ah, tijaabo)]
Haddii feed-ka la gaari waayo, faylka hore waa la daayaa (lama tirtiro).
"""
import json, os, sys, time, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

FEED = "https://meteosomalia.so/api/cap/rss.xml"
NS = {"cap": "urn:oasis:names:tc:emergency:cap:1.2"}
KEEP_DAYS = 3        # digniinaha dhacay 3 maalmood kadib waa laga saaraa
MAX_ALERTS = 12
MAX_PTS = 160


def get(url, src=None):
    if src:
        p = os.path.join(src, "rss.xml" if url == FEED else url.rsplit("/", 1)[-1])
        with open(p, "rb") as f:
            return f.read()
    req = urllib.request.Request(url, headers={"User-Agent": "Cirday/1.0 (+https://cirday.com)"})
    for i in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception:
            if i == 2:
                raise
            time.sleep(5 * (i + 1))


def txt(el, path):
    x = el.find(path, NS)
    return (x.text or "").strip() if x is not None and x.text else ""


def iso(s):
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)
    except Exception:
        return None


def poly(s):
    pts = []
    for pair in s.split():
        try:
            la, lo = (round(float(v), 3) for v in pair.split(","))
        except ValueError:
            continue
        if not pts or pts[-1] != [la, lo]:
            pts.append([la, lo])
    if len(pts) > MAX_PTS:
        step = len(pts) / MAX_PTS
        pts = [pts[int(i * step)] for i in range(MAX_PTS)] + [pts[-1]]
    return pts if len(pts) >= 3 else None


def parse_cap(raw, link):
    root = ET.fromstring(raw)
    if txt(root, "cap:status") != "Actual" or txt(root, "cap:msgType") == "Cancel":
        return None
    info = root.find("cap:info", NS)
    if info is None:
        return None
    polys, areas = [], []
    for ar in info.findall("cap:area", NS):
        d = txt(ar, "cap:areaDesc")
        if d:
            areas.append(d)
        for pg in ar.findall("cap:polygon", NS):
            p = poly(pg.text or "")
            if p:
                polys.append(p)
    exp = iso(txt(info, "cap:expires"))
    if not exp:
        return None
    flat = [q for p in polys for q in p]
    a = {
        "id": txt(root, "cap:identifier"),
        "sent": txt(root, "cap:sent"),
        "ev": txt(info, "cap:event"),
        "code": txt(info, "cap:eventCode/cap:value"),
        "sev": txt(info, "cap:severity"),
        "urg": txt(info, "cap:urgency"),
        "cert": txt(info, "cap:certainty"),
        "onset": txt(info, "cap:onset") or txt(info, "cap:effective"),
        "exp": exp.isoformat().replace("+00:00", "Z"),
        "h": txt(info, "cap:headline"),
        "d": txt(info, "cap:description"),
        "ins": txt(info, "cap:instruction"),
        "area": "; ".join(areas),
        "web": txt(info, "cap:web") or link,
        "poly": polys,
    }
    if flat:
        la = [p[0] for p in flat]; lo = [p[1] for p in flat]
        a["bb"] = [min(la), min(lo), max(la), max(lo)]
    return a


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "digniin.json"
    src = sys.argv[sys.argv.index("--src") + 1] if "--src" in sys.argv else None
    now = iso(os.environ["CIRDAY_NOW"]) if os.environ.get("CIRDAY_NOW") else datetime.now(timezone.utc)
    try:
        rss = ET.fromstring(get(FEED, src))
    except Exception as e:
        print("feed lama helin:", e, file=sys.stderr)
        return 0
    links = [(i.findtext("link") or "").strip() for i in rss.iter("item")]
    alerts = []
    for link in links:
        if not link.startswith("https://meteosomalia.so/api/cap/"):
            continue
        try:
            a = parse_cap(get(link, src), link)
        except Exception as e:
            print("CAP khalad:", link, e, file=sys.stderr)
            continue
        if a and iso(a["exp"]) > now - timedelta(days=KEEP_DAYS):
            alerts.append(a)
    alerts.sort(key=lambda a: a["sent"], reverse=True)
    alerts = alerts[:MAX_ALERTS]
    data = {"src": "SNMA", "url": "https://meteosomalia.so", "feed": FEED, "a": alerts}
    old = None
    if os.path.exists(out):
        try:
            with open(out) as f:
                old = json.load(f)
        except Exception:
            pass
    if old and old.get("a") == alerts:
        print("isbeddel ma jiro")
        return 0
    data["t"] = now.replace(microsecond=0).isoformat().replace("+00:00", "Z")
    with open(out, "w") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(alerts)} digniin ->", out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
