const express = require('express');
const request = require('request');
var app = express();

// Porta que a API rodará. Mude caso queira outra.
var port = 81;

//CORS
const cors = require('cors');
app.use(cors());
app.options('*', cors());

//Regra do CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//Rota de Rastreamento
app.get("/:object", function (req, res, next) {
  let object = req.params.object ? req.params.object.substr(0, 13) : "";
  let options = {
    method: "POST",
    url: "http://webservice.correios.com.br/service/rest/rastro/rastroMobile",
    headers: {
      "Content-Type": "text/xml"
    },
    body:
      "<rastroObjeto>" +
      "<usuario>ECT</usuario><senha>SRO</senha><tipo>L</tipo><resultado>T</resultado>" +
      "<objetos>" + object + "</objetos>" +
      "<lingua>101</lingua><token></token>" +
      "</rastroObjeto>"
  };
  request(options, function (error, response, body) {
    if (error) {
      console.log(error);
    }
    res.send(response.body);
  });
});

// Rotas de sincronização dos objetos para salvar e carregar do servidor.
app.get("/rastrio/syncFromServer", function (req, res) {
  fs.readFile('/home/pi/api_cache/rastrio.json', 'utf-8', (err, data) => {
    if (err) {
      console.log(err);
    }
    if (!data) {
      res.send('');
    } else {
      res.send(JSON.parse(data.toString()));
    }
  });
});

app.post("/rastrio/syncToServer", function (req, res) {
  fs.writeFile('/home/pi/api_cache/rastrio.json', JSON.stringify(req.body), (err) => {
    if (err) {
      res.send('500');
    }
    res.send('200');
  });
});

//Rota Padrão
app.get("/", function (req, res, next) {
  return res.send({ error: false, message: 'Rastr.io - API online.' })
});

//Detecção de CTRL+C.
process.on('SIGINT', function () {
  console.log("\nEncerrando servico... (Ctrl-C)");
  process.exit(1);
});

//Inicialização
app.listen(port, function () {
  console.log('Rastr.io iniciado. Porta: ' + port);
});
