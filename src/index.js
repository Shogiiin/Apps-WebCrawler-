const puppeteer = require('puppeteer');
const fs = require('fs');

const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"]

const tagList = [
    'apex',
    'salesforce',
];

console.log('start');

// Hauptfunktion
(async () => {

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    await page.goto('https://stackoverflow.com')

    //check if cloudflare is active
    await page.waitForSelector('body')
    if(await page.evaluate(() => {
        const documentBody = document.querySelector('body')
        // if(documentBody.className == "no-js") return true
        return documentBody.classList.contains("no-js")
    })) {
        console.error('Cloudflare kicked in.')
        // await browser.close()
        return
    }

    // accept cookies :)
    await page.waitForSelector('#onetrust-accept-btn-handler')
    await page.click('#onetrust-accept-btn-handler')
    // await page.waitForNavigation({waitUntil: 'networkidle2'})
    // await page.click('#onetrust-accept-btn-handler')


    //cycle through all tags the user has selected
    for(const tag of tagList) {
        const usersFilePath = `Output/users-${tag}.csv`;
        let users = [];

        let pageNum = 1;
        let maxPageNum = 1;

        await page.goto(`https://stackoverflow.com/questions/tagged/${tag}?tab=newest&page=1&pagesize=50`)

        //check if cloudflare is active
        await page.waitForSelector('body')
        if(await page.evaluate(() => {
            const documentBody = document.querySelector('body')
            // if(documentBody.className == "no-js") return true
            return documentBody.classList.contains("no-js")
        })) {
            console.error('Cloudflare kicked in.')
            // await browser.close()
            return
        }

        maxPageNum = await page.evaluate((pageNum) => {
            const pageButtons = document.querySelectorAll('.s-pagination--item')
            return Number(pageButtons[10].textContent)
        })
        while(pageNum <= maxPageNum) {
            await page.goto(`https://stackoverflow.com/questions/tagged/${tag}?tab=newest&page=${pageNum}&pagesize=50`)

            //check if cloudflare is active
            await page.waitForSelector('body')
            if(await page.evaluate(() => {
                const documentBody = document.querySelector('body')
                // if(documentBody.className == "no-js") return true
                return documentBody.classList.contains("no-js")
            })) {
                console.error('Cloudflare kicked in.')
                // await browser.close()
                return
            }
            
            const userLinks = await page.evaluate(() => {
                const userCards = document.querySelectorAll('.s-user-card.s-user-card__minimal')
                let links = []

                for(const card of userCards) {
                    for(const child of card.childNodes) {
                        if(child.tagName === 'TIME') {
                            const d = new Date();
                            let month = month[d.getMonth()];

                            for(const cc of child.childNodes) {
                                if(cc.tagName === 'span') {
                                    let postDate = cc.textContent
                                    if(months.includes(postDate.toLowerCase().split(' ')[1])) {
                                        const lastMonth = months.findIndex(postDate.toLowerCase().split(' ')[0])

                                    } else return []
                                }
                            }
                        }
                        if(child.tagName === 'A') {
                            if(String(ele.getAttribute('href')).includes('users'))
                                links.push(ele.getAttribute('href'))
                        }
                    }
                }


                // for(const ele of userElements) {
                //     if(String(ele.getAttribute('href')).includes('users'))
                //         links.push(ele.getAttribute('href'))
                // }
                return links
            })
            console.log(userLinks)
            break


        //     let count = 0
        //     for(const userLink of userLinks) {
        //         await page.goto(`https://stackoverflow.com/${userLink}`)

        //         //check if cloudflare is active
        //         await page.waitForSelector('body')
        //         if(await page.evaluate(() => {
        //             const documentBody = document.querySelector('body')
        //             // if(documentBody.className == "no-js") return true
        //             return documentBody.classList.contains("no-js")
        //         })) {
        //             console.error('Cloudflare kicked in.')
        //             // await browser.close()
        //             return
        //         }

        //         const username = await page.evaluate(() => {
        //             if(document.querySelector('.flex--item.mb12.fs-headline2.lh-xs')) 
        //                 return document.querySelector('.flex--item.mb12.fs-headline2.lh-xs').textContent.trim()
        //             return null
        //         })
        //         const job = await page.evaluate(() => {
        //             if(document.querySelector('.mb8.fc-black-400.fs-title.lh-xs')) 
        //                 return document.querySelector('.mb8.fc-black-400.fs-title.lh-xs').textContent.trim()
        //             return null
        //         })
        //         const ort = await page.evaluate(() => {
        //             if(document.querySelector('.wmx2.truncate')) 
        //                 return document.querySelector('.wmx2.truncate').textContent.trim()
        //             return null
        //         })

                
        //         //check if user is saved
        //         if(fs.existsSync(`Output/users-${tag}`)) {
        //             let savedUsers = []
        //             savedUsers = JSON.parse(fs.readFileSync(`Output/users-${tag}`))
        //             if(savedUsers.filter(e => e.username === username).length > 0) {
        //                 // console.log(`Skipped adding user : ${username}`)
        //                 continue
        //             }
        //         }

        //         //checks if user is from germany
        //         // if(!ort === null) {
        //         //     if(!ort.includes('Germany')) continue
        //         // }
                
        //         if(users.filter(e => e.username === username).length > 0) continue
        //         users.push({ username: username, ort: ort, job: job })
        //         // console.log(count)
        //         count++
        //         if(count > 4) break;
        //     }
        //     if(count > 4) break;
        // }
        
        // const path = `Output/users-${tag}`

        // //write info to designated file if there is any

        // if (!fs.existsSync('Output')) {
        //     fs.mkdirSync('Output', { recursive: true });
        // }

        // console.log(users)
        // if(users.length == 0) {
        //     console.log(`No (new) users found for ${tag}, continuing with next tag.`)
        //     continue
        // }

        // if(fs.existsSync(path)) {
        //     const fileContent = fs.readFileSync(path)
        //     let JSONdataToWrite = []
        //     JSONdataToWrite = JSON.parse(fileContent)

        //     for(const user of users) {
        //         JSONdataToWrite.push(user)
        //     }

        //     const dataToWrite = JSON.stringify(JSONdataToWrite)

        //     fs.writeFile(path, dataToWrite, (err) => {
        //         if(err) throw err
        //         console.log(`File edited! : ${path}`)
        //     })
        // } else {
        //     let counter = 0
        //     let dataToWrite = '['
        //     for(const user of users) {
        //         if(counter>0) dataToWrite += ','
        //         dataToWrite += JSON.stringify(user)
        //         counter++
        //     }
        //     dataToWrite += ']'

        //     fs.writeFile(path, dataToWrite, (err) => {
        //         if(err) throw err
        //         console.log(`File created! : ${path}`)
        //     })
        }

        // await timeout(5000)
    }

    // close Browser after 5 sec
    // timeout(3000)
    await browser.close()
})()