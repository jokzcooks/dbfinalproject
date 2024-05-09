// now i have well formatted data from the twitter api for each news source
// here, i'm joining all of this data into one file

const fs = require("fs/promises");
const path = require("path");

(async() => {
    var accounts = []
    var tweets = []
    const cleanedFiles = await fs.readdir(path.resolve(__dirname, "./cleanedData"))
    cleanedFiles.forEach(async (fileName) => {
        const cleanedData = JSON.parse(await fs.readFile(path.resolve(__dirname, "cleanedData", fileName), 'utf8'));
        accounts.push(cleanedData.account)
        tweets.push(...cleanedData.tweets)
        const compiled = {accounts, tweets}
        await fs.writeFile(path.resolve(__dirname, "..", "compiled.json"), JSON.stringify(compiled), 'utf8');
    })
})()