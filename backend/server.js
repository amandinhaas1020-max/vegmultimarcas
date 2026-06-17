const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();

app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

app.get("/", (req, res) => {
  res.send("Backend Mercado Pago V&G funcionando!");
});

app.post("/criar-pagamento", async (req, res) => {
  try {
    const { titulo, preco, quantidade } = req.body;

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: titulo || "Produto V&G Multimarcas",
            quantity: Number(quantidade) || 1,
            unit_price: Number(preco)
          }
        ],
        back_urls: {
          success: "https://vegmultimarcas.com.br",
          failure: "https://vegmultimarcas.com.br",
          pending: "https://vegmultimarcas.com.br"
        },
        auto_return: "approved"
      }
    });

    res.json({
      init_point: result.init_point
    });

  } catch (error) {
    console.error("Erro Mercado Pago:", error);
    res.status(500).json({
      error: "Erro ao criar pagamento"
    });
  }
});

app.post("/calcular-frete", async (req, res) => {
  try {
    const { cep } = req.body;

    const resposta = await axios.post(
      "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        from: {
          postal_code: "86000000"
        },
        to: {
          postal_code: cep
        },
        products: [
          {
            id: "1",
            width: 20,
            height: 5,
            length: 25,
            weight: 0.3,
            insurance_value: 100,
            quantity: 1
          }
        ],
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
          "User-Agent": "V&G Multimarcas"
        }
      }
    );

    const fretes = resposta.data.filter(
      f => f.name?.includes("PAC") || f.name?.includes("SEDEX")
    );

    res.json(fretes);

  } catch (erro) {
    console.error("Erro frete:", erro.response?.data || erro.message);

    res.status(500).json({
      erro: "Erro ao calcular frete",
      detalhe: erro.response?.data || erro.message
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
