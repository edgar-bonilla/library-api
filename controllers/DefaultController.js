'use strict';

const { Low } = require('lowdb');
const { JSONFile } = require('lowdb');
const path = require('path');
const fs = require('fs');

// Función helper para inicializar DB si no existe
function initDb(filePath, key) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ [key]: [] }, null, 2));
  }
  const adapter = new JSONFile(filePath);
  const db = new Low(adapter);
  return db;
}

// Inicializar DBs
const authorsDb = initDb(path.join(__dirname, '../data/authors.json'), 'authors');
const booksDb = initDb(path.join(__dirname, '../data/books.json'), 'books');
const publishersDb = initDb(path.join(__dirname, '../data/publishers.json'), 'publishers');

// Función para cargar DB (con debug)
async function loadDb(db, key) {
  try {
    await db.read();
    db.data ||= {};
    db.data[key] ||= [];
    return db;
  } catch (err) {
    console.error(`Error loading DB for ${key}:`, err);
    throw new Error(`Error en base de datos para ${key}: ${err.message}`);
  }
}

// Books
async function getBooks() {
  await loadDb(booksDb, 'books');
  return booksDb.data.books || [];
}

async function booksBookIdGET(bookId) {
  await loadDb(booksDb, 'books');
  const book = booksDb.data.books.find(b => b.bookId === bookId);
  if (!book) throw new Error('Libro no encontrado');
  return book;
}

async function booksGET() {
  return getBooks();
}

async function booksPOST(book) {
  await loadDb(authorsDb, 'authors');
  await loadDb(publishersDb, 'publishers');

  const authorExists = authorsDb.data.authors.some(a => a.authorId === book.authorId);
  const publisherExists = publishersDb.data.publishers.some(p => p.publisherId === book.publisherId);

  if (!authorExists || !publisherExists) {
    throw new Error('Author o Publisher no existe');
  }

  await loadDb(booksDb, 'books');
  booksDb.data.books.push(book);
  await booksDb.write();
  return book;
}

async function booksBookIdPUT(bookId, book) {
  await loadDb(booksDb, 'books');
  const index = booksDb.data.books.findIndex(b => b.bookId === bookId);
  if (index === -1) throw new Error('Libro no encontrado');

  booksDb.data.books[index] = { ...booksDb.data.books[index], ...book };
  await booksDb.write();
  return booksDb.data.books[index];
}

async function booksBookIdDELETE(bookId) {
  await loadDb(booksDb, 'books');
  const index = booksDb.data.books.findIndex(b => b.bookId === bookId);
  if (index === -1) throw new Error('Libro no encontrado');

  booksDb.data.books.splice(index, 1);
  await booksDb.write();
  return { message: 'Libro eliminado' };
}

// Authors
async function getAuthors() {
  await loadDb(authorsDb, 'authors');
  return authorsDb.data.authors || [];
}

async function authorsAuthorIdGET(authorId) {
  await loadDb(authorsDb, 'authors');
  const author = authorsDb.data.authors.find(a => a.authorId === authorId);
  if (!author) throw new Error('Autor no encontrado');
  return author;
}

async function authorsGET() {
  return getAuthors();
}

async function authorsPOST(author) {
  await loadDb(authorsDb, 'authors');
  authorsDb.data.authors.push(author);
  await authorsDb.write();
  return author;
}

async function authorsAuthorIdPUT(authorId, author) {
  await loadDb(authorsDb, 'authors');
  const index = authorsDb.data.authors.findIndex(a => a.authorId === authorId);
  if (index === -1) throw new Error('Autor no encontrado');

  authorsDb.data.authors[index] = { ...authorsDb.data.authors[index], ...author };
  await authorsDb.write();
  return authorsDb.data.authors[index];
}

async function authorsAuthorIdDELETE(authorId) {
  await loadDb(authorsDb, 'authors');
  const index = authorsDb.data.authors.findIndex(a => a.authorId === authorId);
  if (index === -1) throw new Error('Autor no encontrado');

  await loadDb(booksDb, 'books');
  if (booksDb.data.books.some(b => b.authorId === authorId)) {
    throw new Error('Autor referenciado por libros');
  }

  authorsDb.data.authors.splice(index, 1);
  await authorsDb.write();
  return { message: 'Autor eliminado' };
}

// Publishers
async function getPublishers() {
  await loadDb(publishersDb, 'publishers');
  return publishersDb.data.publishers || [];
}

async function publishersPublisherIdGET(publisherId) {
  await loadDb(publishersDb, 'publishers');
  const publisher = publishersDb.data.publishers.find(p => p.publisherId === publisherId);
  if (!publisher) throw new Error('Editorial no encontrada');
  return publisher;
}

async function publishersGET() {
  return getPublishers();
}

async function publishersPOST(publisher) {
  await loadDb(publishersDb, 'publishers');
  publishersDb.data.publishers.push(publisher);
  await publishersDb.write();
  return publisher;
}

async function publishersPublisherIdPUT(publisherId, publisher) {
  await loadDb(publishersDb, 'publishers');
  const index = publishersDb.data.publishers.findIndex(p => p.publisherId === publisherId);
  if (index === -1) throw new Error('Editorial no encontrada');

  publishersDb.data.publishers[index] = { ...publishersDb.data.publishers[index], ...publisher };
  await publishersDb.write();
  return publishersDb.data.publishers[index];
}

async function publishersPublisherIdDELETE(publisherId) {
  await loadDb(publishersDb, 'publishers');
  const index = publishersDb.data.publishers.findIndex(p => p.publisherId === publisherId);
  if (index === -1) throw new Error('Editorial no encontrada');

  await loadDb(booksDb, 'books');
  if (booksDb.data.books.some(b => b.publisherId === publisherId)) {
    throw new Error('Editorial referenciada por libros');
  }

  publishersDb.data.publishers.splice(index, 1);
  await publishersDb.write();
  return { message: 'Editorial eliminada' };
}

module.exports = {
  // Books
  booksGET, getBooks, booksBookIdGET, booksPOST, booksBookIdPUT, booksBookIdDELETE,
  // Authors
  authorsGET, getAuthors, authorsAuthorIdGET, authorsPOST, authorsAuthorIdPUT, authorsAuthorIdDELETE,
  // Publishers
  publishersGET, getPublishers, publishersPublisherIdGET, publishersPOST, publishersPublisherIdPUT, publishersPublisherIdDELETE
};