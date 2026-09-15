/* Risultati dell'analisi sensoriale per vitigno e macro area di suolo (percentuali dei descrittori).
   Fonte: Anteprima 2026, pagina "Monitoraggio maturazione aromatica" (studio Federico II). */
window.LSDV_AROMI = {
  descrittori: {
    Fruttato: "#8E3942", Agrumato: "#D9B44A", Balsamico: "#8FB27A", Floreale: "#C48FB6",
    Speziato: "#6E9CB0", Vegetale: "#5E8C4A", "Frutta surmatura": "#D98B4A"
  },
  vitigni: { pb: "Pallagrello Bianco", pn: "Pallagrello Nero", ca: "Casavecchia" },
  suoli: { vulcanici: "Depositi vulcanici", marne: "Collina marnoso-arenacea", volturno: "Fondovalle del Volturno" },
  dati: {
    pb: {
      vulcanici: { Fruttato: 50, Agrumato: 25, Balsamico: 25 },
      marne: { Fruttato: 50, Balsamico: 33.3, Agrumato: 16.7 },
      volturno: { Fruttato: 50, "Frutta surmatura": 50 }
    },
    pn: {
      vulcanici: { Fruttato: 23.1, Floreale: 23.1, Balsamico: 23.1, Speziato: 23.1, Agrumato: 7.7 },
      marne: { Balsamico: 42.9, Fruttato: 28.6, Speziato: 14.3, Agrumato: 14.3 },
      volturno: { Fruttato: 75, Vegetale: 25 }
    },
    ca: {
      vulcanici: { Floreale: 50, Vegetale: 33.3, Fruttato: 16.7 },
      marne: { Balsamico: 40, Fruttato: 30, Floreale: 20, Vegetale: 10 },
      volturno: { Fruttato: 42.9, Floreale: 42.9, "Frutta surmatura": 14.3 }
    }
  }
};
