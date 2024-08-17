const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const dotenv = require('dotenv');
const path = require('path')
dotenv.config();
app.use(cors());


app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json());
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});


app.get('/alltrips', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT tripdata.*, images.file_path
            FROM tripdata
            LEFT JOIN images ON tripdata.trip_id = images.trip_id
        `);

        connection.release();

        res.json(rows);
    } catch (error) {
        console.error('Error fetching data and images from database:', error);
        res.status(500).send('Error fetching data and images from database');
    }
});

app.get('/edittrips', async (req, res) => {
    const trip_id = req.query.trip_id;
    if (!trip_id) {
        return res.status(400).json({ error: 'trip_id is required' });
    }

    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(
            `SELECT tripdata.*, images.file_path
             FROM tripdata
             LEFT JOIN images ON tripdata.trip_id = images.trip_id
             WHERE tripdata.trip_id = ?`,
            [trip_id]
        );

        connection.release();

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching trip data:', error);
        res.status(500).json({ error: 'An error occurred while fetching trip data' });
    }
});

app.get('/tripitenary', async (req, res) => {
    const trip_id = req.query.trip_id;
    if (!trip_id) {
        return res.status(400).json({ error: 'trip_id is required' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT * 
             FROM tripitenary
             WHERE trip_id = ?`,
            [trip_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tripienary data not found' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching tripienary data:', error);
        res.status(500).json({ error: 'An error occurred while fetching tripienary data' });
    }
});

app.put('/updatetrip', async (req, res) => {
    const tripDetails = req.body;

    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { trip_id, file_path, ...updateFields } = tripDetails;

            const setClause = Object.keys(updateFields)
                .map(key => `${key} = ?`)
                .join(', ');

            if (setClause) {
                const sqlUpdate = `UPDATE tripdata SET ${setClause} WHERE trip_id = ?`;
                const valuesUpdate = [...Object.values(updateFields), trip_id];

                await connection.query(sqlUpdate, valuesUpdate);
            }

            if (file_path) {
                const [rows] = await connection.query('SELECT * FROM images WHERE trip_id = ?', [trip_id]);

                let sql;
                let values;

                if (rows.length > 0) {
                    sql = 'UPDATE images SET file_path = ? WHERE trip_id = ?';
                    values = [file_path, trip_id];
                } else {
                    sql = 'INSERT INTO images (trip_id, file_path) VALUES (?, ?)';
                    values = [trip_id, file_path];
                }

                await connection.query(sql, values);
            }

            await connection.commit();
            res.json({ message: 'Trip details updated and file path saved successfully!' });
        } catch (err) {
            await connection.rollback();
            console.error('Error updating trip details or inserting file path:', err);
            res.status(500).json({ error: 'Failed to update trip details or insert file path' });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error connecting to the database:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});




app.put('/updatetinerary', async (req, res) => {
    const tripItinerary = req.body;
    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const updatePromises = tripItinerary.map(async (item) => {
                const { TRIP_ID, DAY, DATE, ...rest } = item;

                const sql = 'UPDATE tripitenary SET ? WHERE TRIP_ID = ? AND DAY = ?';
                await connection.query(sql, [{ ...rest, DATE }, TRIP_ID, DAY]);
            });

            await Promise.all(updatePromises);

            await connection.commit();
            res.json({ message: 'Trip itinerary updated successfully!' });
        } catch (err) {
            await connection.rollback();
            console.error('Error updating trip itinerary:', err);
            res.status(500).json({ error: 'Failed to update trip itinerary' });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error connecting to the database:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});
app.post('/addtrips', async (req, res) => {
    const {
        trip_name, trip_code, slug, cost, seats, trip_start_date, end_date,
        trip_start_point, trip_end_point, destination, trip_duration,
        traveller_type,  inclusion,
        exclusion, points_to_note, trip_type, days
    } = req.body;

    let connection;
    try {
        connection = await pool.getConnection();

        await connection.beginTransaction();

        const insertTripSQL = `
            INSERT INTO tripdata (
                trip_name, trip_code, slug, cost, seats, trip_start_date, end_date, 
                trip_start_point, trip_end_point, destination, trip_duration, 
                traveller_type,  inclusion, 
                exclusion, points_to_note, trip_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const tripValues = [
            trip_name, trip_code, slug, cost, seats, trip_start_date, end_date,
            trip_start_point, trip_end_point, destination, trip_duration,
            traveller_type,  inclusion,
            exclusion, points_to_note, trip_type
        ];

        const [result] = await connection.query(insertTripSQL, tripValues);

        const trip_id = result.insertId;

        const insertItinerarySQL = `
            INSERT INTO tripitenary (
                TRIP_NAME, TRIP_CODE, TRIP_ID, DAY, DATE, DAY_TITLE, DAY_DESCRIPTION
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        for (const day of days) {
            const itineraryValues = [
                trip_name, trip_code, trip_id, day.DAY, day.DATE, day.DAY_TITLE, day.DAY_DESCRIPTION
            ];

            await connection.query(insertItinerarySQL, itineraryValues);
        }

        await connection.commit();

        res.json({ message: 'Trip and itinerary data inserted successfully!' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error inserting trip data:', error);
        res.status(500).json({ error: 'Failed to insert trip data' });
    } finally {
        if (connection) connection.release();
    }
});

app.delete('/deletetrips/:trip_id', async (req, res) => {
    const { trip_id } = req.params;

    if (!trip_id) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query('DELETE FROM tripitenary WHERE trip_id = ?', [trip_id]);

        await connection.query('DELETE FROM tripdata WHERE trip_id = ?', [trip_id]);

        await connection.commit();
        res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting trip:', error);
        res.status(500).json({ message: 'Error deleting trip' });
    } finally {
        connection.release();
    }
});

app.delete('/deletetrips/:trip_id', async (req, res) => {
    const { trip_id } = req.params;

    if (!trip_id) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query('DELETE FROM tripitenary WHERE trip_id = ?', [trip_id]);

        await connection.query('DELETE FROM tripdata WHERE trip_id = ?', [trip_id]);

        await connection.commit();
        res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting trip:', error);
        res.status(500).json({ message: 'Error deleting trip' });
    } finally {
        connection.release();
    }
});

app.get('/getbookingdetails', async (req, res) => {
    const trip_id= req.query.trip_id;
    if (!trip_id) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }




    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`
             SELECT * FROM members WHERE trip_id = ?
            `, [trip_id]);

        connection.release();
        res.json(rows);
    } catch (error) {
        console.error('Error connecting to the database:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
})
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on https://admin.yeahtrips.in:${process.env.PORT}`);
});
