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

//Get Events info from database
app.get('/getevents', (req, res) => {
    db.select('id', 'name', 'date', 'place').from('events')
    .then(data => {
        res.json(data)
    })
});

//Get Event Attendees info from database
app.get('/getAttendees/:id', (req, res) => {
    const { event_id } = req.params;

    if(isNaN(id)) {
        return res.status(400).json('Error on event ID')
    } else {
        db.select('id', 'name', 'lastname', 'code', 'profesional_code').from('attendees')
        .where('event_id', '=', event_id)
        .then(users => {
            if(users.length) {
                res.json(users);
            } else {
                res.status(404).json('No attendees found');
            }
        })
    } 
});

//Insert event attendees into database
app.post('/registerAttendees', (req, res) => {
    const { users, event_id } = req.body;
    const timestamp = Date.now();

    if(!users.length){
        return res.status(404).json('No attendees to register found');
    } else {
        users.forEach(user => {
            db.transaction(trx => {
                trx.insert({
                    name: user.name,
                    lastname: user.lastname,
                    code: user.code,
                    profesional_code: user.profesional_code,
                    event_id: event_id,
                    created_at: timestamp,
                    updated_at: timestamp,
                })
                .into('event_attendees')
                .then(trx.commit)
                .then(trx.rollback)
            })
            .catch(err => res.status(400).json('Error inserting attendees into database: ' + err.message))
        });
    }
});

app.post('./registerAttendance', (req, res) => {
    const { user_id } = req.body;
    
    if(!user_id.length){
        return res.status(404).json('No attendees to register found');
    } else {
        db.transaction()
    }
});

app.get('/', (req, res) => {
    res.json('up and running')
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`listening on port ${process.env.PORT} || 3000`);
});