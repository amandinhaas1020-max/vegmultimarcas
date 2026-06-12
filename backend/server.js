const express = require("express");
const cors = require("cors");
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

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error("Erro Mercado Pago:", error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
