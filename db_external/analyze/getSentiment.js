// here, i'm using a freemium sentiment analysis api from rapidapi
// i simply pass each tweet to the api, and export the results

const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");

(async() => {
    var tweetList = JSON.parse(await fs.readFile(path.resolve(__dirname, "..", "compiled.json"))).tweets
    const sentiments = []
    var interval = 10;
    var counter = 0;
    var promise = Promise.resolve();
    tweetList.forEach(function (tweet) {
      promise = promise.then(function () {
        return new Promise(function (resolve) {
          setTimeout(() => {
            const options = {
                method: 'GET',
                url: 'https://twinword-sentiment-analysis.p.rapidapi.com/analyze/',
                params: {
                  text: tweet.full_text.split("https://t.co")[0]
                },
                headers: {
                  'X-RapidAPI-Key': '...',
                  'X-RapidAPI-Host': 'twinword-sentiment-analysis.p.rapidapi.com'
                }
              };
            axios.request(options)    
                .then(async function(response) {
                    sentiments.push({
                        id_str: tweet.id_str,
                        sentiment: response.data
                    })
                    await fs.writeFile( path.resolve(__dirname, "..", `sentiments.json`), JSON.stringify(sentiments), 'utf8');
                    counter++
                    console.log(`Resolving #${counter}`)
                    resolve({
                    success: true,
                    data: response.data
                    });
              })
              .catch(function(error) {
                counter++
                console.log(`\t\tERROR AT #${counter}`)
                    
                resolve({ success: false });
              });
          ;
          }
        , interval);
        });
      });
    });
    
    promise.then(function (res) {
      console.log('Loop finished.');
    });

})()