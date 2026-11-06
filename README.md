# MyTraining

Eine installierbare, offlinefähige Trainingsplan-App (Progressive Web App, PWA) mit eigener lokaler Datenspeicherung. Die ANIMUS-Mockups dienten nur als gestalterische Referenz. Die App ist ein **Trainingsplan**, kein Mood- oder Ernährungstracker.

## 1. Funktionen

- **Einrichtung:** Vorname, Nachname, Geburtstag, Körpergröße, aktuelles Gewicht, Zielgewicht und Ziel (Abnehmen, Zunehmen, Muskelaufbau, Gewicht halten, Ernährung / Diät). Pflichtfelder; kein Konto und keine Cloud.
- **Dashboard:** personalisierte Startseite, Wochenfortschritt, nächste Einheit, Gewichtsänderung seit dem ersten Wiegeeintrag.
- **Kalender:** Monatsübersicht, grüne Häkchen für als abgeschlossen gespeicherte Trainingstage, rote X für vergangene Trainingstage ohne Abschluss, blaue Kreise für Regenerationstage. Vor Einrichtungsdatum werden keine Tage als verpasst markiert.
- **Tagesansicht:** per Pfeil oder horizontalem Wischen Tage wechseln, einschließlich zukünftiger Tage als schreibgeschützte Vorschau.
- **Trainingstage:** Montag, Mittwoch, Freitag, bestehende Übungen, eigene Übungen, Übungshinweise ein-/ausklappen, Sätze, Wiederholungen pro Satz und Gewichte.
- **Statistik:** Trainingstage und Gewichtsverlauf, Trainingshistorie, Übungsverlauf.
- **PDF:** kompakter Report mit bis zu drei Trainingstagen pro Ausgabe; Hinweise optional, PDF-Archiv mit Datum und lokalem Download.
- **Sicherung:** JSON-Datei mit Trainingsstand, Historie, Kalenderdaten, Profil und Einstellungen herunterladen und wiederherstellen. PDFs müssen getrennt gesichert werden.
- **Design:** Blau aus dem vorhandenen Logo, Light Mode, Dark Mode und Systemeinstellung. Untere Hauptnavigation auf Mobilgeräten.
- **Erinnerung:** optionale Benachrichtigungsprüfung um 08:00 Uhr an Trainingstagen, solange die App ausgeführt wird (siehe Einschränkungen).

## 2. Technische Entscheidung

Die bestehende Anwendung bleibt eine **PWA mit HTML, CSS und JavaScript**. Ein kompletter Neuaufbau in Flutter/Swift/Kotlin würde lokale Datenmigration, Offline-Speicher und PDF-Export erheblich aufwendiger machen, ohne einen automatischen Qualitätsgewinn bei den vorhandenen Funktionen. Diese Version benötigt kein Backend, keine externen Bibliotheken und keine Online-API.

Wer garantierte systemseitige Benachrichtigungen zu einer Uhrzeit **bei geschlossener App** benötigt, sollte eine native Umsetzung (z. B. Flutter mit lokalen Systembenachrichtigungen) planen. Eine rein lokale PWA kann das auf iOS/Android **nicht zuverlässig garantieren**. Die vorhandene Einstellung versendet **keine serverseitigen Pushnachrichten**.

## 3. App lokal starten

Im Projektverzeichnis einen lokalen Webserver starten:

```bash
python -m http.server 8080
```

Dann `http://localhost:8080/` im Browser öffnen. Die Installation auf dem Smartphone erfordert im Regelfall eine HTTPS-Adresse. Ein direkt geöffnetes `file://`-Dokument ist **keine** vollwertige installierbare PWA.

Für GitHub Pages: GitHub-Repository → Settings → Pages → Deploy from a branch → `main` / root. Nach Veröffentlichung die HTTPS-Adresse auf dem Handy öffnen und „Zum Home-Bildschirm“ wählen. *GitHub Pages ist öffentlich: keine persönlichen JSON-Sicherungen, PDF-Berichte oder Profildaten ins Repository committen!*

## 4. Migration und Datenspeicherung

