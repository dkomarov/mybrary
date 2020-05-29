const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
// const path = require('path')
// const fs = require('fs')
// const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
// const upload = multer({
//   dest: uploadPath,
//   fileFilter: (req, file, callback) => {
//     callback(null, imageMimeTypes.includes(file.mimetype))
//   }
// })

// All Authors Route
router.get('/', async (req, res) => {
  let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.lte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
 
});

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
});

// Create Book Route
router.post('/', async (req, res) => {
  //const fileName = req.file != null ? req.file.filename : null
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    //coverImageName: fileName,
    description: req.body.description
  })
 // console.log('req.body is', req.body)
  saveCover(book, req.body.cover)

  try {
    const newBook = await book.save()
    res.redirect(`books/${newBook.id}`)
  } catch {
    // if (book.coverImageName != null) {
    //   removeBookCover(book.coverImageName)
    // }
    renderNewPage(res, book, true)
  }
 });

// now storing in MongoDB
//  function removeBookCover(fileName) {
//    fs.unlink(path.join(uploadPath, fileName), err => {
//      if (err) console.error(err)
//    })
//  }

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
                          .populate('author')
                          .exec()

    res.render('books/show', { book: book})
  } catch {
    res.redirect('/')
  }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
  } catch {
    res.redirect('/')
  }
});


// Create Book Route
router.put('/:id', async (req, res) => {
  let book
  let rb = req.body
  try {
    book = await Book.findById(req.params.id)
    book.title = rb.title
    book.author = rb.author
    book.publishDate = new Date(rb.publishDate)
    book.pageCount = rb.pageCount
    book.description = rb.description
    
    if (rb.cover != null && rb.cover !== '') {
      saveCover(book, rb.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch (e) {
    console.log(e)
    if (book != null) {
      renderEditPage(res, book, true)
    } else {
      redirect('/')
    }
  }
 });

 // Delete Book Page
 router.delete('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect('/books')
  } catch {
    if (book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not remove book'
      })
    } else {
      res.redirect('/')
    }
  }
 })

 async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
 }

 async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
 }

 async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})
    // console.log('authors are', authors)

    const params = { 
      authors: authors,
      book: book
    }
    
    //console.log('hasError is', hasError)
    if (hasError) {
      if (form === 'edit') {
        // locals = {errorMessage: 'Error Updating Book'}
        params.errorMessage = 'Error Updating Book'
      } else {
        // locals = {errorMessage: 'Error Creating Book'}
        //console.log('Error creating book. Attempting to show message...')
        params.errorMessage = 'Error Creating Book'
      }
    }
      res.render(`books/${form}`, params)
    } catch (e) {
      console.log(e)
      res.redirect('/books')
    }
  } 

 // save cover inside of db
 function saveCover(book, coverEncoded) {
   if (coverEncoded == null) return
   let cover
   try {
    cover = JSON.stringify(coverEncoded)
   } catch (e) {
     console.log(e)
   }

  // console.log('coverencoded is:', coverEncoded)
   if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
 }

module.exports = router; // indexRouter