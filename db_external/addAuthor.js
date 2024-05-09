// for ease of use, i want to add the original tweet's author to the tuples for emotions and sentiments
// i absolutely could just get this based on the already stored tweet id, and the foreign author key in the tweet tuple, but i want to have very simple sql queries

const fs = require("fs/promises");
const path = require("path");

(async() => {
    const compiledData = JSON.parse(await fs.readFile(path.resolve(__dirname, "compiled.json"), 'utf8'));
    var {tweets} = compiledData
    tweets = tweets.map(tweet => ({posted_by: tweet.posted_by, id_str: tweet.id_str}))
    
    // fix emotions
    var emotionsData = JSON.parse(await fs.readFile(path.resolve(__dirname, "emotions.json"), 'utf8'));
    emotionsData = emotionsData.map(emotion => {
        return {...emotion, posted_by: tweets.find(tweet => tweet.id_str == emotion.id_str).posted_by}
    })
    await fs.writeFile(path.resolve(__dirname, "emotions.json"), JSON.stringify(emotionsData), 'utf8');


    // fix sentiments
    var sentimentsData = JSON.parse(await fs.readFile(path.resolve(__dirname, "sentiments.json"), 'utf8'));
    sentimentsData = sentimentsData.map(sentiment => {
        return {...sentiment, posted_by: tweets.find(tweet => tweet.id_str == sentiment.id_str).posted_by}
    })
    await fs.writeFile(path.resolve(__dirname, "sentiments.json"), JSON.stringify(sentimentsData), 'utf8');

})()