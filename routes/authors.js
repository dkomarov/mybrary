const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book =  require('../models/book')

// All Authors Route
router.get('/', async (req, res) => {
  let searchOptions = {}

  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i') // case in-sensitive
  }
  
  try { 
    const authors = await Author.find(searchOptions) // find all authors ({})
    let params = {
      authors: authors,
      searchOptions: req.query
    }
    if (req.query.name == '') { params.errorMessage = 'Blank search request. Showing all authors.'}
    res.render('authors/index', params)
    // res.render('authors/index', { authors: authors, 
    //                               searchOptions: req.query, } )
  }
  catch {
    res.redirect('/')
  }

});

// New Author Route
router.get('/new', (req, res) => {
  res.render('authors/new', { author: new Author() })
});

// Create Author Route
router.post('/', async (req, res) => {
  
  const author = new Author({
    name: req.body.name
  })

  try {
    const newAuthor = await author.save()
    res.redirect(`authors/${newAuthor.id}`)
  } catch {
      res.render('authors/new', {
        author: author,
        errorMessage: 'Error creating Author'
      })
  }
 });

 router.get('/:id', async (req, res) => {
   try {
    const author = await Author.findById(req.params.id)
    const books = await Book.find({ author: author.id }).limit(6).exec()
    // let booksByAuthor = books
    res.render('authors/show', {
      author: author,
      booksByAuthor: books
    })
   } catch {
      res.redirect('/')
   }
   // res.send('Show Author ' + req.params.id)
 })

 router.get('/:id/edit', async (req, res) => {
   try {
    const author = await Author.findById(req.params.id)
    res.render('authors/edit', { author: author })
    // res.send('Edit Author ' + req.params.id)
   } catch {
    res.redirect('/')
   }
 
 })

 router.put('/:id', async (req, res) => {
   let author
   try {
    author = await Author.findById(req.params.id)
    author.name = req.body.name
    await author.save()
    res.redirect(`/authors/${author.id}`)
    } catch {
      if (author == null) {
        res.redirect('/')
      } else {
      res.render('authors/new', {
        author: author,
        errorMessage: 'Error updating Author'
      })
    }
  }
 })

 router.delete('/:id', async (req, res) => {
  let author
  try {
   author = await Author.findById(req.params.id)
   await author.remove()
   res.redirect(`/authors`)
   } catch {
     if (author == null) {
       res.redirect('/')
     } else {
       res.redirect(`/authors/${author.id}`)
     }
 }
 })




module.exports = router; // indexRouter 