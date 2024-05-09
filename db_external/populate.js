// here, i'm populating the local mysql db with all of our data (5 tables) in "twitter" db

var mysql = require('mysql');
const util = require('util');
const fs = require("fs/promises")
const path = require("path")

var con = mysql.createConnection({
  host: "localhost",
  user: "ODBC",
  password: "password"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

const query = util.promisify(con.query).bind(con);

(async () => {
    const cleanedData = JSON.parse(await fs.readFile(path.resolve(__dirname, "compiled.json"), 'utf8'));
    const sentimentData = JSON.parse(await fs.readFile(path.resolve(__dirname, "sentiments.json"), 'utf8'));
    const emotionsData = JSON.parse(await fs.readFile(path.resolve(__dirname, "emotions.json"), 'utf8'));
    await query("DROP DATABASE IF EXISTS twitter;")
    await query("CREATE DATABASE IF NOT EXISTS twitter;")
    await query("USE twitter;")
    await query("DROP TABLE IF EXISTS accounts;")
    await query(`
    CREATE TABLE IF NOT EXISTS accounts (
        name varchar(255),
        pfp varchar(255),
        accountlink varchar(255),
        PRIMARY KEY (name)
    );
    `)
    await query("DROP TABLE IF EXISTS tweets;")
    await query(`
    CREATE TABLE IF NOT EXISTS tweets (
        id_str varchar(255),
        posted_by varchar(255),
        created_at varchar(255),
        full_text varchar(500),
        PRIMARY KEY (id_str),
        FOREIGN KEY (posted_by) REFERENCES accounts(name)
    );
    `)
    
    await query("DROP TABLE IF EXISTS sentiments;")
    await query(`
    CREATE TABLE IF NOT EXISTS sentiments (
        id_str varchar(255),
        posted_by varchar(255),
        type varchar(50),
        score float,
        ratio float,
        FOREIGN KEY (posted_by) REFERENCES accounts(name),
        FOREIGN KEY (id_str) REFERENCES tweets(id_str)
    );
    `)
  
    await query("DROP TABLE IF EXISTS sentiment_keywords;")
    await query(`
    CREATE TABLE IF NOT EXISTS sentiment_keywords (
        id_str varchar(255),
        posted_by varchar(255),
        word varchar(255),
        score float,
        FOREIGN KEY (posted_by) REFERENCES accounts(name),
        FOREIGN KEY (id_str) REFERENCES tweets(id_str)
    );
    `)
    
    await query("DROP TABLE IF EXISTS emotions;")
    await query(`
    CREATE TABLE IF NOT EXISTS emotions (
        id_str varchar(255),
        posted_by varchar(255),
        emotion varchar(50),
        FOREIGN KEY (posted_by) REFERENCES accounts(name),
        FOREIGN KEY (id_str) REFERENCES tweets(id_str)
    );
    `)
    
    cleanedData.accounts.forEach(async function (account) {
        try {
            await query(`INSERT INTO accounts VALUES("${account.name}", "${account.pfp}", "${account.accountLink}");`)
        } catch (e) {
            console.log("skipped account tuple")
        }
    });
    cleanedData.tweets.forEach(async function (tweet) {
        try {
            await query(`INSERT INTO tweets VALUES("${tweet.id_str}", "${tweet.posted_by}", "${tweet.created_at}", "${tweet.full_text.replace(/"/gm, '\'')}");`)
        } catch (e) {
            console.log("skipped tweet tuple")
        }
    });
    sentimentData.forEach(async function (sentiment) {
        try {
            await query(`INSERT INTO sentiments VALUES("${sentiment.id_str}", "${sentiment.posted_by}", "${sentiment.sentiment.type}", "${sentiment.sentiment.score}", "${sentiment.sentiment.ratio}");`)
            sentiment.sentiment.keywords.forEach(async function (keyword) {
                try {
                    await query(`INSERT INTO sentiment_keywords VALUES("${sentiment.id_str}", "${sentiment.posted_by}", "${keyword.word}", "${keyword.score}");`)
                } catch (e) {
                    console.log("skipped keyword tuple")
                }
            })
        } catch (e) {
            console.log("skipped sentiment tuple")
        }
    });

    emotionsData.forEach(async function (emotion) {
        var detected = emotion.emotions.emotions_detected
        if (detected) detected.forEach(async function (namedEmotion) {
            try {
                await query(`INSERT INTO emotions VALUES("${emotion.id_str}", "${emotion.posted_by}", "${namedEmotion}");`)
            } catch (e) {
                console.log("skipped emotion tuple")
            }
        })
    })
})()



// Most common emotions of tweets by CNN
// SELECT emotion, posted_by, count(*) as quant
// FROM emotions
// WHERE posted_by="CNN"
// GROUP BY emotion
// ORDER BY quant DESC;


// Most common emotions of tweets by ALL SOURCES
// SELECT emotion, count(*) as quant
// FROM emotions
// GROUP BY emotion
// ORDER BY quant DESC;

// Most common sentiment keywords used by CNN
// SELECT word, posted_by, count(*) as quant
// FROM sentiment_keywords
// WHERE posted_by="CNN"
// GROUP BY word
// ORDER BY quant DESC
// LIMIT 20;

// Most common sentiment keywords used by ALL SOURCES
// SELECT word, count(*) as quant
// FROM sentiment_keywords
// GROUP BY word
// ORDER BY quant DESC;

// Average sentiment value of tweets by CNN
// SELECT AVG(score)
// FROM sentiments
// WHERE posted_by="CNN";

// Average sentiment value of tweets by ALL SOURCES
// SELECT AVG(score)
// FROM sentiments;

// GET ALL DATA BASED ON AUTHOR
// SELECT 
//     tweets.id_str,
//     tweets.posted_by,
//     tweets.created_at,
//     tweets.full_text,
//     (SELECT CONCAT(sentiment_info.type, ':', sentiment_info.score, ':', sentiment_info.ratio)
//      FROM 
//          (SELECT type, score, ratio
//           FROM sentiments 
//           WHERE tweets.id_str = sentiments.id_str) AS sentiment_info) AS sentiment,
//     (SELECT GROUP_CONCAT(emotion SEPARATOR ', ') 
//      FROM emotions 
//      WHERE tweets.id_str = emotions.id_str) AS emotions,
//      (SELECT GROUP_CONCAT(CONCAT(word, ':', score) SEPARATOR ', ') 
//      FROM sentiment_keywords 
//      WHERE tweets.id_str = sentiment_keywords.id_str) AS sentiment_keywords
// FROM 
//     tweets
// WHERE 
//     tweets.posted_by = "CNN";