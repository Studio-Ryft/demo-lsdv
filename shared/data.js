/* Contenuti condivisi dalle tre versioni del sito demo · Strada del Vino Casavecchia di Pontelatone ETS
   Fonti: Anteprima 2026 (versione definitiva Canva), testo storico "Casavecchia, storia di un vino",
   testo Archivio di Stato (F. Manzi), brochure 3 ante, D.M. 8/11/2011, Plinio N.H. XIV.
   I campi con demo:true sono contenuti d'esempio da sostituire con materiale del cliente. */
window.LSDV = {
  ente: {
    nome: "Strada del Vino",
    sotto: "Casavecchia di Pontelatone",
    forma: "Ente del Terzo Settore",
    sede: "Pontelatone (CE) · Alta Campania",
    email: "info@stradadelvino.org",
    tel: "335 6654770",
    presidente: "Andrea Granito",
    missione: "Raccontiamo la storia e la cultura dell'Alta Campania partendo dal vino. Lavoriamo con cantine, comunità locali, archivi e comuni di un'area in cui la viticoltura compare già negli scritti di Plinio il Vecchio.",
    citazione: { testo: "Non una vetrina, ma una rete; non un brand, ma una relazione.", autore: "Fortunata Manzi", ruolo: "Direttrice dell'Archivio di Stato di Caserta" },
    citazione2: { testo: "Un luogo che non si vende: si incontra.", autore: "Fortunata Manzi", ruolo: "Anteprima 2026" }
  },

  numeri: [
    { n: 8, label: "comuni della DOC" },
    { n: 17, label: "aziende nella rete" },
    { n: 3, label: "vitigni antichi" },
    { n: 50, label: "vigneti analizzati" }
  ],

  manifesto: [
    { t: "Divulgare", d: "Partiamo dal vino per parlare di chi lo coltiva, dei documenti d'archivio che ne attestano l'origine e dei luoghi in cui è nato." },
    { t: "Mettere in rete", d: "Produttori, ristoratori, strutture ricettive, enti locali e studiosi lavorano insieme su un territorio che ha al centro tre vitigni antichi: il Casavecchia, il Pallagrello nero e il Pallagrello bianco." },
    { t: "Misurarsi", d: "Analizziamo i suoli dei vigneti e portiamo i vini davanti a critici ed enologi che li assaggiano alla cieca, senza sapere quale cantina li ha prodotti." }
  ],

  storia: [
    { anno: "I sec. d.C.", titolo: "Il vino di Trebula", testo: "Plinio il Vecchio, nel libro XIV della Naturalis Historia, ricorda il vino dell'area di Trebula Balliensis, dove oggi sorge Treglia, frazione di Pontelatone. Alcuni studiosi e la tradizione locale collegano quel Trebulanum al Casavecchia, anche se una prova definitiva non esiste.", fonte: "Plinio, Naturalis Historia, XIV", luogo: "treglia" },
    { anno: "Seconda metà del '700", titolo: "La Vigna del Ventaglio", testo: "Sulle colline di San Leucio Ferdinando IV di Borbone fa impiantare una vigna a ventaglio divisa in dieci raggi, un campo sperimentale che riunisce i vitigni migliori del Regno. Nel quarto e nel quinto raggio si coltivano il Piedimonte rosso e il Piedimonte bianco, che oggi si chiamano Pallagrello nero e Pallagrello bianco.", fonte: "Archivio di Stato di Caserta", luogo: "san-leucio" },
    { anno: "Fine '800", titolo: "La fillossera", testo: "La fillossera, un insetto che attacca le radici della vite, distrugge gran parte dei vigneti europei. Il Casavecchia sopravvive, ma è già un vitigno marginale, che non figura fra le varietà di riferimento della viticoltura campana.", fonte: "Casavecchia, storia di un vino" },
    { anno: "Primo '900", titolo: "L'uva di quella casa vecchia", testo: "Scirocco Prisco, contadino di Pontelatone nato nel 1875, trova una vite antica vicino a una vecchia masseria in località Prea, detta Ciesi. La moltiplica per propaggine, interrando un tralcio finché mette radici, come descriveva Columella nel De re rustica. In paese la chiamano \"l'uva 'e chella casa vecchia\", e da qui viene il nome del vitigno.", fonte: "Testimonianze orali della famiglia Prisco", luogo: "pontelatone" },
    { anno: "Anni '90", titolo: "Il recupero", testo: "Per decenni il Casavecchia si coltiva in famiglia, per lo più ad alberata casertana. Negli anni Novanta viticoltori, enologi e studiosi ne avviano il recupero. Antonio Di Giovannantonio scrive la prima tesi di laurea sul vitigno, che ne analizza i caratteri ampelografici ed enologici, e nascono esperienze cooperative come i Vignai del Casavecchia.", fonte: "Casavecchia, storia di un vino" },
    { anno: "2011", titolo: "La DOC", testo: "Il decreto ministeriale dell'8 novembre 2011 riconosce la DOC Casavecchia di Pontelatone. La zona di produzione comprende l'intero territorio di Liberi e Formicola e parte dei comuni di Pontelatone, Caiazzo, Castel di Sasso, Castel Campagnano, Piana di Monte Verna e Ruviano.", fonte: "D.M. 8/11/2011, G.U. n. 278" },
    { anno: "2022", titolo: "La scienza dell'aroma", testo: "La professoressa Paola Piombino, del Dipartimento di Agraria dell'Università Federico II, firma uno studio sull'aroma dei vini rossi da Pallagrello e Casavecchia. Tra i dati raccolti c'è il confronto fra i composti aromatici del Casavecchia di Pontelatone e di quello di Caiazzo.", fonte: "Federico II, Dip. di Agraria, settembre 2022" },
    { anno: "2026", titolo: "L'Anteprima all'Archivio", testo: "Il 23 e 24 gennaio, all'Archivio di Stato nella Reggia di Caserta, 17 aziende presentano le loro annate senza etichetta. Le giudicano un panel di critici coordinato da Gianni Fabrizio e un gruppo di enologi coordinato da Roberto Di Meo.", fonte: "Anteprima 2026" }
  ],

  vitigni: [
    { id: "casavecchia", nome: "Casavecchia", colore: "rosso", tag: "DOC · bacca nera", testo: "Ha grappolo spargolo, buccia spessa e un'alta concentrazione di antociani e tannini. Dà un rosso rubino che tende al granato con gli anni. Il disciplinare della DOC prescrive almeno due anni di invecchiamento, di cui uno in legno. Nell'analisi sensoriale per la scelta dell'epoca di vendemmia prevalgono le note floreali sui depositi vulcanici e quelle balsamiche sulla collina marnoso-arenacea.", origine: "Pontelatone, località Prea" },
    { id: "pallagrello-nero", nome: "Pallagrello Nero", colore: "rosso", tag: "IGT Terre del Volturno", testo: "È il Piedimonte rosso della corte borbonica, che insieme al Piedimonte bianco occupava il quarto e il quinto raggio della Vigna del Ventaglio. Nell'analisi sensoriale per la scelta dell'epoca di vendemmia il profilo cambia con il suolo. Sui depositi vulcanici le note fruttate, floreali, speziate e balsamiche si equivalgono; sulla collina marnoso-arenacea prevale il balsamico, nel fondovalle il fruttato.", origine: "San Leucio, Vigna del Ventaglio" },
    { id: "pallagrello-bianco", nome: "Pallagrello Bianco", colore: "bianco", tag: "IGT Terre del Volturno", testo: "È il Piedimonte bianco della Vigna del Ventaglio. Sui depositi vulcanici l'analisi sensoriale registra note fruttate, agrumate e balsamiche, mentre nel fondovalle del Volturno metà dei descrittori indica frutta surmatura.", origine: "San Leucio, Vigna del Ventaglio" }
  ],

  suoli: [
    { id: "vulcanici", nome: "Depositi vulcanici", area: "Pontelatone", wrb: "Vitric Andosols", testo: "Si formano su depositi piroclastici e non contengono calcare. Orizzonti rossastri scuri ricoprono il tufo arrossato, che si trova entro un metro e mezzo di profondità, e i vetri vulcanici luccicano visibilmente al sole.", img: "shared/img/suolo-vulcanico.webp" },
    { id: "marne", nome: "Collina marnoso-arenacea", area: "Caiazzo", wrb: "Eutric Cambisols", testo: "Si formano su stratificazioni marnose e, in misura minore, arenacee. Contengono calcare, hanno più argilla che sabbia e poggiano su un substrato lapideo che si trova entro un metro di profondità.", img: "shared/img/suolo-marne.webp" },
    { id: "volturno", nome: "Fondovalle del Volturno", area: "Volturno", wrb: "Haplic Fluvisols", testo: "Suoli molto profondi, pianeggianti o dolcemente inclinati, formati sui depositi alluvionali del fiume. La componente sabbiosa è elevata e si mescola ai materiali piroclastici trasportati dal Volturno, per cui il drenaggio è buono e la permeabilità alta.", img: "shared/img/suolo-volturno.webp" }
  ],

  comuni: [
    { id: "pontelatone", nome: "Pontelatone", testo: "Dà il nome alla DOC. Nella frazione di Treglia sorgeva Trebula Balliensis, città sannita e poi romana, di cui restano le mura in opera poligonale del IV secolo a.C., una porta megalitica e le terme." },
    { id: "formicola", nome: "Formicola", testo: "Rientra per intero nella DOC. Il paese sta ai piedi del Monte Sant'Erasmo, nei Monti Trebulani, e conserva Palazzo Carafa, residenza dei baroni, e il santuario di Santa Maria a Castello." },
    { id: "liberi", nome: "Liberi", testo: "Rientra per intero nella DOC. Il capoluogo, ai piedi del Monte Melito, sta a 470 metri ed è il più alto fra gli otto comuni della denominazione." },
    { id: "castel-di-sasso", nome: "Castel di Sasso", testo: "Il nucleo più antico, Borgo Sasso, sta su uno sperone roccioso che a ovest e a sud scende a strapiombo. Della fortezza restano tratti della cinta muraria e una torre quadrangolare." },
    { id: "caiazzo", nome: "Caiazzo", testo: "Il castello, costruito dai Longobardi e rimaneggiato da Normanni e Aragonesi, sovrasta il centro storico medievale. Sulle Colline Caiatine i suoli sono marnoso-arenacei, e all'analisi sensoriale le uve che ne provengono hanno un profilo diverso da quelle dei suoli vulcanici di Pontelatone." },
    { id: "piana-di-monte-verna", nome: "Piana di Monte Verna", testo: "Il paese sta ai piedi del Monte Verna e il suo territorio scende fino al Volturno, che ne segna il confine a sud. Poco fuori dal centro si trova Santa Maria a Marciano, chiesa ricostruita in stile gotico nel Trecento." },
    { id: "castel-campagnano", nome: "Castel Campagnano", testo: "Si trova sulla riva destra del Volturno. In paese ci sono il castello ducale e la chiesa di Santa Maria ad Nives, e sulle colline intorno si coltivano vite e olivo." },
    { id: "ruviano", nome: "Ruviano", testo: "Il paese sta su una collina nella grande ansa del Volturno, al margine orientale della provincia. Il castello, passato fra Normanni, Svevi e Angioini, ha una torre dell'orologio, e in via Castello resta una torre difensiva del Quattrocento." }
  ],

  aziende: [
    "Alois", "Canestrini", "Civittolo", "Domus Vinaria · Palmieri", "Elysium (già Cantine Rao)", "I Vignai del Casavecchia",
    "Il Verro", "Laboris Catrame", "Le Fontanelle", "Le Ghiandaie", "Masseria Piccirillo", "Sagliocco",
    "Scaramuzzo", "Sclavia", "Tenuta Pezzapane", "Teresa Mincione", "Vestini Campagnano · Poderi Foglia"
  ],

  eventi: [
    { stato: "archivio", data: "23–24 gennaio 2026", titolo: "Anteprima 2026 · Pallagrello e Casavecchia", luogo: "Archivio di Stato di Caserta · Reggia di Caserta", testo: "Tre sessioni di degustazione alla cieca: Pallagrello Bianco 2023 e 2024, Pallagrello Nero 2022 e 2024, Casavecchia IGT e DOC 2022 e 2024. Hanno assaggiato i vini 14 degustatori e 8 enologi.", img: "shared/img/anteprima-aziende.webp" },
    { stato: "prossimo", data: "Data da definire", titolo: "Anteprima 2027", luogo: "In definizione", testo: "Seconda edizione della degustazione alla cieca aperta alla critica nazionale.", demo: true },
    { stato: "prossimo", data: "Primavera", titolo: "Passeggiate tra i filari", luogo: "Nei comuni della DOC", testo: "Percorsi a piedi fra vigne e borghi, accompagnati dal produttore e da uno storico del territorio.", demo: true },
    { stato: "prossimo", data: "Autunno", titolo: "Carte di vino", luogo: "Archivio di Stato di Caserta", testo: "Incontro pubblico sui documenti d'archivio che riguardano la Vigna del Ventaglio e i siti reali casertani.", demo: true }
  ],

  panel: {
    degustatori: ["Gianni Fabrizio · Gambero Rosso (coordinatore)", "Antonella Amodio · Doctor Wine", "Giuliana Biscardi · AIS", "Pasquale Carlo · Vini Buoni d'Italia", "Monica Coluccia · critica", "Adele Granieri · Slow Wine", "Gabriele Gorelli · Master of Wine", "Pietro Iadicicco · AIS Caserta", "Veronica Iannone · Bibenda", "Tommaso Luongo · AIS Campania", "Alessandro Marra · Slow Wine", "Luciano Pignataro · Food & Wine Blog", "Francesco Saverio Russo · divulgatore", "Fosca Tortorelli · giornalista"],
    enologi: ["Roberto Di Meo · Assoenologi Campania (coordinatore)", "Maurizio Alongi", "Antonio Di Giovannantonio", "Arturo Erbaggio", "Giovanni Piccirillo", "Domenico Polzone", "Emilia Tartaglione", "Carmine Valentino"]
  },

  blog: [
    { cat: "Storia", titolo: "Trebulanum: cosa sappiamo del vino citato da Plinio", estratto: "Fonti antiche, scavi di Treglia e tradizione orale: che cosa lega davvero il Casavecchia al vino che Plinio attribuisce all'area di Trebula.", img: "shared/img/comune-pontelatone.webp", min: 7, demo: true },
    { cat: "Archivio", titolo: "Dieci raggi per un Regno: la Vigna del Ventaglio", estratto: "Il campo sperimentale borbonico di San Leucio letto attraverso i documenti dell'Archivio di Stato di Caserta.", img: "shared/img/vigna-lmp01930.webp", min: 9, demo: true },
    { cat: "Scienza", titolo: "Tre suoli, tre vini", estratto: "Depositi vulcanici, collina marnoso-arenacea e fondovalle alluvionale: che cosa registra l'analisi sensoriale sul Pallagrello e sul Casavecchia.", img: "shared/img/suolo-marne.webp", min: 6, demo: true },
    { cat: "Borghi", titolo: "Caiazzo in un giorno", estratto: "Il castello, il centro storico medievale e le cantine delle Colline Caiatine in un solo itinerario.", img: "shared/img/comune-caiazzo.webp", min: 5, demo: true }
  ],

  vlog: [
    { ep: "01", titolo: "La vite di casa vecchia", durata: "8:40", img: "shared/img/vigna-lmp01931.webp", testo: "Pontelatone, località Prea, dove Scirocco Prisco trovò la vite da cui è ripartita la coltivazione del Casavecchia.", demo: true },
    { ep: "02", titolo: "Alla cieca", durata: "12:15", img: "shared/img/anteprima-lab.webp", testo: "Come si è svolta l'Anteprima 2026 all'Archivio di Stato, sessione per sessione.", demo: true },
    { ep: "03", titolo: "Le mani nel tufo", durata: "6:30", img: "shared/img/suolo-vulcanico.webp", testo: "Un pedologo spiega come si riconoscono i suoli vulcanici di Pontelatone.", demo: true },
    { ep: "04", titolo: "Il Volturno dall'alto", durata: "4:50", img: "shared/img/comune-liberi.webp", testo: "Gli otto comuni della DOC ripresi dal drone.", demo: true }
  ],

  adesione: {
    intro: "Alla Strada aderiscono aziende, enti e privati dell'Alta Campania. Chi aderisce partecipa agli eventi della rete e ha una scheda nella mappa e nei percorsi del sito.",
    categorie: [
      { id: "cantine", nome: "Cantine e viticoltori", desc: "Aziende che producono vino nei comuni della DOC e della IGT Terre del Volturno.", icona: "grappolo" },
      { id: "ristorazione", nome: "Ristoranti ed enoteche", desc: "Locali che propongono i vini e la cucina del territorio.", icona: "calice" },
      { id: "ospitalita", nome: "Ospitalità", desc: "Agriturismi, B&B, case vacanza e alberghi.", icona: "casa" },
      { id: "agroalimentare", nome: "Produttori agroalimentari", desc: "Caseifici, frantoi, apicoltori, salumifici e aziende agricole.", icona: "spiga" },
      { id: "cultura", nome: "Guide, cultura e servizi", desc: "Guide turistiche, associazioni culturali, servizi di trasporto e chi organizza visite sul territorio.", icona: "mappa" },
      { id: "enti", nome: "Enti e istituzioni", desc: "Comuni, pro loco, scuole, università, archivi e musei.", icona: "colonna" },
      { id: "sostenitori", nome: "Sostenitori", desc: "Privati e appassionati che sostengono il lavoro di divulgazione della Strada.", icona: "cuore" }
    ],
    vantaggi: [
      "Scheda nella mappa interattiva e nei percorsi del Vino, dei Borghi e dei Sapori",
      "Partecipazione all'Anteprima e agli eventi della rete",
      "Racconto dell'azienda nel blog e nel vlog",
      "Formazione su accoglienza enoturistica e comunicazione",
      "Materiali di comunicazione con il marchio della Strada",
      "Partecipazione all'assemblea dei soci"
    ],
    passi: [
      { t: "Candidatura", d: "Compili il modulo online con i dati della tua azienda o del tuo ente." },
      { t: "Incontro", d: "Ti contattiamo per conoscerci e, se hai un'azienda, per visitarla." },
      { t: "Approvazione", d: "Il consiglio direttivo valuta la domanda secondo lo statuto." },
      { t: "Benvenuto", d: "La tua scheda entra nella mappa e nei percorsi, e ricevi il calendario delle attività." }
    ],
    nota: "Quote e requisiti sono stabiliti dallo statuto e dall'assemblea dei soci."
  },

  percorsi: [
    { id: "vino", nome: "Percorso del Vino", testo: "Cantine, vigneti e degustazioni." },
    { id: "borghi", nome: "Percorso dei Borghi", testo: "Pontelatone, Formicola, Liberi, Castel di Sasso, Piana di Monte Verna, Caiazzo, Castel Campagnano e Ruviano." },
    { id: "sapori", nome: "Percorso dei Sapori", testo: "Caseifici, agriturismi, aziende agricole e produttori locali." }
  ],

  partner: [
    { nome: "Archivio di Stato di Caserta", ruolo: "Partner istituzionale" },
    { nome: "Zurich · Masucci e Duva Caserta", ruolo: "Sponsor" },
    { nome: "Università Federico II", ruolo: "Ricerca scientifica" },
    { nome: "Miriade & Partners", ruolo: "Ufficio stampa" },
    { nome: "Il Torchio Enoteca", ruolo: "Sponsor" },
    { nome: "La Baronia", ruolo: "Sponsor" },
    { nome: "Pro Loco", ruolo: "Sponsor" }
  ]
};
