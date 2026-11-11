PROFINITI SOLUTIONS WEBSITE - HOW TO LOOK AFTER IT
===================================================

1. WHAT EACH FILE IS
--------------------
index.html         The whole website page. All the words you see are in here.
css/style.css      Colours, fonts and layout. (Accent colour: --cy near the top.)
js/main.js         Side-scrolling, section dots, menu, animations. No need to edit.
js/hero-dots.js    The moving "connected dots" animation at the top of the page.
                   Easy settings (number of dots, colours, speed) are at the top.
assets/            Logo mark, favicon (browser tab icon) and social-share image.
fonts/             Usuzi brand font used for the company name (+ its licence file).
.htaccess          Server security: forces https, blocks private files. Hidden file.
robots.txt         Tells search engines what to index.
sitemap.xml        Page list for search engines.
README.txt         This file (blocked from public view).

The site has no contact form. Visitors reach you by email links
(info@profiniti.net, shown in the footer) and WhatsApp. No server
settings are needed - it is plain files only.

UPLOAD: copy everything (including the hidden .htaccess file) into public_html
in cPanel File Manager. In File Manager settings tick "Show Hidden Files".

2. HOW TO EDIT TEXT
-------------------
Open index.html in cPanel File Manager (right-click > Edit).
The page is split into blocks marked like:
    <!-- ===== SECTION: Solutions ... ===== -->
Find the section, change only the words between the tags, e.g.
    <h3>SOLAR & POWER</h3>      ->  change "SOLAR & POWER"
Do not delete the < > tags themselves. Save, then refresh the site
(Ctrl+F5) to see the change.
The contact details live in:  SECTION: Footer + Contact

3. WHATSAPP & SOCIAL LINKS
--------------------------
WhatsApp: the green round button (SECTION: Floating WhatsApp button)
has href="#" as a placeholder. Replace it with your chat link, e.g.
  href="https://wa.me/923001234567"  (country code + number, digits only)
LinkedIn in the footer points to:
  https://www.linkedin.com/company/profinitisolutions
To change it, edit that href value in index.html.

4. BUTTONS
----------
"Talk to us" and the "Contact" menu item all scroll down to the footer contact details.
The only email shown is info@profiniti.net (footer, plain text - not a link). To change it, search
index.html for  info@profiniti.net.
LinkedIn is already set (see section 3 above).
"Since 2023" appears in the hero label and the footer copyright line.

4b. QUOTE FORM
--------------
The "Request a Quote" button under the SLA plans scrolls to the quote form
(SECTION: Quote / contact form). Fields: name, company, email, phone,
subject (must be chosen before SUBMIT is enabled), message and a consent box
(must be ticked). EMAIL SENDING IS NOT CONNECTED YET: the form only checks
the fields and shows "Thank you - we will be in touch." Nothing is sent.
To connect it later, see the TODO comment in js/main.js (QUOTE FORM block).
To change subject options, edit the <option> lines in index.html.

5. HERO ANIMATION
-----------------
Open js/hero-dots.js. At the top, under EASY SETTINGS, you can change
countDesktop / countMobile (number of dots), speed, colours etc.
The dots always move (even if the device has animation effects turned off)
and react to the mouse: they are pushed away and lines connect to the cursor.
mousePush = push strength, mouseRadius = reach, minDots = lowest dot count
on slow PCs.

6. SHOWING HIDDEN SECTIONS AGAIN
--------------------------------
Hidden items carry the word  is-hidden  in index.html.
 - Industries section: remove  is-hidden  from
       <section id="industries" class="wrap sec is-hidden">
   AND from the menu link  <a href="#industries" class="is-hidden">
 - "Qualified Staff" box (About section): remove  is-hidden  from
       <div class="reveal is-hidden"><h4>QUALIFIED STAFF</h4>
To hide anything else, add  is-hidden  to its class="..." list.
(Section numbers like "05 /" are plain text - adjust them if you re-show.)
