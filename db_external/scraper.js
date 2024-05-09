// here, i'm using a simple workaround for the twitter api's new developer paywall
// i'm simply pulling auth data from a valid browser session so that i can automate the process
// after around 800 requests, twitter rate limits, so i simply repeat the process
// since i only need a couple thousand tweets for the minimum viable product, this is fine

const axios = require("axios")
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
var fs = require('fs/promises');
const path = require("path")
const headers = {
    "Host": `twitter.com`,
    "Sec-Ch-Ua": `"Not-A.Brand";v="99", "Chromium";v="124"`,
    "X-Twitter-Client-Language": `en`,
    "Sec-Ch-Ua-Mobile": `?0`,
    "Content-Type": `application/json`,
    "X-Twitter-Auth-Type": `OAuth2Session`,
    "X-Twitter-Active-User": `yes`,
    "Sec-Ch-Ua-Platform": `"Windows"`,
    "Accept": `*/*`,
    "Sec-Fetch-Site": `same-origin`,
    "Sec-Fetch-Mode": `cors`,
    "Sec-Fetch-Dest": `empty`,
    "Accept-Encoding": `gzip, deflate, br`,
    "Accept-Language": `en-US,en;q=0.9`,
    "Priority": `u=1, i`
}

var variables = {
    "count": 100,
    "includePromotedContent": true,
    "withQuickPromoteEligibilityTweetFields": true,
    "withVoice": true,
    "withV2Timeline": true
}
const features = {
    "rweb_tipjar_consumption_enabled": true,
    "responsive_web_graphql_exclude_directive_enabled": true,
    "verified_phone_label_enabled": false,
    "creator_subscriptions_tweet_preview_api_enabled": true,
    "responsive_web_graphql_timeline_navigation_enabled": true,
    "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false,
    "communities_web_enable_tweet_community_results_fetch": true,
    "c9s_tweet_anatomy_moderator_badge_enabled": true,
    "articles_preview_enabled": true,
    "tweetypie_unmention_optimization_enabled": true,
    "responsive_web_edit_tweet_api_enabled": true,
    "graphql_is_translatable_rweb_tweet_is_translatable_enabled": true,
    "view_counts_everywhere_api_enabled": true,
    "longform_notetweets_consumption_enabled": true,
    "responsive_web_twitter_article_tweet_consumption_enabled": true,
    "tweet_awards_web_tipping_enabled": false,
    "creator_subscriptions_quote_tweet_preview_enabled": false,
    "freedom_of_speech_not_reach_fetch_enabled": true,
    "standardized_nudges_misinfo": true,
    "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": true,
    "tweet_with_visibility_results_prefer_gql_media_interstitial_enabled": true,
    "rweb_video_timestamps_enabled": true,
    "longform_notetweets_rich_text_read_enabled": true,
    "longform_notetweets_inline_media_enabled": true,
    "responsive_web_enhance_cards_enabled": false
}
const fieldToggles = {"withArticlePlainText":false}


const endpoint = "/i/api/graphql/.../UserTweets"
headers["User-Agent"] = `...`
headers["Cookie"] = `...`
headers["X-Csrf-Token"] = `...`
headers["Authorization"] = `...`
headers["X-Client-Transaction-Id"] = `...`
headers["X-Client-Uuid"] = `...`
headers["Referer"] = `...`
variables["userId"] = "..."

var tweets = [

]

var cursor = null;

var counter = 0;

const scrape = async () => {

    if (tweets.length > 1000) {
        return tweets
    }
    if (cursor) {
        variables.cursor = cursor
    } else {
        variables.cursor = null
    }
    const url = `https://twitter.com`
    + endpoint
    + "?variables=" + encodeURIComponent(JSON.stringify(variables))
    + "&features=" + encodeURIComponent(JSON.stringify(features))
    + "&fieldToggles=" + encodeURIComponent(JSON.stringify(fieldToggles));


    console.log("making request!")
    const res = await axios(url, {
        method: "GET",
        headers
    })
    if (res.status == 200) {
        var data = res.data.data
        var instructions = data["user"]["result"]["timeline_v2"]["timeline"]["instructions"]
        if (!instructions) return console.log("ERROR: NO INSTRUCTIONS PROVIDED BY GRAPHQL")
        if (instructions[0]["type"] == "TimelineClearCache") {
            var entries
            if (instructions[1]["type"] == "TimelinePinEntry") {
                entries = [...instructions[2].entries]
            } else {
                entries = [...instructions[1].entries]
            }
            tweets = [...tweets, ...entries]
            cursor = entries.find(entry => entry.entryId.startsWith("cursor-bottom"))?.content.value || ""
        } else if (instructions[0]["type"] == "TimelinePinEntry") {
            var entries = [...instructions[1].entries]
            tweets = [...tweets, ...entries]
            cursor = entries.find(entry => entry.entryId.startsWith("cursor-bottom"))?.content.value || ""
        } else if (instructions[0]["type"] == "TimelineAddEntries") {
            var entries = [...instructions[0].entries]
            tweets = [...tweets, ...entries]
            cursor = entries.find(entry => entry.entryId.startsWith("cursor-bottom"))?.content.value || ""
        } else {
            return console.log("ERROR: NO TWEET ENTRIES")
        }

        console.log("New Total:\t", tweets.length)
        console.log("Cursor:\t", cursor)
        await sleep(2500)
        counter++
        await fs.writeFile( path.resolve(__dirname, "tweets", `tweet-${counter}.json`), JSON.stringify(tweets), 'utf8');
        return await scrape()

    } else {
        return console.log("ERROR: NO INSTRUCTIONS PROVIDED BY GRAPHQL")
    }
}

(async() => {
    await scrape()
    await fs.writeFile(path.resolve(__dirname, "tweets.json"), JSON.stringify(tweets), 'utf8');
})()