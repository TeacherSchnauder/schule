/* =====================================================================
   Zentrale Inhaltsübersicht der Lernplattform
   ---------------------------------------------------------------------
   Diese Datei ist die EINZIGE Stelle, an der neue Fächer, Themenbereiche
   und Themen eingetragen werden. Navigation, Kacheln auf der Startseite,
   Fachübersichten und Breadcrumbs werden daraus automatisch erzeugt.

   Neues Thema anlegen – drei Schritte:
   1. Ordner anlegen, z. B.  wirtschaft/beschaffung/abc-analyse/
   2. index.html aus einem bestehenden Thema kopieren und anpassen
   3. Unten bei "themen" den Eintrag von status "geplant" auf "aktiv"
      setzen bzw. einen neuen Eintrag ergänzen.

   status: "aktiv"   -> Kachel ist verlinkt
           "geplant" -> Kachel wird grau dargestellt, nicht verlinkt
   ===================================================================== */

window.INHALTE = {

  seitentitel: "Lernplattform",
  untertitel: "Unterrichtsmaterial Wirtschaft und Recht",

  /* ---------------- Fächer / Bereiche der Startseite ---------------- */
  faecher: [
    { id: "wirtschaft", name: "Wirtschaft", ordner: "wirtschaft", icon: "fabrik",
      kurz: "Betriebliche Leistungsprozesse von der Beschaffung bis zur Finanzierung.",
      status: "aktiv", rolle: "fach" },

    { id: "awl", name: "AWL", ordner: "awl", icon: "buch",
      kurz: "Allgemeine Wirtschaftslehre – Berufsschule, Verwaltungsfachangestellte.",
      status: "aktiv", rolle: "sammlung" },

    { id: "bwl", name: "BWL", ordner: "bwl", icon: "diagramm",
      kurz: "Betriebswirtschaftslehre – Unternehmen als Handlungseinheit.",
      status: "aktiv", rolle: "sammlung" },

    { id: "vwl", name: "VWL", ordner: "vwl", icon: "globus",
      kurz: "Volkswirtschaftslehre – Märkte, Konjunktur, Wirtschaftspolitik.",
      status: "aktiv", rolle: "sammlung" },

    { id: "rechtslehre", name: "Rechtslehre", ordner: "rechtslehre", icon: "waage",
      kurz: "Rechtsgeschäfte, Vertragsrecht, Verwaltungsrecht.",
      status: "aktiv", rolle: "sammlung" },

    { id: "ggk", name: "GGK", ordner: "ggk", icon: "globus",
      kurz: "Geschichte mit Gemeinschaftskunde – Politik und Geschichte.",
      status: "aktiv", rolle: "fach" },

    { id: "lernfelder", name: "Lernfelder", ordner: "lernfelder", icon: "raster",
      kurz: "Lernfeldbezogene Materialien der Berufsschule.",
      status: "aktiv", rolle: "sammlung" },

    { id: "pruefungsvorbereitung", name: "Prüfungsvorbereitung", ordner: "pruefungsvorbereitung", icon: "haken",
      kurz: "Abituraufgaben, Abschlussprüfungen, Wiederholung.",
      status: "aktiv", rolle: "sammlung" },

    { id: "methodenkoffer", name: "Methodenkoffer", ordner: "methodenkoffer", icon: "werkzeug",
      kurz: "Arbeitstechniken, Präsentation, wissenschaftliches Arbeiten.",
      status: "aktiv", rolle: "sammlung" }
  ],

  /* ---------------- Themenbereiche innerhalb eines Fachs ------------ */
  bereiche: [
    { id: "beschaffung", fach: "wirtschaft", name: "Beschaffung",
      ordner: "wirtschaft/beschaffung", status: "aktiv",
      kurz: "Bedarfsermittlung, Lieferantenauswahl, Lagerhaltung und Warenumschlag." },

    { id: "produktion", fach: "wirtschaft", name: "Produktion", status: "geplant",
      kurz: "Fertigungsverfahren, Fertigungstypen, Produktionsplanung." },

    { id: "absatz", fach: "wirtschaft", name: "Absatz", status: "geplant",
      kurz: "Marktforschung, Marketinginstrumente, Absatzwege." },

    { id: "personal", fach: "wirtschaft", name: "Personal", status: "geplant",
      kurz: "Personalbedarf, Personalbeschaffung, Entlohnung, Mitbestimmung." },

    { id: "finanzierung", fach: "wirtschaft", name: "Finanzierung", status: "geplant",
      kurz: "Finanzierungsarten, Kreditsicherheiten, Investitionsrechnung." },

    { id: "logistik", fach: "wirtschaft", name: "Logistik", status: "geplant",
      kurz: "Transport, Lager, Distribution, Supply Chain Management." },

    { id: "ggk-politik", fach: "ggk", name: "Politik",
      ordner: "ggk/politik", status: "aktiv",
      kurz: "Politisches System, Parteien und Wahlen, Teilhabe und Willensbildung." },

    { id: "ggk-geschichte", fach: "ggk", name: "Geschichte",
      ordner: "ggk/geschichte", status: "geplant",
      kurz: "Historische Themen des Bildungsplans." }
  ],

  /* ---------------- Einzelne Themen (Inhaltsseiten) ----------------- */
  themen: [
    {
      id: "cross-docking",
      name: "Cross-Docking",
      bereich: "beschaffung",
      pfad: "wirtschaft/beschaffung/cross-docking",
      status: "aktiv",
      kurz: "Warenumschlag ohne Lagerung – mit interaktivem Rechner für Direktbelieferung sowie ein- und mehrstufiges Cross-Docking.",
      faecher: ["wirtschaft", "bwl", "awl"],
      material: ["Interaktiver Rechner", "Ablaufgrafik", "Merkkasten"]
    },
    { id: "just-in-time", name: "Just-in-Time", bereich: "beschaffung", status: "geplant",
      kurz: "Fertigungssynchrone Beschaffung ohne eigene Lagerhaltung.",
      faecher: ["wirtschaft", "bwl"] },
    { id: "just-in-sequence", name: "Just-in-Sequence", bereich: "beschaffung", status: "geplant",
      kurz: "Anlieferung in der Reihenfolge der Fertigung.",
      faecher: ["wirtschaft", "bwl"] },
    { id: "abc-analyse", name: "ABC-Analyse", bereich: "beschaffung", status: "geplant",
      kurz: "Einteilung der Güter nach ihrem Wertanteil am Gesamtverbrauch.",
      faecher: ["wirtschaft", "bwl", "awl"] },
    { id: "make-or-buy", name: "Make-or-Buy", bereich: "beschaffung", status: "geplant",
      kurz: "Eigenfertigung oder Fremdbezug – Kostenvergleich und qualitative Kriterien.",
      faecher: ["wirtschaft", "bwl"] },

    {
      id: "wahlprogramme-2025",
      name: "Wahlprogramme 2025 zuordnen",
      bereich: "ggk-politik",
      pfad: "ggk/politik/wahlprogramme-2025",
      status: "aktiv",
      kurz: "Wer schrieb das? Aussagen aus sechs Wahlprogrammen zur Bundestagswahl 2025 den Parteien zuordnen – mit Vergleichsübersicht und Arbeitsaufträgen.",
      faecher: ["ggk"],
      material: ["Zuordnungsspiel", "Vergleichstabelle", "Arbeitsaufträge"]
    }
  ]
};
