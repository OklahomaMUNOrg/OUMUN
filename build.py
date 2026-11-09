#!/usr/bin/env python3
import json
import re
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).parent
errors = []


def load(name):
    path = ROOT / "data" / name
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        errors.append(f"data/{name} is missing.")
    except json.JSONDecodeError as err:
        errors.append(
            f"data/{name} has a typo near line {err.lineno}, column {err.colno} ({err.msg}). "
            "Look for a missing comma, quote mark or bracket just before that spot."
        )
    return None


def e(value):
    return escape(str(value), quote=True)


def need(item, keys, where):
    for key in keys:
        if key not in item or item[key] in ("", None):
            errors.append(f"{where} is missing \"{key}\".")


def newest_first(years, where):
    for y in years:
        need(y, ["year"], f"{where}: a year entry")
    numbered = [y for y in years if str(y.get("year", "")).strip()[:1].isdigit()]
    others = [y for y in years if not str(y.get("year", "")).strip()[:1].isdigit()]
    return sorted(numbered, key=lambda y: str(y["year"]), reverse=True) + others


# ---------- Conferences We Attend ----------

def attend_facts(y):
    awards_won = y.get("awards_won", len(y["awards"]) if y.get("awards") else None)
    items = [
        ("Dates", y.get("dates")),
        ("Location", y.get("location")),
        ("Delegation size", y.get("delegation_size")),
        ("Awards won", awards_won),
    ]
    rows = "".join(f"<div><dt>{label}</dt><dd>{e(v)}</dd></div>" for label, v in items if v not in (None, ""))
    return f'<dl class="conf-facts">{rows}</dl>' if rows else ""


def attend_year(conf, y, is_open):
    where = f'{conf.get("name", "a conference")} {y.get("year", "")}'
    parts = [attend_facts(y)]

    recap = y.get("recap")
    if recap:
        paras = recap if isinstance(recap, list) else [recap]
        parts.append('<h3 class="attend-sub">Recap</h3>' + "".join(f"<p>{e(p)}</p>" for p in paras))

    awards = y.get("awards") or []
    if awards:
        items = []
        for a in awards:
            need(a, ["award", "winner"], f"{where}: an award")
            line = f'{e(a.get("award", ""))}: {e(a.get("winner", ""))}'
            if a.get("committee"):
                line += f', {e(a["committee"])}'
            items.append(f"<li>{line}</li>")
        parts.append('<h3 class="attend-sub">Awards</h3><ul class="attend-awards">' + "".join(items) + "</ul>")

    photos = y.get("photos") or []
    if photos:
        figures = []
        for p in photos:
            need(p, ["file"], f"{where}: a photo")
            caption = f'<figcaption>{e(p["caption"])}</figcaption>' if p.get("caption") else ""
            figures.append(
                f'<figure><img src="../images/{e(p.get("file", ""))}" alt="{e(p.get("alt", ""))}" loading="lazy">{caption}</figure>'
            )
        parts.append('<h3 class="attend-sub">Photos</h3><div class="photo-grid">' + "".join(figures) + "</div>")

    body = "\n".join(p for p in parts if p)
    open_attr = " open" if is_open else ""
    return (f'<details class="faq"{open_attr}><summary>{e(y.get("year", ""))}</summary>'
            f'<div class="attend-body">{body}</div></details>')


def build_attend(data):
    sections, jumps = [], []
    for i, conf in enumerate(data.get("conferences", [])):
        need(conf, ["id", "name"], "A conference in attended.json")
        years = newest_first(conf.get("years", []), conf.get("name", "a conference"))
        lead = f'<p class="lead">{e(conf["description"])}</p>' if conf.get("description") else ""
        rows = "\n".join(attend_year(conf, y, n == 0) for n, y in enumerate(years))  # newest year starts open
        section = (f'<section class="content attend-section" id="{e(conf.get("id", ""))}">'
                   f'<h2>{e(conf.get("name", ""))}</h2>{lead}<div class="faq-list">\n{rows}\n</div></section>')
        sections.append(f'<div class="tint-wrap">{section}</div>' if i % 2 == 0 else section)
        jumps.append(f'<a href="#{e(conf.get("id", ""))}">{e(conf.get("name", ""))}</a>')
    return "\n\n".join(sections), " &middot; ".join(jumps)


# ---------- Award history on a hosted conference page ----------

def build_awards(data):
    name = data.get("conference_name", "conference")
    rows_html = []
    for n, y in enumerate(newest_first(data.get("years", []), "awards")):
        body = []
        for a in y.get("awards", []):
            need(a, ["award", "winner"], f'{y.get("year", "")}: an award')
            body.append(f'<tr><td>{e(a.get("award", ""))}</td><td>{e(a.get("winner", ""))}</td>'
                        f'<td>{e(a.get("committee", ""))}</td></tr>')
        table = (f'<div class="schedule-wrap"><table class="awards-table">'
                 f'<caption class="sr-only">Awards given at the {e(y.get("year", ""))} {e(name)}</caption>'
                 '<thead><tr><th scope="col">Award</th><th scope="col">Winner</th>'
                 '<th scope="col">Committee</th></tr></thead>'
                 f'<tbody>{"".join(body)}</tbody></table></div>')
        open_attr = " open" if n == 0 else ""
        rows_html.append(f'<details class="faq"{open_attr}><summary>{e(y.get("year", ""))}</summary>{table}</details>')
    return '<div class="faq-list">\n' + "\n".join(rows_html) + "\n</div>"


# ---------- Writing into the pages ----------

def fill(page, marker, html):
    path = ROOT / page
    if not path.exists():
        errors.append(f"{page} was not found.")
        return
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(rf"(<!-- BUILD:{marker} -->)(.*?)(<!-- /BUILD:{marker} -->)", re.S)
    if not pattern.search(text):
        errors.append(f"{page} is missing the lines <!-- BUILD:{marker} --> and <!-- /BUILD:{marker} -->.")
        return
    path.write_text(pattern.sub(lambda m: f"{m.group(1)}\n{html}\n{m.group(3)}", text), encoding="utf-8")


def main():
    attended = load("attended.json")
    awards = load("hs-awards.json")
    if attended is not None:
        sections, jumps = build_attend(attended)
        if not errors:
            fill("variable/conferences-we-attend.html", "attend-jump", jumps)
            fill("variable/conferences-we-attend.html", "attend-conferences", sections)
    if awards is not None:
        html = build_awards(awards)
        if not errors:
            fill("variable/high-school-conference.html", "hs-awards", html)
    if errors:
        print("The pages were NOT updated. Please fix these problems:\n")
        for message in errors:
            print(" -", message)
        sys.exit(1)
    print("Done. Pages updated from the files in data/.")


if __name__ == "__main__":
    main()