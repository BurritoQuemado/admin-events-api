const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
    ssl: {
            rejectUnauthorized: false
        } 
    }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

//Get tours info from database
app.get('/getTours', (req, res) => {
    db.select('id', 'name').from('tours')
    .then(data => {
        res.status(200).json(data)
    })
});

app.get('/getTourTotalEvents/', (req, res) => {
        db.raw("select tours.id, tours.name, count(events.id) from events inner join tours on tours.id = events.tour_id group by tours.id;")
        .then(result => {
            res.status(200).json(result.rows);
        })
        .catch(err => res.json(err));
    
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
        .then(res.status(200).json('tour inserted successfully'))
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
        .then(res.status(200).json('updated tour name successfully'))
        .catch(err => res.status(400).json('Error updating tour name '+ err.message))
    }
});

//Insert events into database
app.post('/addEvent', (req, res) => {
    const { name, tour_id } = req.body;
    const timestamp = new Date();

    db.transaction(trx => {
        trx.insert({
            name: name,
            tour_id: tour_id,
            created_at: timestamp,
            updated_at: timestamp
        })
        .into('events')
        .then(trx.commit)
        .then(trx.rollback)
        .then(res.status(200).json('event inserted successfully'))
    })
    .catch(err => res.status(400).json('Error inserting event into database: ' + err.message))
});

//Get Tour info from database
app.get('/getTour/:tour_id', (req, res) => {
    const { tour_id } = req.params;
    db.select('id', 'name').from('tours')
    .where('id', tour_id)
    .then(data => {
        res.status(200).json(data)
    })
});

//Get Event name from database
app.get('/getEvent/:event_id', (req, res) => {
    const { event_id } = req.params;
    db.select('id', 'name', 'tour_id').from('events')
    .where('id', event_id)
    .then(data => {
        res.status(200).json(data)
    })
});

//Get Events info from database
app.get('/getEvents/:tour_id', (req, res) => {
    const { tour_id } = req.params;
    db.select('id', 'name').from('events')
    .where('tour_id', tour_id)
    .then(data => {
        res.status(200).json(data)
    })
});

//Update Eventos info
app.post('/updateEventInfo', (req, res) => {
    const { event_id, name} = req.body;
    const timestamp = new Date();
    
    if(!event_id.length){
        return res.status(404).json('No event to update found');
    } else {
        db('events')
        .update({
            name: name,
            updated_at: timestamp
        })
        .where('id',"=", event_id)
        .then(res.status(200).json('updated event info successfully'))
        .catch(err => res.status(400).json('Error updating event info '+ err.message))
    }
});

