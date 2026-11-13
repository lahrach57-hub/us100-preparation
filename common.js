// Outils partages : navigation, journal (enregistre dans ce navigateur), heures de Paris.
const JKEY = "journal_us100_v1";
const Journal = {
  all(){ try { return JSON.parse(localStorage.getItem(JKEY) || "{}"); } catch(e){ return {}; } },
  get(date){ return this.all()[date] || null; },
  save(date, entry){
    const a = this.all(); a[date] = entry;
    try { localStorage.setItem(JKEY, JSON.stringify(a)); return true; } catch(e){ return false; }
  },
  replaceAll(obj){ try { localStorage.setItem(JKEY, JSON.stringify(obj)); return true; } catch(e){ return false; } }
};
const LABELS = ["haussier","baissier","neutre","pas de biais exploitable"];
const todayParis = () => new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Paris"});
const nowParisHM = () => new Date().toLocaleTimeString("fr-FR",{timeZone:"Europe/Paris",hour:"2-digit",minute:"2-digit"});
const nowParisFull = () => new Date().toLocaleString("fr-FR",{timeZone:"Europe/Paris"});
// open_paris : "15:30" (ou "14:30" les semaines de decalage)
const beforeOpen = openParis => nowParisHM() < (openParis || "15:30");
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const frShort = iso => new Date(iso+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"});

function navHTML(active){
  const items = [["index.html","Préparation"],["journal.html","Journal"],["tableau.html","Tableau de bord"]];
  return items.map(([h,l]) => `<a href="${h}" class="${active===h?"on":""}">${l}</a>`).join("");
}

// Formulaire de lecture du matin. onSaved() est appele apres l'enregistrement.
function journalFormHTML(date, openParis){
  const late = !beforeOpen(openParis);
  return `<form id="jform" class="jform">
    ${late ? `<div class="banner warn">Il est ${nowParisHM()} : la séance US est ouverte. Une lecture saisie maintenant sera notée « après l'ouverture » et ne comptera pas dans le tableau de bord.</div>` : ""}
    <fieldset><legend>Ma lecture du jour</legend>
      ${LABELS.map(l => `<label class="opt"><input type="radio" name="lecture" value="${l}" required> ${cap(l)}</label>`).join("")}
    </fieldset>
    <fieldset><legend>Ma conviction</legend>
      ${["faible","moyenne","forte"].map(l => `<label class="opt"><input type="radio" name="conviction" value="${l}"> ${cap(l)}</label>`).join("")}
    </fieldset>
    <label class="field">Niveau clé que je surveille <input name="niveau" inputmode="decimal" placeholder="ex. 28291"></label>
    <label class="field">Note (facultatif) <textarea name="note" rows="2" placeholder="Pourquoi ?"></textarea></label>
    <button type="submit" class="btn">Enregistrer ma lecture</button>
    <p class="muted">Enregistrée dans ce navigateur, à ${nowParisHM()} (heure de Paris). Elle ne pourra plus être modifiée.</p>
  </form>`;
}
function bindJournalForm(date, openParis, onSaved){
  const f = document.getElementById("jform"); if (!f) return;
  f.addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(f);
    const entry = { lecture: fd.get("lecture"), conviction: fd.get("conviction") || null,
      niveau: (fd.get("niveau")||"").trim() || null, note: (fd.get("note")||"").trim() || null,
      saisi_le: nowParisFull(), avant_ouverture: beforeOpen(openParis) };
    if (!Journal.save(date, entry)) { alert("Impossible d'enregistrer dans ce navigateur (stockage bloqué ou navigation privée)."); return; }
    onSaved(entry);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const n = document.getElementById("nav");
  if (n) n.innerHTML = navHTML(location.pathname.split("/").pop() || "index.html");
});
