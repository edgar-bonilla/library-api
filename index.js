'use strict';

const express = require('express');
const cors = require('cors');            // <-- Agregado
const YAML = require('js-yaml');
const fs = require('fs');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const controller = require('./controllers/DefaultController');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());                        // <-- Agregado para permitir CORS
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Cargar OpenAPI YAML para Swagger
const openApiSpec = fs.readFileSync('./api/openapi.yaml', 'utf8');
const swaggerOptions = {
  definition: YAML.load(openApiSpec),
  apis: [] // Solo el YAML
};
const specs = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rutas para Books
app.get('/books', async (req, res) => {
  try {
    const books = await controller.getBooks();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/books/:bookId', async (req, res) => {
  try {
    const book = await controller.booksBookIdGET(req.params.bookId);
    res.json(book);
  } catch (err) {
    if (err.message === 'Libro no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/books', async (req, res) => {
  try {
    const book = await controller.booksPOST(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/books/:bookId', async (req, res) => {
  try {
    const updated = await controller.booksBookIdPUT(req.params.bookId, req.body);
    res.json(updated);
  } catch (err) {
    if (err.message === 'Libro no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
});

app.delete('/books/:bookId', async (req, res) => {
  try {
    const result = await controller.booksBookIdDELETE(req.params.bookId);
    res.json(result);
  } catch (err) {
    if (err.message === 'Libro no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// Rutas para Authors
app.get('/authors', async (req, res) => {
  try {
    const authors = await controller.getAuthors();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/authors/:authorId', async (req, res) => {
  try {
    const author = await controller.authorsAuthorIdGET(req.params.authorId);
    res.json(author);
  } catch (err) {
    if (err.message === 'Autor no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/authors', async (req, res) => {
  try {
    const author = await controller.authorsPOST(req.body);
    res.status(201).json(author);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/authors/:authorId', async (req, res) => {
  try {
    const updated = await controller.authorsAuthorIdPUT(req.params.authorId, req.body);
    res.json(updated);
  } catch (err) {
    if (err.message === 'Autor no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
});

app.delete('/authors/:authorId', async (req, res) => {
  try {
    const result = await controller.authorsAuthorIdDELETE(req.params.authorId);
    res.json(result);
  } catch (err) {
    if (err.message === 'Autor referenciado por libros') {
      return res.status(409).json({ error: err.message });
    }
    if (err.message === 'Autor no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// Rutas para Publishers
app.get('/publishers', async (req, res) => {
  try {
    const publishers = await controller.getPublishers();
    res.json(publishers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/publishers/:publisherId', async (req, res) => {
  try {
    const publisher = await controller.publishersPublisherIdGET(req.params.publisherId);
    res.json(publisher);
  } catch (err) {
    if (err.message === 'Editorial no encontrada') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/publishers', async (req, res) => {
  try {
    const publisher = await controller.publishersPOST(req.body);
    res.status(201).json(publisher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/publishers/:publisherId', async (req, res) => {
  try {
    const updated = await controller.publishersPublisherIdPUT(req.params.publisherId, req.body);
    res.json(updated);
  } catch (err) {
    if (err.message === 'Editorial no encontrada') {
      return res.status(404).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
});

app.delete('/publishers/:publisherId', async (req, res) => {
  try {
    const result = await controller.publishersPublisherIdDELETE(req.params.publisherId);
    res.json(result);
  } catch (err) {
    if (err.message === 'Editorial referenciada por libros') {
      return res.status(409).json({ error: err.message });
    }
    if (err.message === 'Editorial no encontrada') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.redirect('/docs');
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación en http://localhost:${PORT}/docs`);
});
