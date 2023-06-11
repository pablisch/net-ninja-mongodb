const express = require("express"); // requires express that has already been installed
const { ObjectId } = require('mongodb')
const { connectToDb, getDb } = require('./db')

// init app & middleware
const app = express(); // initialises app as express
const port = 3000; // sets the port which makes it easier to change if needed
app.use(express.json()) // 👻 Parses any json coming in from req so it can be used in handler functions!

// db connection
let db;
connectToDb((err) => { // connect to DB (see db.js) passing in err as arg to the callback
  if (!err) { //if no error returned, i.e. successful connection
    app.listen(port, () => { // app is listening on the set port
      console.log(`app listening in port ${port}`)
    });
    db = getDb() // db set to getDb() which is how we communicate with the DB
  }
})

//routes
app.get('/books', (req, res) => { // handle the get route '/books' for all books
  // pagination settings
  const page = req.query.p || 0 // 0 if req.query.p has no value
  const booksPerPage = 1

  let books = []

  db.collection('books') // .collections is a function to specify a collection
    .find() // cursor object that points to the data
    .sort({ author: 1 }) // sort books by author
    .skip(page * booksPerPage) // skips x books depending on page requested
    .limit(booksPerPage) // limit the number of items returned
    .forEach(book => books.push(book)) // push each book into the books array
    .then(() => { // .then to handle the asynchronous function
    res.status(200).json(books) // a successful repsonse returns books as a json object
    })
    .catch(() => {
    res.status(500).json({error: 'No books today!'})
  }) // an unsuccessful response returns an error message
})

app.get('/books/:id', (req, res) => { // handle the get route '/books/:id' for a single book

  if (ObjectId.isValid(req.params.id)) { // check if ID string is 24 hex chars
    db.collection('books') 
    .findOne({_id: new ObjectId(req.params.id)}) 
    .then((doc) => { 
    res.status(200).json(doc) 
    })
    .catch(() => {
    res.status(500).json({error: 'That book is missing!'})
  }) 
  } else { // if not 24 hex chars
    res.status(500).json({error: 'Not a valid document ID'}) // error where invalid ID string is given
  } 
})



app.delete('/books/:id', (req, res) => { // handle the delete route '/books/:id' to delete a single book

  if (ObjectId.isValid(req.params.id)) { // check if ID string is 24 hex chars
    db.collection('books') 
    .deleteOne({_id: new ObjectId(req.params.id)}) 
    .then((result) => { 
    res.status(200).json(result) 
    })
    .catch((err) => {
    res.status(500).json({error: 'Could not delete that document!'})
  }) 
  } else { // if not 24 hex chars
    res.status(500).json({error: 'Not a valid document ID'}) // error where invalid ID string is given
  } 
})

app.post('/books', (req, res) => { // POST route to create a book document
  const book = req.body

  db.collection('books')
    .insertOne(book)
    .then(result => {
      res.status(201).json(result)
    })
    .catch(err => {
      res.status(500).json({err: 'Could not create new document'})
  })
})

app.patch('/books/:id', (req, res) => {
  const updates = req.body;

  if (ObjectId.isValid(req.params.id)) { // check if ID string is 24 hex chars
    db.collection('books') 
    .updateOne({_id: new ObjectId(req.params.id)}, {$set: updates}) 
    .then((result) => { 
    res.status(200).json(result) 
    })
    .catch((err) => {
    res.status(500).json({error: 'Could not update that document!'})
  }) 
  } else { // if not 24 hex chars
    res.status(500).json({error: 'Not a valid document ID'}) // error where invalid ID string is given
  } 
})