Die App behält die bisherigen Schlüssel und Datenformate (`training-profile-v1`, vorhandener Trainingsstand, `training-calendar-days-v1`, Historie) bei. Zusätzliche Angaben landen unter `training-full-profile-v1`, das Einrichtungsdatum unter `training-setup-date-v1` und Einstellungen unter `training-preferences-v1`.

**Vor dem Update eine Sicherung herunterladen.** Für Nutzer früherer Versionen werden die zusätzlichen Pflichtangaben beim nächsten Start angefragt. Das Statistik-Startdatum ist dann der Tag dieser ergänzten Einrichtung; frühere Daten werden nicht gelöscht, aber in den neuen Datums-Kennzahlen nicht als versäumte Trainingstage ausgewertet.

Speicherung geschieht browserintern (`localStorage`, `IndexedDB`), nicht in einer frei wählbaren Datei auf dem Gerät. **Deinstallieren, Browserdaten löschen oder Gerätewechsel kann zum Datenverlust führen.** Regelmäßig eine JSON-Sicherung und PDF-Dateien außerhalb der App speichern.

## 5. Struktur

```text
index.html           Trainingseingaben und bisherige App-Funktionen
calendar.js          Tagesdaten, Kalender, Navigation, PDF-Archiv
progress.js          Satzprotokoll, Trainingshistorie, Datensicherung
modern-pdf.js        PDF-Export
experience.js        Profilunabhängige Oberfläche, Design, Navigation, Erinnerung
theme.css            Responsive Design, Light/Dark Mode
sw.js                Offline-Service-Worker
manifest.webmanifest App-Metadaten
icons/               Originales App-Logo
```

## 6. Update und Git

Die ZIP-Dateien **in das vorhandene Git-Projekt kopieren**, dabei `.git` nicht löschen oder überschreiben.

```bash
git status
git add index.html calendar.js progress.js modern-pdf.js experience.js theme.css sw.js manifest.webmanifest README.md icons/
git commit -m "Trainings-App mit Dashboard, Profil, Kalender und Dark Mode erweitert"
git push
```

Falls die neue Oberfläche nach dem Deployment nicht erscheint, App einmal online neu laden; der Service-Worker aktualisiert die zwischengespeicherten Dateien.

## 7. Test-Checkliste vor produktiver Nutzung

1. Neues Profil ausfüllen, App neu laden, Profil und Startdatum prüfen.
2. Im Kalender vor das Ersteinrichtungsdatum navigieren: keine roten X; future days read-only.
3. Trainingssatz erfassen, Tagesabschluss speichern, zwischen Tagen wechseln und neu laden.
4. Hell/Dunkel/System umschalten und nach einem Neustart erneut prüfen.
5. Sicherung herunterladen, testweise importieren und wiederhergestellte Daten kontrollieren.
6. PDF mit/ohne Hinweise erzeugen, PDF-Archiv öffnen und Datei separat herunterladen.
7. Erinnerung nur nach Berechtigung aktivieren; zeitgesteuerte Hintergrund-Pushs nicht erwarten.

## 8. Grenzen

Die Trainingsplanung ist auf Montag/Mittwoch/Freitag ausgelegt. Eine abgeschlossene Einheit wird aktiv über die Abschlussfunktion markiert. Der PDF-Export ist auf drei Trainingstage optimiert; sehr viele selbst hinzugefügte Übungen oder lange Hinweise können die Lesbarkeit einschränken. Die App bietet keine verschlüsselte Cloud-Sicherung und keine medizinische oder ernährungsbezogene Beratung.


## Responsiver Profilassistent

Die Ersteinrichtung wird in vier Schritte gegliedert: Name, Basisdaten, Gewicht und Trainingsziel. Auf kleinen Bildschirmen passt sich der Dialog an die verfügbare Höhe an; nur bei eingeschränkter Höhe oder geöffnetem Tastaturfeld ist der Inhaltsbereich intern scrollbar. Die bestehende Profilspeicherung und das Datenformat bleiben unverändert. `wizard.css` und `wizard.js` gehören zum Offline-Cache in `sw.js`.


## Version 17 – Layout und PDF-Vorschau