//Get Event Attendees info from database    
app.get('/getAttendees/:event_id', (req, res) => {
    const { event_id } = req.params;

    if(isNaN(event_id)) {
        return res.status(400).json('Error on event ID')
    } else {
        db.select('id', 'name', 'code', 'professional_code', 'attendance', 'updated_at', 'confirmation_status').from('attendees')
        .where('event_id', '=', event_id)
        .then(users => {
            if(users.length) {
                console.log('Sent attendees list');
                res.status(200).json(users);
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

    if(!users.length || !event_id){
        return res.status(404).json('No attendees to register found');
    } else {
        users.forEach(user => {
            db.transaction(trx => {
                trx.insert({
                    name: user.name,
                    code: user.code,
                    professional_code: user.professional_code,
                    confirmation_status: user.confirmation_status,
                    event_id: event_id,
                    created_at: timestamp,
                })
                .into('attendees')
                .then(trx.commit)
                .then(trx.rollback)
            })
            .catch(err => res.status(400).json('Error inserting attendees into database: ' + err.message))
        });
        return res.status(200).json('attendees inserted successfully');
    }
});

app.get('/getTourEvent', (req, res) => {
    const { event_id } = req.body; 
    db('events').join('tours', 'events.tour_id','tours.id')
    .select('events.name','tours.name')
    .where('events.id', event_id)
    .then(resp => {
        res.status(200).json(resp);
    });
});

//Insert event attendees into database
app.post('/registerAttendee', (req, res) => {
    const { user, event_id } = req.body;
    const timestamp = new Date().toLocaleString({ timeZone: 'America/Mexico_City'});

    if(!user || !event_id){
        return res.status(404).json('No attendees to register found');
    } else {
        db.transaction(trx => {
            trx.insert({
                name: user.name,
                code: 'invitadoExtra',
                professional_code: user.professional_code,
                attendance: true,
                confirmation_status: 'Extra',
                event_id: event_id,
                confirmation_status: 'Extra',
                created_at: timestamp,
                updated_at: timestamp,
            })
            .into('attendees')
            .then(trx.commit)
            .then(trx.rollback)
        })
        console.log('attendee inserted');
        return res.status(200).json('attendee inserted successfully');
    }
});

//Update attendance of evente attendee
app.post('/registerAttendance', (req, res) => {
    const { user_id } = req.body;
    const timestamp = new Date();
    console.log('registering attendance of user ' + user_id);
    
    if(!user_id.length){
        return res.status(404).json('No attendees to register found');
    } else {
        db('attendees')
        .update({
            attendance: true,
            updated_at: timestamp
        })
        .where('id',"=", user_id)
        .then(response => {
            console.log('attendee attendance updated');
            return res.status(200).json('updated attendance successfully');
        })
        .catch(err => res.status(400).json('Error updating attendance status'+ err.message))
    }
});

//Update attendee professional_code
app.put('/updateAttendeeProfessionalCode', (req, res) => {
    const { user_id, professional_code } = req.body;
    const timestamp = new Date().toLocaleString({ timeZone: 'America/Mexico_City'});
    
    if(!user_id.length){
        return res.status(404).json('No tour to update found');
    } else {
        db('attendees')
        .update({
            professional_code: professional_code,
            updated_at: timestamp
        })
        .where('id',"=", user_id)
        .then(res.status(200).json('updated professional code successfully'))
        .catch(err => res.status(400).json('Error updating professional code status'+ err.message))
    }
});

//Get attendee info
app.get('/getAttendee/:attendee_id', (req, res) => {
    const { attendee_id } = req.params;
    db.select('id', 'name','professional_code', 'attendance', 'event_id').from('attendees')
    .where('id', attendee_id)
    .then(data => {
        res.status(200).json(data)
    })
});

//Get Inventory
app.get('/getInventory', (req, res) => {
    db.select('*').from('inventory')
    .then(data => {
        console.log('Inventory sent')
        res.status(200).json(data)
    })
});

//Add Inventory
app.post('/addInventory', (req, res) => {
    const timestamp = new Date();
    const { inventory } = req.body;
    if (!inventory || inventory === null){
        console.err('No inventory to register')
        res.status(400).json('No hay articulos que registrar');
    } else {
        inventory.forEach(item => {
            db.transaction(trx => {
                trx.insert({
                    name: item.name,
                    code: item.code,
                    serial_code: item.serial_code,
                    location: item.location,
                    stored: item.stored,
                    description: item.description,
                    working: true,
                    created_at: timestamp
                })
                .into('inventory')
                .then(trx.rollback)
                .then(trx.commit)
                .then(res.json('Inventario agregado correctamente'))
                .then(console.log('Inventory added successfully'))
            })
            .catch(err => {
                console.error('Error while importing inventory' + err)
                res.status(400).json('Error al importar el inventario')
            })
        })
    }
});

//Add Item to inventory
app.post('/addItem', (req, res) => {
    const timestamp = new Date();
    const { item } = req.body;
    if(!item || item === undefined){
        console.err('No item to add')
        res.status(400).json('no hay articulo que registrar');
    } else {
        db.transaction(trx => {
            trx.insert({
                name: item.name,
                code: item.code,
                serial_code: item.serial_code,
                location: item.location,
                stored: item.stored,
                description: item.description,
                working: true,
                created_at: timestamp
            })
            .into('inventory')
            .then(trx.rollback)
            .then(trx.commit)
            .then(res.json('Inventario agregado correctamente'))
            .then(console.log('Inventory added successfully'))
        })
        .catch(err => {
            console.error('Error while adding item to inventory' + err)
            res.status(400).json('Error al agregar objeto el inventario')
        })
    }
});

//Update Item
app.put('/updateItem', (req, res) => {
    const { item } = req.body;
    const timestamp = new Date();
    db('inventory')
    .where('id', item.id)
    .update({
        name: item.name,
        location: item.location,
        stored: item.stored,
        working: true,
        updated_at: timestamp,
    })
    .then(res.json('Objeto actualizado correctamente'))
    .then(console.log('Item updated successfully'))
    .catch(err => {
        console.error('Error while updating item of inventory' + err)
        res.status(400).json('Error al actualizar objeto del inventario')
    })
});

//Delete Item
app.delete('/deleteItem', (req, res) => {
    const { id } = req.body;
    db('inventory')
    .where('id',id)
    .del()
    .then(res.json('Objeto eliminado correctamente'))
    .then(console.log('Item deleted successfully'))
    .catch(err => {
        console.error('Error while deleting item from inventory' + err)
        res.status(400).json('Error al eliminar objeto del inventario')
    })
});

//Check server status
app.get('/', (req, res) => {
    res.status(200).json('up and running')
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`server running on port ${process.env.PORT}`);
});