const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'Publications';

app.get('/', (request, response) => {
  response.send('Hello, Publications');
})

app.get('/api/v1/papers', (request, response) => {
  database('papers').select().then((papers) => {
    response.status(200).json(papers);
  })
  .catch((error) => {
    response.status(500).json({ error });
  });
});

app.get('/api/v1/footnotes', (request, response) => {
  database('footnotes').select().then((footnotes) => {
    response.status(200).json(footnotes);
  })
  .catch((error) => {
    response.status(500).json({ error });
  });
});

app.post('/api/v1/papers', (request, response) => {
  const paper = request.body;
  console.log(paper)

  for (let requiredParameter of ['title', 'author']) {
    if (!paper[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { title: <String>, author: <String> }. You're missing a "${requiredParameter}" property.` });
    }
  }

  database('papers').insert(paper, 'id')
    .then(paper => {
      response.status(201).json({id: paper[0]});
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.post('/api/v1/footnotes', (request, response) => {
  const footnote = request.body;
  console.log(footnote)

  for (let requiredParameter of ['note', 'paper_id']) {
    if (!footnote[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { note: <String>, paper_id: <Integer> }. You're missing a "${requiredParameter}" property.` });
    } else {
      // find paper_id in papers db and return error if not found
      const paperId = parseInt(footnote['paper_id'], 10)
      console.log(paperId)
      paperFound = database('papers').where('id', paperId).first();
      console.log(paperFound)


    }
  }

  // if paper is found in db, insert footnote into footnotes db

  database('footnotes').insert(footnote, 'id')
    .then(footnote => {
      response.status(201).json({id: footnote[0]});
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`)
})