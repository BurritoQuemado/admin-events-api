const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL || 'postgresql://@localhost:5432/events',
        ssl: process.env.DATABASE_URL ? true : false
    }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

//Get tours info from database
app.get('/getTours', (req, res) => {
    db.select('id', 'name').from('tours')
    .then(data => {
        res.json(data)
    })
});

//Insert tours into database
app.post('/addTour', (req, res) => {
    const { name } = req.body;
    const timestamp = new Date();

    db.transaction(trx => {
        trx.insert({
            name: name,
            created_at: timestamp,
            updated_at: timestamp
        })
        .into('tours')
        .then(trx.commit)
        .then(trx.rollback)
        .then(res.json('tour inserted successfully'))
    })
    .catch(err => res.status(400).json('Error inserting tour into database: ' + err.message))
});

//Update tour information
app.post('/updateTourInfo', (req, res) => {
    const { tour_id, name } = req.body;
    const timestamp = new Date();
    
    if(!tour_id.length){
        return res.status(404).json('No tour to update found');
    } else {
        db('tours')
        .update({
            name: name,
            updated_at: timestamp
        })
        .where('id',"=", tour_id)
        .then(res.json('updated tour name successfully'))
        .catch(err => res.status(400).json('Error updating tour name '+ err.message))
    }
});

//Insert events into database
app.post('/addEvent', (req, res) => {
    const { city, date, tour_id } = req.body;
    const timestamp = new Date();

    db.transaction(trx => {
        trx.insert({
            city: city,
            date: date,
            tour_id: tour_id,
            created_at: timestamp,
            updated_at: timestamp
        })
        .into('events')
        .then(trx.commit)
        .then(trx.rollback)
        .then(res.json('event inserted successfully'))
    })
    .catch(err => res.status(400).json('Error inserting event into database: ' + err.message))
});

//Get Events info from database
app.get('/getevents', (req, res) => {
    db.select('id', 'city', 'date').from('events')
    .then(data => {
        res.json(data)
    })
});

//Update Eventos info
app.post('/updateEventInfo', (req, res) => {
    const { event_id, city, date } = req.body;
    const timestamp = new Date();
    
    if(!event_id.length){
        return res.status(404).json('No event to update found');
    } else {
        db('events')
        .update({
            city: city,
            date: date,
            updated_at: timestamp
        })
        .where('id',"=", event_id)
        .then(res.json('updated tour name successfully'))
        .catch(err => res.status(400).json('Error updating tour name '+ err.message))
    }
});

//Get Event Attendees info from database    
app.get('/getAttendees', (req, res) => {
    const { event_id } = req.body;

    if(isNaN(event_id)) {
        return res.status(400).json('Error on event ID')
    } else {
        db.select('id', 'name', 'lastname', 'code', 'professional_code', 'attendance').from('attendees')
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
    const timestamp = new Date();

    if(!users.length){
        return res.status(404).json('No attendees to register found');
    } else {
        users.forEach(user => {
            db.transaction(trx => {
                trx.insert({
                    name: user.name,
                    lastname: user.lastname,
                    code: user.code,
                    professional_code: user.professional_code,
                    event_id: event_id,
                    created_at: timestamp,
                    updated_at: timestamp,
                })
                .into('attendees')
                .then(trx.commit)
                .then(trx.rollback)
            })
            .catch(err => res.status(400).json('Error inserting attendees into database: ' + err.message))
        });
        return res.json('attendees inserted successfully');
    }
});

//Update attendance of evente attendee
app.post('/registerAttendance', (req, res) => {
    const { user_id } = req.body;
    const timestamp = new Date();
    
    if(!user_id.length){
        return res.status(404).json('No attendees to register found');
    } else {
        db('attendees')
        .update({
            attendance: true,
            updated_at: timestamp
        })
        .where('id',"=", user_id)
        .then(res.json('updated attendance successfully'))
        .catch(err => res.status(400).json('Error updating attendance status'+ err.message))
    }
});

//Update attendee professional_code
app.post('/updateAttendeeProfessionalCode', (req, res) => {
    const { user_id, professional_code } = req.body;
    const timestamp = new Date();
    
    if(!user_id.length){
        return res.status(404).json('No tour to update found');
    } else {
        db('attendees')
        .update({
            professional_code: professional_code,
            updated_at: timestamp
        })
        .where('id',"=", user_id)
        .then(res.json('updated professional code successfully'))
        .catch(err => res.status(400).json('Error updating professional code status'+ err.message))
    }
});

//Check server status
app.get('/', (req, res) => {
    res.json('up and running')
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`listening on port ${process.env.PORT} || 3000`);
});