const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL || '127.0.0.1',
        ssl: {
            rejectUnauthorized: false
        }
    }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json('up and running')
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`listening on port ${process.env.PORT} || 3000`);
});