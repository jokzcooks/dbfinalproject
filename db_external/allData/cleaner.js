// I have loads of raw tweet data from twitter's api, and i need to refactor this into just the specific information that i need from each news source
// Here I'm exporting accounts and tweets to be later added to the local sql db

const fs = require("fs/promises");
const path = require("path");

(async() => {
    const rawFiles = await fs.readdir(path.resolve(__dirname, "./rawData"))
    rawFiles.forEach(async (fileName) => {
        const cleaned = {}
        const rawData = JSON.parse(await fs.readFile(path.resolve(__dirname, "rawData", fileName), 'utf8'));
        const accountData = rawData[0].content.itemContent.tweet_results.result.core.user_results.result.legacy
        cleaned["account"] = {
            "name": accountData.screen_name,
            "pfp": accountData.profile_image_url_https,
            "accountLink": `https://twitter.com/${accountData.screen_name}`,
        }
        cleaned["tweets"] = []
        rawData.forEach(async (entry) => {
            if (!entry.entryId.startsWith("tweet")) return;
            const tweetRawData = entry.content.itemContent.tweet_results.result
            const tweetData = {
                posted_by: cleaned["account"]["name"],
                created_at: tweetRawData["legacy"]["created_at"],
                full_text: tweetRawData["legacy"]["full_text"],
                id_str: tweetRawData["legacy"]["id_str"],
            }
            cleaned["tweets"].push(tweetData)
        })
        await fs.writeFile(path.resolve(__dirname, "cleanedData", fileName), JSON.stringify(cleaned), 'utf8');
    })
})()