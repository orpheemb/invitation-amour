/*
  Statistiques privées et anonymes (GoatCounter : gratuit, sans cookies).
  Rien de personnel n'est envoyé : ni prénoms, ni numéros de téléphone, ni adresse complète de la page.
  Le tableau de bord n'est visible que par le propriétaire du compte GoatCounter.

  Pour activer : écrire le code du compte GoatCounter entre les guillemets ci-dessous
  (si ton tableau de bord est https://icc-moanda.goatcounter.com, le code est icc-moanda).
  Laisser vide = statistiques désactivées.

  Pour ne pas compter tes propres tests : ouvre une fois la page avec #pas-compter à la fin de l'adresse
  (et refais-le pour recompter tes visites).
*/
(() => {
  "use strict";
  const CODE = "orpheemb";

  window.ddaTrack = function () {};
  if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(CODE)) return;

  const KEY = "dda-skip";

  // Mention de transparence, discrète, en bas de page.
  const note = () => {
    const main = document.querySelector("main");
    if (!main) return;
    const p = document.createElement("p");
    p.textContent = "Visites comptées de façon anonyme, sans cookies.";
    p.style.cssText = "margin:20px 2px 0;color:var(--muted);font-size:13px;font-weight:600";
    main.insertBefore(p, main.querySelector(".bar"));
  };
  note();

  // Interrupteur pour ne pas compter ses propres visites sur cet appareil.
  try {
    if (location.hash === "#pas-compter") {
      const off = localStorage.getItem(KEY) !== "1";
      if (off) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY);
      history.replaceState(null, "", location.pathname + location.search);
      alert(off ? "Tes visites ne sont plus comptées sur cet appareil." : "Tes visites sont de nouveau comptées sur cet appareil.");
    }
  } catch (e) {}

  let skip = false;
  try { skip = localStorage.getItem(KEY) === "1"; } catch (e) {}
  if (skip || navigator.webdriver || window.top !== window || location.protocol === "file:" ||
      /^(localhost$|127\.|10\.|192\.168\.|0\.0\.0\.0$)/.test(location.hostname)) return;

  // Envoi d'un comptage à GoatCounter (même adresse et mêmes paramètres que son script officiel,
  // mais SANS l'adresse complète de la page, qui peut contenir des prénoms et un numéro).
  // ns=true : chaque ouverture et chaque action est comptée (sinon GoatCounter ne compte qu'une fois
  // par visiteur, et plusieurs cartes créées à la suite par la même personne n'en feraient qu'une).
  const send = (path, title, isEvent, referrer) => {
    const q = new URLSearchParams({
      p: path,
      t: title || path,
      s: String(window.screen && window.screen.width || 0),
      ns: "true",
      rnd: Math.random().toString(36).slice(2, 7)
    });
    if (isEvent) q.set("e", "true");
    if (referrer) q.set("r", referrer);
    const url = "https://" + CODE + ".goatcounter.com/count?" + q;
    try { if (navigator.sendBeacon && navigator.sendBeacon(url)) return; } catch (e) {}
    try { new Image().src = url; } catch (e) {}
  };

  // Évènements (carte créée, message copié, vidéo lue, « Je viens »...).
  window.ddaTrack = (name, title) => send(String(name).replace(/^\/+/, ""), title, true);

  // Visite de la page : chemin sans prénoms ni numéros, provenance sans paramètres.
  const path = (location.pathname.replace(/^\/invitation-amour/, "") || "/").replace(/index\.html$/, "");
  let ref = "";
  try {
    if (document.referrer) {
      const u = new URL(document.referrer);
      ref = u.origin + u.pathname;
    }
  } catch (e) {}
  const view = () => send(path, document.title, false, ref);
  if (document.visibilityState === "hidden") {
    document.addEventListener("visibilitychange", function f() {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", f);
      view();
    });
  } else {
    view();
  }
})();