- Ersteinrichtung: vier Schritte, jeweils mit vertikalem Formular und eigenen responsiven Begrenzungen.
- Die Profilansicht hat keine globalen Eingabefelder, die über den Dialogrand hinausreichen sollen.
- Kein Einstellungsbutton mehr im oberen Kopfbereich; Einstellungen über **Mehr** in der unteren Navigation.
- Hell/Dunkel/System bleiben in den Einstellungen umschaltbar; dunkle Formulare und Karten wurden hinsichtlich Kontrast nachgebessert.
- PDF-Export: **Vorschau** öffnet den Bericht, ohne ihn sofort herunterzuladen. **Speichern / Teilen** speichert ihn im lokalen PDF-Archiv und bietet die gerätespezifische Exportfunktion an.
- **PDFs**: gespeicherte Berichte mit Zeitstempel ansehen, herunterladen oder löschen. Die Dateiablage erfolgt in IndexedDB **dieses Browsers bzw. dieser PWA**, nicht automatisch im iOS-Dateisystem. Ein Download ist für langfristige Backups nötig.
- Auf einigen iPhone-Versionen lässt sich ein PDF-Blob nicht im integrierten Vorschaufenster darstellen. Dafür gibt es **In neuem Tab öffnen** und **Herunterladen**.

### Deployment

Alle Dateien in den GitHub-Pages-Projektordner kopieren. Nicht die `.git`-Daten löschen.

```bash
git add .
git commit -m "Profilansicht und Dark Mode verbessert sowie PDF-Vorschau ergänzt"
git push
```

**Technologie:** Weiterhin eine offlinefähige PWA. Für eine echte native iOS-App wären ein eigener SwiftUI- oder Flutter-Build, Apple-Signierung und Datenmigration nötig. Ein solcher nativer Build ist nicht Teil dieser ZIP.

## 9. Neu: Geburtsdatum mit Scrollrädern

Im zweiten Einrichtungsschritt werden Tag, Monat und Jahr in drei getrennten vertikalen Auswahlrädern gewählt (Wischen, Tippen oder Pfeiltasten). Der Tag passt sich dem ausgewählten Monat an; der Februar berücksichtigt Schaltjahre. Eine bewusste Auswahl ist erforderlich. Intern wird das Datum weiterhin im ISO-Format `YYYY-MM-DD` gespeichert. Vorhandene Profile lassen sich ohne Datenmigration bearbeiten.

## 10. Kostenloser Push-Dienst mit Cloudflare Workers

**Wichtig:** Die ZIP enthält die Push-Anbindung und den Cloudflare-Worker als **Quellcode**, aber keinen bereits bereitgestellten Worker. Hintergrund-Push funktioniert erst nach der folgenden Einrichtung. Ohne Worker bleibt der Erinnerungs-Schalter deaktiviert; es wird keine bereits funktionierende Erinnerung vorgetäuscht.

### Voraussetzungen

- MyTraining über HTTPS / GitHub Pages veröffentlicht.
- Auf dem iPhone (iOS 16.4+) über Safari zum Home-Bildschirm hinzugefügt und **über das App-Symbol geöffnet**.
- Kostenloses Cloudflare-Konto; Node.js 22+ und npm auf dem Computer.
- Für Push ein gültiges VAPID-Schlüsselpaar (Private Key bleibt **ausschließlich** als Cloudflare-Secret).

### Cloudflare Worker bereitstellen

