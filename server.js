const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

let products = [];

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

app.get("/", (req, res) => {
  res.send("Backend V&G funcionando!");
});

app.get("/teste-frete", (req, res) => {
  res.json({
    status: "ok",
    tokenMercadoPago: process.env.MP_ACCESS_TOKEN ? "existe" : "nao existe",
    tokenMelhorEnvio: process.env.ME_ACCESS_TOKEN ? "existe" : "nao existe"
  });
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const produto = {
    id: Date.now(),
    ...req.body
  };

  products.push(produto);
  res.json(produto);
});

app.delete("/api/products/:id", (req, res) => {
  const id = String(req.params.id);
  products = products.filter(p => String(p.id) !== id);
  res.json({ ok: true });
});

app.post("/calcular-frete", async (req, res) => {
  try {
    const cep = String(req.body.cep || "").replace(/\D/g, "");

    if (cep.length !== 8) {
      return res.status(400).json({ erro: "CEP inválido" });
    }

    const resposta = await axios.post(
      "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        from: { postal_code: "86000000" },
        to: { postal_code: cep },
        products: [{
          id: "1",
          width: 20,
          height: 5,
          length: 25,
          weight: 0.3,
          insurance_value: 100,
          quantity: 1
        }],
        options: {
          receipt: false,
          own_hand: false
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ME_ACCESS_TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "VG Multimarcas"
        }
      }
    );

    res.json(resposta.data);

  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao calcular frete",
      detalhe: erro.response?.data || erro.message
    });
  }
});

app.post("/criar-pagamento", async (req, res) => {
  try {
    const { titulo, preco, quantidade } = req.body;

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [{
          title: titulo || "Produto V&G Multimarcas",
          quantity: Number(quantidade) || 1,
          unit_price: Number(preco) || 1
        }],
        back_urls: {
          success: "https://vegmultimarcas.com.br",
          failure: "https://vegmultimarcas.com.br",
          pending: "https://vegmultimarcas.com.br"
        },
        auto_return: "approved"
      }
    });

    res.json({ init_point: result.init_point });

  } catch (error) {
    res.status(500).json({
      erro: "Erro ao criar pagamento",
      detalhe: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
