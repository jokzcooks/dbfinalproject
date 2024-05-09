
const mysql = require('mysql');
const util = require('util');

class DB {
  con;
  query;
  accounts;

  constructor() {
    this.con = mysql.createConnection({
      host: "localhost",
      user: "ODBC",
      password: "password",
      insecureAuth : true
    });
    console.log(this.con)
    this.query = util.promisify(this.con.query).bind(this.con);
    this.accounts = null;
    this.userTweets = {};
  }
  
  async getAccounts() {
    console.log("Getting accounts")
    if (this.accounts != null) return this.accounts
    try { 
      await this.query("use twitter;");
      var results = await this.query(`SELECT * FROM ACCOUNTS`)
      console.log(results)
      this.accounts = {
        valid: true,
        results
      };
      return this.accounts;
    } catch (e) {
      console.log(e)
      console.log("error")
      return {
        valid: false,
        error: e.sqlMessage
      }
    }
  }
  async getUserTweets(accountName) {
    console.log("Getting tweets by", accountName)
    if (this.userTweets[accountName] != null) return this.userTweets[accountName]
    try { 
      await this.query("use twitter;");
      // everywhere that we're passing accountName is vulnerable to sqli, but query filtering is beyond the scope of this project
    //   var results = await this.query(`SELECT * FROM tweets
    //   WHERE posted_by="${accountName}";`)
    var results = await this.query(`SELECT 
    tweets.id_str,
    tweets.posted_by,
    tweets.created_at,
    tweets.full_text,
    (SELECT CONCAT(sentiment_info.type, ':', sentiment_info.score, ':', sentiment_info.ratio)
     FROM 
         (SELECT type, score, ratio
          FROM sentiments 
          WHERE tweets.id_str = sentiments.id_str) AS sentiment_info) AS sentiment,
    (SELECT GROUP_CONCAT(emotion SEPARATOR ', ') 
     FROM emotions 
     WHERE tweets.id_str = emotions.id_str) AS emotions,
     (SELECT GROUP_CONCAT(CONCAT(word, ':', score) SEPARATOR ', ') 
     FROM sentiment_keywords 
     WHERE tweets.id_str = sentiment_keywords.id_str) AS sentiment_keywords
FROM 
    tweets
WHERE 
    tweets.posted_by = "${accountName}";`)

    // sorted list of emotions by account
    var rankedEmotions = await this.query(`
        SELECT emotion, posted_by, count(*) as quant
        FROM emotions
        WHERE posted_by="${accountName}"
        GROUP BY emotion
        ORDER BY quant DESC;
    `)

    // sorted list of emotions by account
    var rankedSentimentKeywords = await this.query(`
        SELECT word, AVG(score), posted_by, count(*) as quant
        FROM sentiment_keywords
        WHERE posted_by="CNN"
        GROUP BY word
        ORDER BY quant DESC
        LIMIT 20;
    `)

    // average sentiment score
    var averageSentiment = await this.query(`
        SELECT AVG(score)
        FROM sentiments
        WHERE posted_by="${accountName}";
    `)

      this.userTweets[accountName] = {
        valid: true,
        results,
        rankedEmotions,
        rankedSentimentKeywords,
        averageSentiment
      };
      return this.userTweets[accountName];
    } catch (e) {
      console.log(e)
      console.log("error")
      return {
        valid: false,
        error: e.sqlMessage
      }
    }
  }

}

module.exports = DB;