1. Im Terminal in `cloudflare-push/` wechseln und `npm install` ausführen.
2. In Cloudflare eine KV-Namespace anlegen. Alternativ im Worker-Verzeichnis `npx wrangler kv namespace create SUBSCRIPTIONS` ausführen und die ausgegebene Namespace-ID in `cloudflare-push/wrangler.toml` beim Feld `id` einsetzen.
3. Ein VAPID-Schlüsselpaar generieren, zum Beispiel mit `npx web-push generate-vapid-keys`. Den **Public Key** in `wrangler.toml` als `VAPID_SERVER_PUBLIC_KEY` eintragen. `VAPID_SUBJECT` auf die eigene `mailto:`-Adresse ändern. **Private Key niemals ins Repository eintragen.**
4. Im Worker-Verzeichnis `npx wrangler secret put VAPID_SERVER_PRIVATE_KEY` ausführen und den privaten VAPID-Key im Terminal eingeben.
5. `ALLOWED_ORIGIN` in `wrangler.toml` auf die GitHub-Pages-**Origin** setzen, normalerweise `https://tsoliman23.github.io` (ohne Repository-Pfad).
6. `npm run deploy` starten. Die ausgegebene Worker-URL in `push-config.js` bei `MYTRAINING_PUSH_URL` eintragen. Die Konfigurationsdatei enthält **nur die öffentliche Worker-Adresse**, keine geheimen Schlüssel.
7. Änderungen in Git committen und GitHub Pages aktualisieren. Danach MyTraining auf dem iPhone einmal online starten, in **Mehr → Einstellungen** die Erinnerungen aktivieren und die Berechtigung erlauben.

### Funktion und Datenschutz

- Der Cloudflare-Cron-Trigger läuft Montag, Mittwoch und Freitag um 06:00 bzw. 07:00 UTC und sendet ausschließlich, wenn es in der Zeitzone `Europe/Berlin` tatsächlich 08:00 Uhr ist. Eine exakte Zustellsekunde wird nicht garantiert.
- Der Worker speichert nur Push-Endpunkt, kryptografische Subscription-Schlüssel und ein zufälliges Registrierungstoken in Cloudflare KV. **Keine Namen, Geburtsdaten, Körpergewichte, Trainingsinhalte oder PDF-Dateien.**
- Nach einer Abmeldung wird die Registrierung am Server gelöscht und die Browser-Push-Subscription beendet (Internetverbindung erforderlich).
- Der Worker weiß nicht, ob du das heutige Training bereits abgeschlossen hast. Die Erinnerung wird unabhängig vom lokal gespeicherten Trainingsstatus versendet.
- Ein ausgefallener Push-Service oder Offline-Zustand des Geräts kann Zustellungen verzögern oder verhindern.
- Cloudflare Workers und KV besitzen kostenlose Nutzungskontingente; bei deren Überschreitung gelten aktuelle Cloudflare-Bedingungen. Die App selbst bleibt auf GitHub Pages hostbar.
- **Sicherheit:** Das Worker-Projekt enthält keine privaten Schlüssel. `cloudflare-push/node_modules/` und `.dev.vars` gehören nicht ins Repository. Vor dem produktiven Einsatz Endgeräte- und Zugriffsverhalten testen.

### Lokales Testen und Grenzen

Die JavaScript-Syntax kann mit `node --check` geprüft werden. Damit ist noch nicht bestätigt, dass eine echte iOS-Benachrichtigung ankommt; das erfordert das reale Cloudflare-Deployment und einen Push-Test auf dem Gerät. **Die App ist ohne Cloudflare weiterhin als Offline-Trainingsplan nutzbar**, nur Hintergrund-Push bleibt dann aus.


## Mehrsprachigkeit und Geburtsdatumsauswahl

Beim ersten Start erscheint zunächst die Sprachauswahl für Deutsch, Englisch, Französisch oder ägyptisches Arabisch. Die Sprache bleibt unter dem Schlüssel `mytraining-language-v1` lokal gespeichert und lässt sich unter **Mehr > Einstellungen > Sprache** ändern. Das Datenmodell (Trainingsziele, IDs, historische Daten und ISO-Datumswerte) bleibt unabhängig von der Oberflächensprache.

Übersetzungen liegen in `translations.json` und werden offline über `i18n.js` geladen. Die Datei ist im Service-Worker-Cache enthalten. Bei Ergänzungen neuer Features müssen alle sichtbaren Texte in allen vier Sprachen gepflegt werden. Selbst eingegebene Notizen und Übungsnamen werden nicht automatisch übersetzt.

Das Geburtsdatum wird mit den drei vertikal scrollbaren Auswahlrädern für Tag, Monat und Jahr gewählt. Die optisch mittig markierten Optionen werden direkt als `YYYY-MM-DD` im versteckten Formularfeld gespeichert. Eine zweite Datumsanzeige wurde entfernt. Die Tagesliste passt sich an Monat und Schaltjahr an.

