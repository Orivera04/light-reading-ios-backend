const express = require('express');
const cors = require('cors');
const { dbConnection } = require('./database/config');
require('dotenv').config();

const app = express();

dbConnection();

app.use(cors());

app.use(express.static('public'));

app.use(express.json());

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/meters', require('./routes/meterRoutes'));
app.use('/api/v1/readings', require('./routes/readingRoutes'));


app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
});