const puppeteer = require('puppeteer')
const fs = require('fs');

const tagList = [
    'apex',
    'salesforce',
]


console.log('start');

// create own timeout function cause js's is ...
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let pageNum = 1;
let maxPageNum = 1;

(async () => {

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    // accept cookies :)
    await page.goto('https://stackoverflow.com')
    await page.waitForSelector('#onetrust-accept-btn-handler');
    await page.click('#onetrust-accept-btn-handler')
    // await page.waitForNavigation({waitUntil: 'networkidle2'})
    // await page.click('#onetrust-accept-btn-handler')


    //cycle through all tags the user has selected
    for(const tag of tagList) {
        // create array for user data
        // template** users.push({ username: '', klarName: '', job: '' })
        const users = []

        pageNum = 1
        maxPageNum = 1


        await page.goto(`https://stackoverflow.com/questions/tagged/${tag}?tab=newest&page=1&pagesize=50`)
        maxPageNum = await page.evaluate((pageNum) => {
            const pageButtons = document.querySelectorAll('.s-pagination--item')
            return Number(pageButtons[10].textContent)
        })
        console.log(maxPageNum)

        while(pageNum <= maxPageNum) {
            await page.goto(`https://stackoverflow.com/questions/tagged/${tag}?tab=newest&page=${pageNum}&pagesize=50`)
            
            const userLinks = await page.evaluate(() => {
                const userElements = document.querySelectorAll('.s-avatar')
                const links = []
                for(const ele of userElements) {
                    if(String(ele.getAttribute('href')).includes('users'))
                        links.push(ele.getAttribute('href'))
                }
                return links
            })

            console.log(userLinks)
            
            for(const userLink of userLinks) {
                page.goto(`https://stackoverflow.com/${userLink}`)

                let username = "unknown"
                let job = "unknown"
                let klarName = "unknown"

                const usernameSelector = await page.waitForSelector('.fs-headline2')
                username = await usernameSelector?.evaluate(el => el.textContent);
                const jobSelector = await page.waitForSelector('.fs-title')
                job = await jobSelector?.evaluate(el => el.textContent);
                console.log(`${username.trim()} ${job.trim()} ${klarName.trim()}`)
            }
            
        }
    await timeout(5000)
    }

    // close Browser after 5 sec
    timeout(3000)
    await browser.close()
})()