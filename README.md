# OU Model UN Website

The website for the University of Oklahoma Model UN team, live at **https://oumun.org**.

This guide is for officers who need to update the site. You do **not** need to be a programmer for most changes: almost everything can be done in your web browser on GitHub.

---

## The three main rules

1. **Pages built from data files: edit the data file, not the HTML.** Officers, conferences attended, and high school awards all come from files in the `data/` folder. Changes made by hand between `BUILD` lines in the HTML get erased the next time the site is published.
2. **After every change, check that it published.** Go to the **Actions** tab on GitHub. A green check means the site updated. A red X means something needs fixing (see [Troubleshooting](#troubleshooting)).
3. **Never put passwords or login details in this repository.** It is public. There is nothing to stop someone from viewing the source code.

---

## I want to...

| I want to... | Go to |
| --- | --- |
| Update the officers or board of trustees | [`data/officers.json`](#officers-dataofficersjson) |
| Add a new year of a conference we attended (ORU, Midwest MUN, etc.) | [`data/attended.json`](#conferences-we-attend-dataattendedjson) |
| Add awards from our high school conference | [`data/hs-awards.json`](#high-school-awards-datahs-awardsjson) |
| Change the text on the About, Contact, New to MUN, or home page | [Editing pages by hand](#editing-pages-by-hand) |
| Add or edit an event | [Events page](#events-page) |
| Show recent photos on the Social page | [Latest photos (Flickr)](#latest-photos-flickr) |
| Update the map of countries we have represented | [The countries map](#the-countries-map) |
| Add a photo to the site | [Adding images](#adding-images) |
| Add a whole new page | [Adding a new page](#adding-a-new-page) |

---

## How the site works

It is a fairly simple website, made up of plain HTML, CSS, JavaScript, Python, and JSON. Two small tools run automatically when the site is published:

- **`build.py`** reads the files in `data/` and fills the matching pages with cards, tables, and photos.
- **Pagefind** builds the search index so the search bar works.

### Folder map

```
index.html              Home page
styles.css              All the colors, fonts, and layout for the whole site
build.py                Fills data-driven pages from the data/ folder
CNAME                   Tells GitHub our domain is oumun.org (do not delete)

data/                   The files you edit most often
  officers.json           Executive team + Board of Trustees
  attended.json           Conferences we attend, by year
  hs-awards.json          Awards from our high school conference

static/                 Pages written by hand (just edit the HTML)
  about.html  contact.html  new-to-mun.html  social.html  search.html

variable/               Pages that are filled in from data/
  officers.html  conferences-we-attend.html  high-school-conference.html
  events.html             (written by hand, see Events page)

scripts/                The site's JavaScript
  script.js               Menus and fade-in effects
  map.js                  The countries map
  search.js               The search page
  flickr.js               The latest-photos strip on the Social page

images/                 Every photo and logo
downloads/              Files people can download
.github/workflows/      The publishing recipe (pages.yml)
```

### How pages built from data work

Open `variable/officers.html` and look for these two lines:

```html
<!-- BUILD:officers -->
<!-- /BUILD:officers -->
```

Everything between those lines is generated from `data/officers.json` every time the site is published. **Do not type anything between them.** Change the data (JSON) file instead.

---

## Making and publishing a change

### On GitHub (no software needed)

1. Open the file on GitHub (for example `data/officers.json`).
2. Click the **pencil icon** (Edit this file).
3. Make your change.
4. Click **Commit changes**, write a short description of what you changed, and confirm.
5. Open the **Actions** tab and watch the run. It takes a minute or two. Green check = your change is live.

> Small text changes can be committed straight to `main`, however, bigger changes must go on a branch and will need another officer to approve a pull request to push a large change to the website.

**Which branches go live?** Look at the `branches:` line in `.github/workflows/pages.yml`. A push to any branch listed there publishes the live site, so do not use those branches for experiments.

### Uploading an image on GitHub

1. Open the `images` folder.
2. Click **Add file → Upload files**, drag the picture in, and commit.
3. Use the exact file name in your data file or HTML (see [Adding images](#adding-images)).

---

## Editing the data files

These files are JSON. It looks annoying but follows a few simple rules:

- Text goes in **straight double quotes**: `"like this"`.
- Items in a list are separated by **commas**, but there is **no comma after the last item**.
- To put a quotation mark *inside* text, write `\"`.
- Text must stay on **one line**. Press Enter inside a quote and the file breaks.
- Copy an existing block and change the words. That is the safest way to add something new.

If you make a typo, the publish step stops and tells you the line and column. The live site stays as it was, so nothing breaks for visitors.

### Officers (`data/officers.json`)

There are two groups, `executive` and `board`. Each person looks like this:

```json
{
  "name": "John Smith",
  "role": "President",
  "photo": "president.png",
  "bio": "A short bio that appears when someone hovers over or taps the photo."
}
```

- **`name`** and **`role`** are required.
- **`photo`** is the file name in `images/`. Leave this line out to use the default placeholder photo.
- **`bio`** is optional. If it is left out, the card shows "Short Biography".
- **`alt`** is optional: a description of the photo for screen readers. The default is "Photo of [name]".
- People appear in the order they are listed. Reorder by moving the block.
- To mark a seat as open, use `"name": "Vacant"`.

The `photo` file must exist in `images/`. If it does not, the publish step stops and names the missing file.

### Conferences we attend (`data/attended.json`)

Each conference has a list of years. To add a new year, copy an existing year block and change it:

```json
{
  "year": "2027",
  "dates": "November 13th, 2027",
  "location": "Tulsa, OK",
  "delegation_size": "16",
  "awards_won": "12",
  "recap": "A paragraph about how the conference went.",
  "awards": [
    { "award": "Outstanding Delegate", "winner": "Full Name", "committee": "Committee name" }
  ],
  "photos": [
    { "file": "oru-2027-1.jpg", "alt": "Describe the photo", "caption": "Optional caption" }
  ]
}
```

- Years are sorted automatically, **newest first**, and the newest year starts expanded on the page.
- **`recap`** can be one paragraph in quotes, or a list of paragraphs: `["First paragraph.", "Second paragraph."]`.
- **`awards_won`** is optional. If you leave it out, the page counts the awards in your list.
- Any field you do not need (photos, awards, recap) can be left out.
- Photo **file names must match exactly**, including capital letters (`IMG.JPG` is not the same as `img.jpg`). A wrong name shows a broken image; the build will not warn you.

To add a whole new conference, copy an entire conference block (the part with `"id"`, `"name"`, `"description"`, and `"years"`).

### High school awards (`data/hs-awards.json`)

```json
{
  "year": "2027",
  "awards": [
    { "award": "Best Delegate", "winner": "Full Name, School", "committee": "Committee name" }
  ]
}
```

Newest year first, as above.

---

## Editing pages by hand

Pages in `static/` (and `index.html`) are plain HTML. Find the text you want to change and edit it. A few tips:

- Change only the words and leave the `<tags>` around them alone.
- A paragraph looks like `<p>Your text here.</p>`.
- The site menu and footer appear on **every** page (see [Adding a new page](#adding-a-new-page)).
- There are few pages that will need an edit year-round that isn't covered by the `JSON` files in the `data` folder.
- The website is formatted so that `static` folder items rarely need updates, and `variable` folder items may need attention throughout the year.

---

## Events page

`variable/events.html` is a plain HTML page. Each event is one `<section>` block:

```html
<section class="content attend-section" id="halloween-conference">
  <h2>Halloween Conference</h2>
  <p class="lead">One or two sentences about the event.</p>
</section>
```

To add an event:

1. Copy one whole `<section>...</section>` block.
2. Give it a new, unique `id` (lowercase, with dashes).
3. Change the heading and text.
4. Add a matching link to the jump line near the top of the page: `<a href="#your-id">Event name</a>`.

The first event contains a commented-out template you can copy from, for dates, a paragraph, a sign-up button, and photos.

---

## Latest photos (Flickr)

The Social page has a "Latest photos" band that shows the 3 newest photos from our Flickr account. It updates by itself: upload photos to Flickr, and they appear on the site.

- **Flickr account:** Use the Gmail account associated with the OUMUN club.
- **To change which account is shown, or how many photos:** open `static/social.html` and find the line with `id="flickr-feed"`. It has three settings:
  - `data-flickr-id`: the account's Flickr ID (looks like `12345678@N00`)
  - `data-count`: how many photos to show
  - `data-tag`: optional. Only show photos with this tag (for example `oumun`).
- Only **public** photos appear.
- The band stays hidden if no ID is set or Flickr cannot be reached, so visitors never see something broken.
- Free Flickr accounts have a limit of 1,000 photos in total. 
- Photos are shown as squares. Give these a title, because the title is used as the picture's description for screen readers.

---

## The countries map

The map on the home page highlights the countries we have represented. To update it, open `scripts/map.js` and add the country's name to the `REPRESENTED` list near the top. Use the name exactly as the map spells it, in quotes with a comma after it.

---

## Adding images

- Put pictures in the `images/` folder.
- **Keep them small.** Aim for under about 500 KB and about 1600 pixels wide. Big phone photos slow the site down for everyone. A free tool like [Squoosh](https://squoosh.app) can shrink a photo in seconds.
- Use simple names with no spaces: `oru-2027-1.jpg`, not `IMG 4821 (final).JPG`.
- Always write a short description (`alt`) for each photo. It helps people using screen readers.
- Photos of people: Make sure that everyone consents, especially if they have left the organization.

---

## Adding a new page (this is a lengthy process!)

1. **Copy** a similar page: from `static/` for a page you will write by hand, or from `variable/` for one filled from data.
2. Change the page title, the heading, and the content. Also update the `og:title`, `og:description`, and `og:url` lines near the top (they control how the page looks when shared).
3. Keep `<main data-pagefind-body>`. It is what makes the page searchable.
4. **Add it to the menu and footer on every page.** The menu and footer are copied into each page, so a new link has to be added in each one. Search the project for an existing link (for example `new-to-mun.html`) to find every place.
5. Mark the new page's own link in the menu with `class="active"` on that page only, so it is highlighted.

---

## Previewing changes on your computer (optional)

Not needed for simple edits. If you want to see a change before publishing:

1. Install [Python 3](https://www.python.org/downloads/) and download or clone the repository.
2. In a terminal, from the project folder, run `python3 build.py` (or `python build.py` on Windows). This fills in the data-driven pages.
3. Run `python3 -m http.server 8000`, then open http://localhost:8000.

Notes:

- **Search does not work locally.** The search index is built only when the site is published. The search page will say so.
- Running `build.py` edits the HTML files in `variable/`. You do not need to commit those changes, because the publish step does it again. To undo them: `git checkout variable/`.
- The Flickr photos only appear once a real Flickr ID is set, and only when your computer can reach Flickr.

---

## Troubleshooting

**The Actions run has a red X.**
Click the run, open the failed step, and read the message. Messages from `build.py` start with *"The pages were NOT updated"* and list each problem in plain English, such as a missing name, a missing photo file, or a typo in a data file (with the line number). Fix it, commit again, and it will re-run.

**I made a change but the site looks the same.**
Wait for the green check in Actions, then hard-refresh your browser (Ctrl+Shift+R, or Cmd+Shift+R on a Mac).

**A photo shows as a broken image.**
Check that the file is in `images/` and that the name matches exactly, including capital letters and the file extension (`.jpg` vs `.jpeg` vs `.png`).

**An officer card shows a broken image.**
If no `photo` is listed, cards use `images/officer-placeholder.JPG`.

**A data-driven page is blank or says "BUILD" in the code.**
The page has not been built yet. Publishing runs `build.py` automatically. Make sure the two `BUILD` lines are still in the file and haven't been deleted.

**The custom domain stopped working.**
Do not delete the `CNAME` file. Check **Settings → Pages** on GitHub. The club manages the domain at Cloudflare registar. 

---

## Look and feel (CSS)

- **Colors** (set at the top of `styles.css`): crimson `#841617`, dark crimson `#4e0002`, light tint `#f5ecec`, gray `#323232`.
- **Fonts:** Montserrat for text and Playfair Display for headings, both from Google Fonts.
- Change a color once in `styles.css` and it changes everywhere.

---

## Accounts and contacts

| What | Details |
| --- | --- |
| GitHub organization | OklahomaMUNOrg. Owners: The OUMUN Executive Team |
| Repository | OUMUN |
| Domain (oumun.org) | Registrar: https://www.cloudflare.com/domains/. Renewal date: November 16th, 2027 |
| Team email | oklahomamodelun@gmail.com. Managed by: The OUMUN Executive Team |
| Instagram | @oklahoma_model_un. Managed by: The OUMUN Executive Team |
| Flickr | [OUMUN]. Managed by: The OUMUN Executive Team |
| Who to ask for help | Joseph Pittenger, joepittenger38@gmail.com |

---

## Officer handoff checklist

When the website duty passes to a new officer:

- [ ] Add the new officer to the GitHub organization with edit access
- [ ] Remove access for officers who have left
- [ ] Share the team's logins (domain, Flickr, Instagram) 
- [ ] Update `data/officers.json` with the new executive team and Board of Trustees
- [ ] Add last year's conference results to `data/attended.json` and `data/hs-awards.json`
- [ ] Update the countries map in `scripts/map.js`
- [ ] Review the Events page for dates and details
- [ ] Walk the new officer through one real edit and check it publishes (green check in Actions)
- [ ] Update the contacts in this README