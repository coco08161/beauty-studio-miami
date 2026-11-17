# Beauty Studio Miami

Website for Beauty Studio Miami (8250 Bird Road, Miami): luxury salon suite rentals plus hair, nail, makeup and waxing services. Plain HTML, CSS, and JS. No build step.

Converted from the Wix Studio design ("My Site 3") and polished.

## Pages
- `index.html`: home (video hero, services, features, about teaser, visit + map, reserve CTA)
- `services.html`: hair, nails, makeup, waxing as stacking cards
- `rent.html`: suite story + suite application form
- `about.html`: vision, services supported, values
- `thank-you.html`: shown after the form is sent
- `404.html`: GitHub Pages not-found page

## Motion and effects
- **GSAP 3.12.5 + ScrollTrigger** from cdnjs: scroll reveals, hero intro, card stack, scroll-highlighted text, parallax, magnetic buttons, scroll progress bar.
- Effects modeled on **Skiper UI** (words preloader, text-roll nav links, card stack scroll, text scroll reveal, expand-on-hover panels) and **Componentry** (scroll-velocity marquee, magnetic buttons, animated WebGL gradient background). They are rewritten in plain JS here; no React needed.
- Everything respects "reduce motion" settings. If GSAP fails to load, the content still shows.

## Before launch
- **Form email.** `rent.html` posts to FormSubmit (`formsubmit.co`) and emails stephanie@cmgproducts.net. The first submission sends an activation email to that inbox. Click the link once and later submissions arrive normally. FormSubmit only accepts submissions from a live site (not from `file://`), so test it after the site is published.
- **Stock photos.** `assets/img/hair.jpg`, `nails.jpg`, `makeup.jpg`, `waxing.jpg` and `hands.jpg` are Wix stock images from the original design. Wix's media license only covers use on Wix sites, so swap these for the studio's own photos or free-license photos (Unsplash, Pexels) before going live.
- **Testimonials.** The Wix design had placeholder quotes ("This is your Testimonial quote…"), so they were left out. Add real client reviews when available.
- The videos and logo in `assets/` are the studio's own uploads from the Wix site.

## Hosting
Works on GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.
To use a custom domain, add it under Settings → Pages and create a `CNAME` file with the domain.
