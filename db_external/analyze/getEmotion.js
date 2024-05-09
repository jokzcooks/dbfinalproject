// here, i'm using a freemium emotion analysis api from rapidapi
// i simply pass each tweet to the api, and export the results

const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");

(async() => {
    var tweetList = JSON.parse(await fs.readFile(path.resolve(__dirname, "..", "compiled.json"))).tweets
    const emotions = []
    var interval = 10;
    var counter = 0;
    var promise = Promise.resolve();
    tweetList.forEach(function (tweet) {
      promise = promise.then(function () {
        return new Promise(function (resolve) {
          setTimeout(() => {
            const encodedParams = new URLSearchParams();
            encodedParams.set('text', tweet.full_text.split("https://t.co")[0]);
            const options = {
              method: 'POST',
              url: 'https://twinword-emotion-analysis-v1.p.rapidapi.com/analyze/',
              headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'X-RapidAPI-Key': '...',
                'X-RapidAPI-Host': 'twinword-emotion-analysis-v1.p.rapidapi.com'
              },
              data: encodedParams,
            };
            axios.request(options)    
                .then(async function(response) {
                    emotions.push({
                        id_str: tweet.id_str,
                        emotions: response.data
                    })
                    await fs.writeFile( path.resolve(__dirname, "..", `emotions.json`), JSON.stringify(emotions), 'utf8');
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