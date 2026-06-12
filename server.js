const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'products.json');

app.use(cors());
app.use(express.json({ limit: '25mb' }));

function readProducts() {
  try {
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '[]');
  } catch (err) {
    return [];
  }
}

function saveProducts(products) {
  fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2));
}

app.get('/', (req, res) => {
  res.send('Backend V&G Multimarcas funcionando!');
});

app.get('/api/products', (req, res) => {
  res.json(readProducts());
});

app.post('/api/products', (req, res) => {
  const products = readProducts();
  const product = req.body || {};
  if (!product.name || !product.price) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }
  product.id = product.id || Date.now();
  product.stock = Number(product.stock || 0);
  product.price = Number(product.price || 0);
  products.unshift(product);
  saveProducts(products);
  res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
  const products = readProducts();
  const id = String(req.params.id);
  const index = products.findIndex(p => String(p.id) === id);
  if (index === -1) return res.status(404).json({ error: 'Produto não encontrado.' });
  products[index] = { ...products[index], ...(req.body || {}), id: products[index].id };
  saveProducts(products);
  res.json(products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const id = String(req.params.id);
  const products = readProducts();
  const newProducts = products.filter(p => String(p.id) !== id);
  saveProducts(newProducts);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
