const { nanoid } = require('nanoid');
const books = require('./books');

const saveBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  let finished = false;
  if (pageCount === readPage) {
    finished = true;
  }

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  // error karena readPage lebih besar dari pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }
  // error karena tidak melampirkan nama atau nama undefined
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }
  books.push(newBook);
  const isSuccess = books.filter((Book) => Book.id === id).length > 0;
  // apabila success
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
  // general error
  const response = h.response({
    status: 'fail',
    message: 'Catatan gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const showAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  if (reading === '1') {
    const readBooks = books.filter((Book) => Book.reading === true);
    return {
      status: 'success',
      data: {
        books: readBooks.map((b) => ({
          id: b.id,
          name: b.name,
          publisher: b.publisher,
        })),
      },
    };
  }

  if (reading === '0') {
    const unreadBooks = books.filter((Book) => Book.reading === false);
    return {
      status: 'success',
      data: {
        books: unreadBooks.map((b) => ({
          id: b.id,
          name: b.name,
          publisher: b.publisher,
        })),
      },
    };
  }

  if (finished === '1') {
    const finishedBooks = books.filter((Book) => Book.finished === true);
    return {
      status: 'success',
      data: {
        books: finishedBooks.map((b) => ({
          id: b.id,
          name: b.name,
          publisher: b.publisher,
        })),
      },
    };
  }

  if (finished === '0') {
    const unfinishedBooks = books.filter((Book) => Book.finished === false);
    return {
      status: 'success',
      data: {
        books: unfinishedBooks.map((b) => ({
          id: b.id,
          name: b.name,
          publisher: b.publisher,
        })),
      },
    };
  }

  if (name !== undefined) {
    const bookName = books.filter((Book) => Book.name.toLowerCase().includes(name.toLowerCase()));
    const response = h.response({
      status: 'success',
      data: {
        books: bookName.map((b) => ({
          id: b.id,
          name: b.name,
          publisher: b.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  const response = {
    status: 'success',
    data: {
      books: books.map((b) => ({
        id: b.id,
        name: b.name,
        publisher: b.publisher,
      })),
    },
  };
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((Book) => Book.id === bookId)[0];
  if (book) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const updateByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name, year, author, summary, publisher, reading, readPage, pageCount,
  } = request.payload;
  const updatedAt = new Date().toISOString();
  // jika user tidak mengisi nama buku
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }
  // jika user memasukkan readPage yang lebih besar dari pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }
  const index = books.findIndex((Book) => Book.id === bookId);
  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      reading,
      readPage,
      pageCount,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((Book) => Book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  saveBookHandler, showAllBooksHandler, getBookByIdHandler, updateByIdHandler, deleteByIdHandler,
};
