const puppeteer = require('puppeteer');
const fs = require('fs');
const { parse } = require('csv-parse');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


// Pfad zur CSV-Datei
const csvFilePath = 'Tags.csv';

const today = new Date()
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
    await page.setViewport({width: 1200, height: 720});

    await page.goto('https://stackoverflow.com/')
    const acceptCookies = await page.waitForSelector('#onetrust-accept-btn-handler')
    await page.click('#onetrust-accept-btn-handler')

    //Login
    await page.goto('https://stackoverflow.com/users/login?ssrc=head&returnurl=https%3a%2f%2fstackoverflow.com%2f')

    await page.waitForSelector('input#email.s-input')

    await page.evaluate(() => {
        document.querySelector('input#email.s-input').value = 'AndiiiiWand@gmail.com'
        document.querySelector('input#password.flex--item.s-input').value = 'Fortnite123'
    })

    await Promise.all([
        page.click('#submit-button'),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    // await page.click('#submit-button')

    // Durchlauf für jede Tagliste
    for(const tag of tagList) {
        const usersFilePath = `Output/users-${tag}.csv`;
        let users = [];

        let pageNum = 1;
        let maxPageNum = 1;
        const amount = 1;

        let dateBrake = 1

        await page.goto(`https://stackoverflow.com/questions/tagged/${tag}?tab=newest&page=${pageNum}&pagesize=50`);

        maxPageNum = await page.evaluate(() => {
            const pageButtons = document.querySelectorAll('.s-pagination--item');
            return Number(pageButtons[10].textContent);
        });

        let lastDate = new Date()
        
        const lastDateArray = await page.evaluate(() => {
            const timeElements = document.querySelectorAll('time.s-user-card--time');
            const date = new Date()
            let dateArray

            const months = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ];
            
            ele = timeElements[0]

            // Test Scenarios
            // ele.innerHTML = "yesterday"
            // ele.innerHTML = "23 hours ago"
            // ele.innerHTML = "Feb 22 at 11:58"
            // ele.innerHTML = "Dec 13, 2023 at 21:51"

            const innerArray = ele.innerHTML.split(" ")

            if(ele.innerHTML.includes('hour') || ele.innerHTML.includes('day')) {
                let hour = innerArray[0]

                if(date.getHours() < hour) {
                    hour = 24+(date.getHours()-hour)
                    date.setDate(date.getDate() - 1);
                }

                dateArray = [date.getDate(), Number(date.getMonth()), date.getFullYear(), Number(hour), date.getMinutes()]

                return dateArray
            } else {

                if(String(innerArray[2]).length == 4) {
                    const month = innerArray[0]
                    const monthIndex = months.indexOf(month);

                    const day = innerArray[1].replace(",", "")

                    const year = innerArray[2]

                    const timeString = innerArray[4]
                    const hour = timeString.split(":")[0]
                    const minutes = timeString.split(":")[1]

                    dateArray = [Number(day), monthIndex, Number(year), Number(hour)+1, Number(minutes)]

                    return dateArray
                }

                const month = innerArray[0]
                const monthIndex = months.indexOf(month);

                const day = innerArray[1]

                const timeString = innerArray[3]
                const hour = timeString.split(":")[0]
                const minutes = timeString.split(":")[1]

                dateArray = [Number(day)+1, monthIndex, date.getFullYear(), Number(hour+2), Number(minutes)]
            }

            return dateArray;
        });

            console.log(lastDateArray)

            lastDate.setDate(lastDateArray[0])
            lastDate.setMonth(lastDateArray[1])
            lastDate.setYear(lastDateArray[2])
            lastDate.setHours(lastDateArray[3] || today.getHours())
            lastDate.setMinutes(lastDateArray[4])

            console.log(lastDate)
            
            // Save the last date
            if(!fs.existsSync('lastDates')) fs.mkdirSync('lastDates')
            const datePath = `LastDates/lastDate-${tag}.txt`
            fs.writeFile(datePath, String(lastDate),'utf8', err => {
                if(err) console.error(err)
            })

            // break

        while (pageNum <= maxPageNum && users.length < amount && dateBrake > 0) {
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
                if (users.length >= amount) break;
                
                await page.goto(`https://stackoverflow.com/${userLink}`);

                const username = await page.evaluate(() => {
                    const usernameElement = document.querySelector('.flex--item.mb12.fs-headline2.lh-xs');
                    return usernameElement ? usernameElement.textContent.trim() : null;
                });
                if(username.toLowerCase().includes('duhu')) continue;

                const job = await page.evaluate(() => {
                    const jobElement = document.querySelector('.mb8.fc-black-400.fs-title.lh-xs');
                    return jobElement ? jobElement.textContent.trim() : 'NULL';
                });

                const ort = await page.evaluate(() => {
                    const ortElement = document.querySelector('.wmx2.truncate');
                    return ortElement ? ortElement.textContent.trim() : 'NULL';
                });
                if(ort != 'NULL') console.log(ort)
                if(!ort.toLowerCase().includes('germany')) continue;

                // Überprüfen, ob Benutzer bereits existiert
                const userExists = users.find(user => user.username === username && user.ort === ort && user.job === job);
                if (!userExists) {
                    // Benutzerdaten zum Array hinzufügen
                    users.push({ username: username || 'NULL', ort: ort || 'NULL', job: job || 'NULL' });
                }
            }
            pageNum++;
            console.log(users)
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