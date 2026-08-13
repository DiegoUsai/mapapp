// Classificazione COFOG (Classification of the Functions of Government), 10 divisioni e 69 gruppi.
// Fonte: Eurostat / UN Statistics Division, versione 1999 (COFOG 1999).
// Ogni divisione è inclusa anche come voce selezionabile a sé (classificazione a livello generico),
// oltre ai suoi gruppi (classificazione più specifica).

export const COFOG = [
  {
    code: "01",
    label: "Servizi generali delle amministrazioni pubbliche",
    groups: [
      { code: "01.1", label: "Organi esecutivi e legislativi, affari finanziari e fiscali, affari esteri" },
      { code: "01.2", label: "Aiuti economici esteri" },
      { code: "01.3", label: "Servizi generali" },
      { code: "01.4", label: "Ricerca di base" },
      { code: "01.5", label: "R&S servizi generali" },
      { code: "01.6", label: "Servizi generali n.a.c." },
      { code: "01.7", label: "Transazioni del debito pubblico" },
      { code: "01.8", label: "Trasferimenti generali tra diversi livelli di governo" },
    ],
  },
  {
    code: "02",
    label: "Difesa",
    groups: [
      { code: "02.1", label: "Difesa militare" },
      { code: "02.2", label: "Difesa civile" },
      { code: "02.3", label: "Aiuti militari esteri" },
      { code: "02.4", label: "R&S difesa" },
      { code: "02.5", label: "Difesa n.a.c." },
    ],
  },
  {
    code: "03",
    label: "Ordine pubblico e sicurezza",
    groups: [
      { code: "03.1", label: "Servizi di polizia" },
      { code: "03.2", label: "Servizi antincendio" },
      { code: "03.3", label: "Tribunali" },
      { code: "03.4", label: "Istituti penitenziari" },
      { code: "03.5", label: "R&S ordine pubblico e sicurezza" },
      { code: "03.6", label: "Ordine pubblico e sicurezza n.a.c." },
    ],
  },
  {
    code: "04",
    label: "Affari economici",
    groups: [
      { code: "04.1", label: "Affari generali economici, commerciali e del lavoro" },
      { code: "04.2", label: "Agricoltura, silvicoltura, pesca e caccia" },
      { code: "04.3", label: "Combustibili ed energia" },
      { code: "04.4", label: "Attività estrattive, manifatturiere e costruzioni" },
      { code: "04.5", label: "Trasporti" },
      { code: "04.6", label: "Comunicazioni" },
      { code: "04.7", label: "Altri settori" },
      { code: "04.8", label: "R&S affari economici" },
      { code: "04.9", label: "Affari economici n.a.c." },
    ],
  },
  {
    code: "05",
    label: "Protezione dell'ambiente",
    groups: [
      { code: "05.1", label: "Gestione dei rifiuti" },
      { code: "05.2", label: "Gestione delle acque reflue" },
      { code: "05.3", label: "Riduzione dell'inquinamento" },
      { code: "05.4", label: "Protezione della biodiversità e del paesaggio" },
      { code: "05.5", label: "R&S protezione dell'ambiente" },
      { code: "05.6", label: "Protezione dell'ambiente n.a.c." },
    ],
  },
  {
    code: "06",
    label: "Abitazioni e assetto territoriale",
    groups: [
      { code: "06.1", label: "Sviluppo dell'edilizia abitativa" },
      { code: "06.2", label: "Sviluppo delle comunità" },
      { code: "06.3", label: "Approvvigionamento idrico" },
      { code: "06.4", label: "Illuminazione stradale" },
      { code: "06.5", label: "R&S abitazioni e assetto territoriale" },
      { code: "06.6", label: "Abitazioni e assetto territoriale n.a.c." },
    ],
  },
  {
    code: "07",
    label: "Sanità",
    groups: [
      { code: "07.1", label: "Prodotti, apparecchi e attrezzature medicali" },
      { code: "07.2", label: "Servizi ambulatoriali" },
      { code: "07.3", label: "Servizi ospedalieri" },
      { code: "07.4", label: "Servizi di sanità pubblica" },
      { code: "07.5", label: "R&S sanità" },
      { code: "07.6", label: "Sanità n.a.c." },
    ],
  },
  {
    code: "08",
    label: "Attività ricreative, culturali e di culto",
    groups: [
      { code: "08.1", label: "Servizi ricreativi e sportivi" },
      { code: "08.2", label: "Servizi culturali" },
      { code: "08.3", label: "Servizi di radiodiffusione ed editoria" },
      { code: "08.4", label: "Servizi religiosi e altri servizi collettivi" },
      { code: "08.5", label: "R&S ricreazione, cultura e culto" },
      { code: "08.6", label: "Ricreazione, cultura e culto n.a.c." },
    ],
  },
  {
    code: "09",
    label: "Istruzione",
    groups: [
      { code: "09.1", label: "Istruzione pre-primaria e primaria" },
      { code: "09.2", label: "Istruzione secondaria" },
      { code: "09.3", label: "Istruzione post-secondaria non terziaria" },
      { code: "09.4", label: "Istruzione terziaria" },
      { code: "09.5", label: "Istruzione non definibile per livello" },
      { code: "09.6", label: "Servizi ausiliari all'istruzione" },
      { code: "09.7", label: "R&S istruzione" },
      { code: "09.8", label: "Istruzione n.a.c." },
    ],
  },
  {
    code: "10",
    label: "Protezione sociale",
    groups: [
      { code: "10.1", label: "Malattia e disabilità" },
      { code: "10.2", label: "Vecchiaia" },
      { code: "10.3", label: "Superstiti" },
      { code: "10.4", label: "Famiglia e minori" },
      { code: "10.5", label: "Disoccupazione" },
      { code: "10.6", label: "Abitazione" },
      { code: "10.7", label: "Esclusione sociale n.a.c." },
      { code: "10.8", label: "R&S protezione sociale" },
      { code: "10.9", label: "Protezione sociale n.a.c." },
    ],
  },
];

// Voce piatta { code, label, divisionLabel } per popolare un <select> con <optgroup>,
// o per risalire dall'eventuale codice salvato all'etichetta da mostrare.
export const COFOG_OPTIONS = COFOG.flatMap((division) => [
  { code: division.code, label: `${division.code} — ${division.label} (generico)`, divisionLabel: division.label },
  ...division.groups.map((g) => ({ code: g.code, label: `${g.code} — ${g.label}`, divisionLabel: division.label })),
]);

export function cofogLabel(code) {
  return COFOG_OPTIONS.find((o) => o.code === code)?.label || code;
}
