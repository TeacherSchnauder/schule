/* =====================================================================
   Lernplattform – gemeinsames Skript
   ---------------------------------------------------------------------
   Erzeugt Kopfnavigation, Breadcrumbs, Kachelübersichten und Fußzeile
   aus data/inhalte.js. Reines Vanilla-JavaScript, kein Build-System,
   keine externen Abhängigkeiten, kein fetch – die Seiten funktionieren
   deshalb sowohl auf GitHub Pages als auch beim lokalen Öffnen.

   Jede Seite meldet sich am Ende mit  Schule.seite({...})  an:
     tiefe : Anzahl der Ordnerebenen unter der Wurzel (Startseite = 0)
     typ   : "start" | "fach" | "bereich" | "thema"
     id    : id aus inhalte.js (bei "start" leer)
   ===================================================================== */

(function () {
  "use strict";

  var SYMBOLE = {
    fabrik:   '<path d="M3 21V9l6 4V9l6 4V4h6v17H3z"/>',
    buch:     '<path d="M4 4h9a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4V4z"/><path d="M20 4h-3a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h3V4z"/>',
    diagramm: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    globus:   '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18-2.6-2.6-2.6-15.4 0-18z"/>',
    waage:    '<path d="M12 3v18M7 21h10M3 8h18M3 8l-2 6h4L3 8zm18 0l-2 6h4l-2-6z"/>',
    raster:   '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    haken:    '<path d="M4 13l5 5L20 6"/>',
    werkzeug: '<path d="M14 6a4 4 0 1 0 4 4l3 3-4 4-3-3a4 4 0 0 0-4-4L4 4 7 1l3 6z"/>',
    ordner:   '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
    seite:    '<path d="M6 3h8l4 4v14H6V3z"/><path d="M14 3v4h4"/>',
    lkw:      '<path d="M2 7h11v9H2zM13 10h4l4 3v3h-8z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>'
  };

  function svg(name) {
    var d = SYMBOLE[name] || SYMBOLE.seite;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  function esc(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var D = window.INHALTE || { faecher: [], bereiche: [], themen: [] };
  var cfg = { tiefe: 0, typ: "start", id: "" };
  var wurzel = "";   // relativer Weg zur Wurzel, z. B. "../../"

  function finde(liste, id) {
    for (var i = 0; i < liste.length; i++) if (liste[i].id === id) return liste[i];
    return null;
  }
  function themenIn(bereichId) {
    return D.themen.filter(function (t) { return t.bereich === bereichId; });
  }
  function themenFuerFach(fachId) {
    return D.themen.filter(function (t) { return (t.faecher || []).indexOf(fachId) !== -1; });
  }
  function bereicheIn(fachId) {
    return D.bereiche.filter(function (b) { return b.fach === fachId; });
  }

  /* ----------------------------- Kopf ----------------------------- */
  function kopf() {
    var el = document.getElementById("kopf");
    if (!el) return;
    var aktiv = cfg.typ === "start" ? "" : (cfg.typ === "fach" ? cfg.id : wurzelFachVon());
    var links = D.faecher.map(function (f) {
      var cur = f.id === aktiv ? ' aria-current="page"' : "";
      return '<a href="' + wurzel + esc(f.ordner) + '/"' + cur + '>' + esc(f.name) + "</a>";
    }).join("");

    el.innerHTML =
      '<header class="kopf">' +
        '<div class="kopf-inner">' +
          '<a class="marke" href="' + wurzel + '">' +
            svg("buch") +
            '<span>' + esc(D.seitentitel || "Lernplattform") +
              '<small>' + esc(D.untertitel || "") + '</small>' +
            '</span>' +
          '</a>' +
          '<button class="nav-schalter" type="button" aria-expanded="false" aria-controls="hauptnav">Menü</button>' +
          '<nav class="nav" id="hauptnav" aria-label="Fächer">' + links + '</nav>' +
        '</div>' +
      '</header>';

    var btn = el.querySelector(".nav-schalter");
    var nav = el.querySelector(".nav");
    btn.addEventListener("click", function () {
      var offen = nav.classList.toggle("offen");
      btn.setAttribute("aria-expanded", offen ? "true" : "false");
    });
  }

  function wurzelFachVon() {
    if (cfg.typ === "bereich") {
      var b = finde(D.bereiche, cfg.id);
      return b ? b.fach : "";
    }
    if (cfg.typ === "thema") {
      var t = finde(D.themen, cfg.id);
      var br = t ? finde(D.bereiche, t.bereich) : null;
      return br ? br.fach : "";
    }
    return "";
  }

  /* -------------------------- Breadcrumbs ------------------------- */
  function krumen() {
    var el = document.getElementById("krumen");
    if (!el) return;

    var teile = [{ name: "Startseite", href: wurzel }];

    if (cfg.typ === "fach") {
      teile.push({ name: (finde(D.faecher, cfg.id) || {}).name || cfg.id });
    } else if (cfg.typ === "bereich") {
      var b = finde(D.bereiche, cfg.id) || {};
      var f = finde(D.faecher, b.fach) || {};
      teile.push({ name: f.name, href: wurzel + f.ordner + "/" });
      teile.push({ name: b.name });
    } else if (cfg.typ === "thema") {
      var t = finde(D.themen, cfg.id) || {};
      var br = finde(D.bereiche, t.bereich) || {};
      var fa = finde(D.faecher, br.fach) || {};
      teile.push({ name: fa.name, href: wurzel + fa.ordner + "/" });
      teile.push({ name: br.name, href: wurzel + br.ordner + "/" });
      teile.push({ name: t.name });
    }

    var html = teile.map(function (p, i) {
      var letzte = i === teile.length - 1;
      var stueck = letzte || !p.href
        ? '<span aria-current="page">' + esc(p.name) + "</span>"
        : '<a href="' + esc(p.href) + '">' + esc(p.name) + "</a>";
      return (i ? '<span class="trenn" aria-hidden="true">&rsaquo;</span>' : "") + stueck;
    }).join("");

    el.innerHTML = '<nav class="krumen" aria-label="Sie sind hier">' +
                     '<div class="krumen-inner">' + html + "</div>" +
                   "</nav>";
  }

  /* ---------------------------- Kacheln --------------------------- */
  function kachel(o) {
    var symbol = '<span class="kachel-symbol">' + svg(o.icon) + "</span>";
    var material = o.material && o.material.length
      ? '<div class="material">' + o.material.map(function (m) { return "<span>" + esc(m) + "</span>"; }).join("") + "</div>"
      : "";

    if (o.status === "geplant" || !o.href) {
      return '<li class="kachel geplant"><div class="inaktiv">' + symbol +
             "<h3>" + esc(o.name) + "</h3><p>" + esc(o.kurz) + "</p>" +
             '<span class="marke-status">in Vorbereitung</span></div></li>';
    }
    return '<li class="kachel"><a href="' + esc(o.href) + '">' + symbol +
           "<h3>" + esc(o.name) + "</h3><p>" + esc(o.kurz) + "</p>" + material +
           '<span class="pfeil">Öffnen &rarr;</span></a></li>';
  }

  function liste(el, eintraege) {
    if (!eintraege.length) {
      el.outerHTML = '<p class="lead">Für diesen Bereich sind noch keine Materialien veröffentlicht.</p>';
      return;
    }
    el.className = "kacheln";
    el.innerHTML = eintraege.map(kachel).join("");
  }

  function kachelflaechen() {
    var behaelter = document.querySelectorAll("[data-kacheln]");
    Array.prototype.forEach.call(behaelter, function (el) {
      var art = el.getAttribute("data-kacheln");
      var id = el.getAttribute("data-id") || cfg.id;

      if (art === "faecher") {
        liste(el, D.faecher.map(function (f) {
          return { name: f.name, kurz: f.kurz, icon: f.icon, status: f.status,
                   href: wurzel + f.ordner + "/" };
        }));

      } else if (art === "bereiche") {
        liste(el, bereicheIn(id).map(function (b) {
          return { name: b.name, kurz: b.kurz, icon: "ordner", status: b.status,
                   href: b.status === "aktiv" ? wurzel + b.ordner + "/" : null };
        }));

      } else if (art === "themen") {
        liste(el, themenIn(id).map(themaZuKachel));

      } else if (art === "themen-fach") {
        liste(el, themenFuerFach(id).map(themaZuKachel));

      } else if (art === "veroeffentlicht") {
        liste(el, D.themen.filter(function (t) { return t.status === "aktiv"; }).map(themaZuKachel));
      }
    });
  }

  function themaZuKachel(t) {
    return {
      name: t.name, kurz: t.kurz, icon: t.icon || "seite", status: t.status,
      material: t.material,
      href: t.status === "aktiv" && t.pfad ? wurzel + t.pfad + "/" : null
    };
  }

  /* ------------------------------ Fuß ----------------------------- */
  function fuss() {
    var el = document.getElementById("fuss");
    if (!el) return;
    var jahr = new Date().getFullYear();
    el.innerHTML =
      '<footer class="fuss"><div class="fuss-inner">' +
        "<div>" + esc(D.seitentitel || "Lernplattform") + " &middot; Unterrichtsmaterial &middot; " + jahr + "</div>" +
        '<div><a href="' + wurzel + '">Startseite</a></div>' +
      "</div></footer>";
  }

  /* ----------------------------- Start ---------------------------- */
  window.Schule = {
    seite: function (c) {
      cfg = { tiefe: (c && c.tiefe) || 0, typ: (c && c.typ) || "start", id: (c && c.id) || "" };
      wurzel = cfg.tiefe ? new Array(cfg.tiefe + 1).join("../") : "./";
      kopf();
      krumen();
      kachelflaechen();
      fuss();
    },
    wurzel: function () { return wurzel; },
    symbol: svg
  };
})();
