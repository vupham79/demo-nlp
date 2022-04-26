const { NlpManager } = require("node-nlp");
const intents = require("./intents.json");
const fs = require("fs");
const express = require("express");

const port = 9009;
const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
const nlpManager = new NlpManager({ languages: ["en"] });
(async () => {
  if (fs.existsSync("./model.nlp")) {
    nlpManager.load("./model.nlp");
  } else {
    // Adds the utterances and intents for the NLP
    intents.intents.forEach((intent) => {
      intent.expressions.forEach(exp => {
        nlpManager.addDocument("en", exp, intent.name);
      })
    });

    const hrstart = process.hrtime();
    await nlpManager.train();
    await nlpManager.save();

    const hrend = process.hrtime(hrstart);
    console.info('Trained (hr): %ds %dms', hrend[0], hrend[1] / 1000000);
  }
})()

app.get('/', async function(req, res) {
  const foundIntent = await nlpManager.process('en', req.query.message)
  res.render('index', { foundIntent });
});

app.get('/*', function (req, res) {
  res.render('404');
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`)
})

