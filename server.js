const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Backend V&G funcionando!");
});

app.get("/teste-frete", (req, res) => {
  res.json({
    status: "ok"
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("BACKEND NOVO FUNCIONANDO");
});
