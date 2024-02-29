const puppeteer = require('puppeteer');
const fs = require('fs');

const tagList = [
    'apex',
    'salesforce',
];

console.log('start');

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

        await page.goto(`https://stackoverflow.com/questions/tagged/${tag}?tab=newest&page=${pageNum}&pagesize=50`);

        maxPageNum = await page.evaluate(() => {
            const pageButtons = document.querySelectorAll('.s-pagination--item');
            return Number(pageButtons[10].textContent);
        });

        while (pageNum <= maxPageNum && users.length < 4) {
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

            for (const userLink of userLinks) {
                if (users.length >= 4) break;

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

                // Überprüfen, ob Benutzer bereits existiert
                const userExists = users.find(user => user.username === username && user.ort === ort && user.job === job);
                if (!userExists) {
                    // Benutzerdaten zum Array hinzufügen
                    users.push({ username: username || 'NULL', ort: ort || 'NULL', job: job || 'NULL' });
                }
            }

            pageNum++;
        }

        // Schreiben der Benutzerdaten in die CSV-Datei
        const csvContent = users.map(user => `${user.username}, ${user.ort},${user.job}`).join('\n');
        fs.writeFileSync(usersFilePath, csvContent);
        console.log(`CSV-Datei wurde erfolgreich erstellt: ${usersFilePath}`);
    }

    await browser.close();
})();