const puppeteer = require('puppeteer');
const fs = require('fs');
const { parse } = require('csv-parse');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Pfad zur CSV-Datei
const csvFilePath = 'Tags.csv';


const tagList = [];

// CSV-Datei lesen und Spalte extrahieren
fs.createReadStream(csvFilePath)
  .pipe(parse({ delimiter: ',' }))
  .on('data', (row) => {
    // Füge den Wert der ersten Spalte zum Array hinzu
    tagList.push(row[0]);
  })



console.log('start');

// Funktion zum Schreiben in die CSV-Datei
function writeToCSV(filePath, data) {
    let csvContent = '';

    // Daten sortieren nach Benutzername
    data.sort((a, b) => a.username.localeCompare(b.username));

    // Daten formatieren und in CSV einfügen
    data.forEach(user => {
        csvContent += `${user.username},${user.ort},${user.job}\n`;
    });

    // Daten in CSV-Datei schreiben
    fs.writeFileSync(filePath, csvContent);
}

// Hauptfunktion
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Durchlauf für jede Tagliste
    for(const tag of tagList) {
        const usersFilePath = `Output/users-${tag}.csv`;
        let users = [];

        let pageNum = 1;
        let maxPageNum = 1;
        const amount = 36;

        await page.goto(`https://stackoverflow.com/questions/tagged/${tag}?tab=newest&page=${pageNum}&pagesize=50`);

        maxPageNum = await page.evaluate(() => {
            const pageButtons = document.querySelectorAll('.s-pagination--item');
            return Number(pageButtons[10].textContent);
        });

        while (pageNum <= maxPageNum && users.length < amount) {
            await page.goto(`https://stackoverflow.com/questions/tagged/${tag}?tab=newest&page=${pageNum}&pagesize=50`);

            const userLinks = await page.evaluate(() => {
                const userElements = document.querySelectorAll('.s-avatar');
                const links = [];
                for (const ele of userElements) {
                    if (String(ele.getAttribute('href')).includes('users'))
                        links.push(ele.getAttribute('href'));
                }
                return links;
            });


         
            const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));
            for (const userLink of userLinks) {
                await waitFor(5000);
                if (users.length >= amount) break;
                
                if(Math.random(10)<2) await page.goto(`https://stackoverflow.com/questions/tagged/${tag}?tab=newest&page=${pageNum}&pagesize=50`);

                await page.goto(`https://stackoverflow.com/${userLink}`);

                const username = await page.evaluate(() => {
                    const usernameElement = document.querySelector('.flex--item.mb12.fs-headline2.lh-xs');
                    return usernameElement ? usernameElement.textContent.trim() : null;
                });

                const job = await page.evaluate(() => {
                    const jobElement = document.querySelector('.mb8.fc-black-400.fs-title.lh-xs');
                    return jobElement ? jobElement.textContent.trim() : 'NULL';
                });

                const ort = await page.evaluate(() => {
                    const ortElement = document.querySelector('.wmx2.truncate');
                    return ortElement ? ortElement.textContent.trim() : 'NULL';
                });
                if(ort.toLowerCase().includes('germany')) continue;

                // Überprüfen, ob Benutzer bereits existiert
                const userExists = users.find(user => user.username === username && user.ort === ort && user.job === job);
                if (!userExists) {
                    // Benutzerdaten zum Array hinzufügen
                    users.push({ username: username || 'NULL', ort: ort || 'NULL', job: job || 'NULL' });
                }
            }
            pageNum++;
        }

        const filePath = `Output/Metadaten_von_tag-${tag}.csv`

        const csvWriter = createCsvWriter({
            path: filePath,
            header:[
                { id: 'username', title: 'Username'},
                { id: 'echtName', title: 'echt Name'},
                { id: 'alter', title: 'Alter'},
                { id: 'email', title: 'E-mail'},
                { id: 'telefonnummer', title: 'Telefonnummer'},
                { id: 'job', title: 'Job'},
                { id: 'linkedIn', title: 'ggf LinkedIn Account'},
            ],
            fieldDelimiter: ';'

            
        });
        
        csvWriter.writeRecords(users)
        .then(() => console.log('Datei erstellt'));
    
    }   

    await browser.close();
})();