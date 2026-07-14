const express = require("express");
const { google } = require("googleapis");
const fs = require("fs");

const app = express();

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const token = JSON.parse(process.env.GOOGLE_TOKEN);

const oauth2Client = new google.auth.OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  "http://localhost:3000/oauth2callback"
);

oauth2Client.setCredentials(token);

const gmail = google.gmail({
  version: "v1",
  auth: oauth2Client
});

app.get("/", (req, res) => {

res.send(`

<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<title>ChatGPT OTP</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial;
}

body{

background:#000;
height:100vh;

display:flex;
justify-content:center;
align-items:center;

}

.card{

width:450px;

background:#111;

padding:30px;

border-radius:20px;

text-align:center;

box-shadow:0 0 25px rgba(0,255,255,.2);

}

.logo{

width:120px;
margin-bottom:20px;

}

h1{

color:white;
margin-bottom:20px;

}

.gmail{

background:#dfe3eb;

color:#222;

padding:15px;

border-radius:12px;

margin-bottom:20px;

font-size:18px;

font-weight:bold;

}

button{

width:100%;
height:65px;

border:none;
border-radius:15px;

background:#11e8e8;

font-size:26px;
font-weight:bold;

cursor:pointer;

}

button:hover{

opacity:.9;

}

.codigo{

margin-top:25px;

padding:25px;

border-radius:15px;

background:#1a1a1a;

color:#11e8e8;

font-size:42px;
font-weight:bold;

}

.copy{

margin-top:15px;

background:#4CAF50;

height:50px;

font-size:18px;

color:white;

}

.estado{

margin-top:15px;

color:#aaa;

font-size:14px;

}

</style>

</head>

<body>

<div class="card">

<img
class="logo"
src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg">

<h1>ChatGPT OTP</h1>

<div class="gmail">
📧 jonastorreskarina@gmail.com
</div>

<button onclick="obtenerCodigo()">
Consultar Código
</button>

<div id="codigo" class="codigo">
------
</div>

<button
class="copy"
onclick="copiarCodigo()">
Copiar Código
</button>

<div class="estado" id="estado">
Esperando consulta...
</div>

</div>

<script>

async function obtenerCodigo(){

document.getElementById("estado").innerHTML =
"Buscando código...";

const r = await fetch("/codigo");

const data = await r.json();

document.getElementById("codigo").innerHTML =
data.codigo || "No encontrado";

document.getElementById("estado").innerHTML =
"Última actualización: " +
new Date().toLocaleTimeString();

}

function copiarCodigo(){

const codigo =
document.getElementById("codigo").innerText;

if(
codigo === "------" ||
codigo === "No encontrado"
){
    return alert("No hay código para copiar");
}

navigator.clipboard.writeText(codigo);

alert("Código copiado");

}

</script>

</body>

</html>

`);

});

app.get("/codigo", async (req, res) => {

  try {

    const mensajes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20
    });

    const ids = mensajes.data.messages || [];

    for (const msg of ids) {

      const correo =
        await gmail.users.messages.get({
          userId: "me",
          id: msg.id
        });

      const snippet = correo.data.snippet || "";

      const match =
        snippet.match(/\b\d{6}\b/);

      if (match) {

        return res.json({
          codigo: match[0]
        });

      }

    }

    res.json({
      codigo: null
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor iniciado en puerto " + PORT);
});