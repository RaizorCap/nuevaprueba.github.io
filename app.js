const express = require('express');
const sql = require('mssql');

const app = express();
const port = 3000;

const config = {
  user: 'roly',
  password: '989893469/Rz',
  server: 'dato.database.windows.net',
  database: 'dni',
  options: {
    encrypt: true,
    trustServerCertificate: false,
    hostNameInCertificate: '*.database.windows.net',
    loginTimeout: 30
  }
};

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/views/register.html');
});

app.post('/register', (req, res) => {
  const { dni, apellidos, nombres } = req.body;
  sql.connect(config).then(pool => {
    return pool.request()
      .input('dni', sql.VarChar(50), dni)
      .input('apellidos', sql.VarChar(50), apellidos)
      .input('nombres', sql.VarChar(50), nombres)
      .query('INSERT INTO Registros (DNI, Apellidos, Nombres) VALUES (@dni, @apellidos, @nombres)');
  }).then(result => {
    console.log(`Se registró el DNI ${dni}`);
    res.render('success');
  }).catch(err => {
    console.error(err);
    res.send('Error al realizar el registro');
  });
});

app.post('/search', (req, res) => {
  const index = req.body.number;
  sql.connect(config).then(pool => {
    return pool.request()
      .input('number', sql.VarChar(50), index)
      .query('SELECT * FROM Registros WHERE DNI = @number');
  }).then(result => {
    const row = result.recordset[0];
    if (row) {
      const apellidos = row.Apellidos;
      const nombres = row.Nombres;
      // hacer algo con los datos obtenidos, como imprimirlos en la pantalla
      res.render('result', { apellidos, nombres });
      res.sendFile(__dirname + '/views/result.ejs');
    } else {
      // si no se encontró ningún registro para el índice dado
      res.render('no-result', { index });
      res.sendFile(__dirname + '/views/no-result.ejs');
    }
  }).catch(err => {
    console.error(err);
    res.send('Error al realizar la consulta');
  });
});

app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});
