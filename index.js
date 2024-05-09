const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const DBC = require('./db_internal/db');
const app = express();
const DB = new DBC();

app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.json());

app.get("/accounts", async(req, res) => {
  res.send(await DB.getAccounts())
  return
})

app.get("/tweets/:account", async(req, res) => {
  if (req.params.account) {
    res.send(await DB.getUserTweets(req.params.account))
  } else {
    res.send({valid: false, error: "Request must be /query/(1-6)!"})
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});
const port = process.env.PORT || 5000;
app.listen(port);
console.log(`listening on ${port}`);