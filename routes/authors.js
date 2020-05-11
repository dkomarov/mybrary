const express = require('express')
const router = express.Router()
const Author = require('../models/author')

// All Authors Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i') // case in-sensitive
  }
  try { 
    const authors = await Author.find(searchOptions) // find all authors ({})
    res.render('authors/index', { authors: authors, 
                                  searchOptions: req.query } )
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
  //res.redirect('author')
  //res.send(req.body.name)
  //res.redirect('authors')
  
  const author = new Author({
    name: req.body.name
  })

  try {
    const newAuthor = await author.save()
    res.redirect('authors')
    //res.redirect(`authors/${newAuthor.id}`)
  } catch {
      let locals = {errorMessage: 'Error creating Author'}
      res.render('authors/new', {
        author: author,
        locals
        //locals
      })
  }
 });
//   author.save((err, newAuthor) => {
//     if (err) {
//       console.log("Error is:", err.message)

//     } else {
//       
//     }
//   })


module.exports = router; // indexRouter 