Zum Aktualisieren bei GitHub Pages müssen die neue `translations.json`, `i18n.js` und `language.css` mit veröffentlicht werden. Die Cache-Version in `sw.js` wurde erhöht. Nach der Installation der neuen Version die App online neu öffnen.


### Startbildschirm und Sprachwahl (v20)

Die Sprachwahl ist bei einer Neuinstallation im initialen HTML enthalten. Die App-Oberfläche bleibt bis zum Laden der Übersetzungen verborgen, um das kurze Anzeigen des Dashboards zu verhindern. Die arabische Auswahl heißt **عربي** (ägyptisches Arabisch, Locale `ar-EG`). Bestehende Profil-, Trainings- und PDF-Daten werden nicht geändert. Nach dem Deployment die PWA einmal online öffnen, damit die neue Service-Worker-Version geladen wird.


## Sprachauswahl als erster Einrichtungsschritt

Die erste Seite zeigt ausschließlich **WILLKOMMEN**, **Wähle deine Sprache**, vier Sprachoptionen und den Button **Weiter**. Beim Antippen einer Sprache wird sie lediglich markiert; die Überschrift und der Weiter-Button wechseln sofort in die ausgewählte Sprache. Die Auswahl wird erst durch **Weiter** dauerhaft gespeichert. Danach öffnet sich die bestehende Profilerstellung. Bei vorhandener Spracheinstellung wird die Sprachwahl übersprungen. Die Versionsnummer des Offline-Caches wurde aktualisiert.

## Home-Bildschirm statt Browser

**iPhone (iOS):** Die GitHub-Pages-HTTPS-Adresse in **Safari** öffnen, auf **Teilen** tippen, **Zum Home-Bildschirm** auswählen und mit **Hinzufügen** bestätigen. Danach die App über ihr neues Symbol auf dem Home-Bildschirm öffnen (nicht über den Safari-Tab). Die vorhandene `manifest.webmanifest` definiert `display: standalone`; auf iOS ergänzen die Apple-Web-App-Metadaten den Vollbild-/Standalone-Start. Bei manchen iOS-Versionen ist die Safari-Aktion erst unter „Aktionen bearbeiten“ sichtbar.

**Android:** GitHub-Pages-Seite in Chrome öffnen, Menü (drei Punkte) → **App installieren** beziehungsweise **Zum Startbildschirm hinzufügen**. Danach über das App-Symbol öffnen.

GitHub Pages dient nur zur Veröffentlichung. Die Trainingsdaten werden weiterhin lokal im Browser-/App-Speicher gehalten. Vor einem Wechsel zwischen Safari und Home-Bildschirm-App bitte eine JSON-Sicherung anlegen; Speicherbereiche können je nach Plattform getrennt sein.

**Ersteinrichtung:** Sprache markieren, **Weiter** drücken; daraufhin öffnet sich für neue Nutzer der vierstufige Profilassistent. Er startet auch dann, wenn die lokale Datenbank erst nach der Sprachauswahl geladen ist.


## Einrichtungsablauf (Version 23)

Die Einrichtung umfasst **fünf Schritte** mit einer einheitlichen segmentierten Fortschrittsanzeige:

1. Sprache auswählen und mit **Weiter** bestätigen.
2. Vor- und Nachname eingeben.
3. Geburtsdatum und Körpergröße erfassen.
4. Start- und Zielgewicht eingeben.
5. Trainingsziel festlegen und Profil speichern.

Die Sprachseite schaltet beim Klick auf **Weiter** unmittelbar auf die Profilerstellung um. Wenn IndexedDB noch lädt, wird der Übergang nach dem Laden nachgeholt. Die übrige App-Oberfläche bleibt während der ersten Einrichtung verborgen. Das Sprachmerkmal bleibt im bisherigen lokalen Speicher erhalten, ebenso alle Trainingsdaten.

**Prüfung:** Browser-Test mit leerem Speicher, Sprachwahl, Übergang, Navigation und Wiederaufruf nach Profilerstellung.
