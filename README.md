# 🚀 Webcrawler Projekt

## 📌 Projektübersicht
Ein leistungsstarker Webcrawler zur automatisierten Datenerfassung von Stack Overflow-Nutzern, erstellt mit **UIPath** und **JavaScript (Node.js & Puppeteer)**.

## 🎯 Ziele
- Entwicklung eines **GUI-basierten** und **nicht-GUI-basierten** Webcrawlers
- Automatische **Datenextraktion** von relevanten Stack Overflow-Profilen
- Speicherung der Metadaten in einer **CSV-Datei**
- Nutzung von **RPA-Technologien** (UIPath) für die Automatisierung

## 🛠️ Technologien
- **JavaScript (Node.js & Puppeteer)** für den nicht-GUI-basierten Crawler
- **UIPath** für den GUI-basierten Crawler
- **CSV-Writer & CSV-Parse** zur Datenverarbeitung
- **PowerShell / CLI** für die Ausführung des nicht-GUI-basierten Crawlers

## 📥 Installation
### GUI-basierter Webcrawler
1. **UIPath installieren**: [Download UIPath](https://download.uipath.com/UiPathStudioCommunity.msi)
2. **Webcrawler hinzufügen**: Den `GUI-basiert` Ordner nach `Dokumente/UIPath/` verschieben.
3. **Starten**: Öffne `UIPath Studio` und starte das `Webcrawler`-Projekt.
4. **Ergebnisse**: Die extrahierten Daten werden als `Metadaten-Webcrawler.csv` gespeichert.

### Nicht-GUI-basierter Webcrawler
1. **Node.js installieren**: [Download Node.js](https://nodejs.org)
2. **Projekt einrichten**:
   ```sh
   git clone https://github.com/Shogiiin/Apps-WebCrawler-.git
   cd Apps-WebCrawler
   npm install puppeteer csv-writer csv-parse
   ```
3. **Starten**:
   ```sh
   node src
   ```
4. **Ergebnisse**: Gespeicherte Daten befinden sich im `Output/Metadaten_von_tag-[Tag-Hier].csv`.

## ⚙️ Konfiguration
Passe die `config.json` an, um Einstellungen zu ändern:
```json
{
  "userAmountPerTag": 30,
  "openVisualWindow": false,
  "checkIfUserIsGerman": false,
  "logUserLengthAfterTag": false,
  "updateStatusInConsole": false
}
```

## 🧪 Testszenarien
✅ Webcrawler startet und durchsucht Stack Overflow nach relevanten Usern.  
✅ Metadaten werden korrekt gespeichert.  
✅ GUI- & Nicht-GUI-Versionen laufen stabil auf Windows 10/11.  

## 📅 Projektteam
- **Lukas Konsorski** (Projektleiter)
- **Melvin Schröter** (stv. Projektleiter)
- **Fabian Lohde** (Techniker)
- **Erik Schultheis** (Protokollant)

## 📝 Lizenz
Dieses Projekt wurde mit kostenloser und lizenzfreier Software entwickelt und dient nur zu **Bildungszwecken**.

