const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
dotenv.config();
app.use(cors());
const multer = require('multer');


app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, './uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .concat('_trips');
};
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json());
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

// const authenticateRole = (requiredRole) => {
//     return async (req, res, next) => {
//         const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Bearer header

//         if (!token) {
//             return res.status(401).json({ message: 'No token provided' });
//         }

//         try {
//             const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
//             const userId = decoded.userId;

//             const connection = await pool.getConnection();
//             const [user] = await connection.execute('SELECT role FROM tripusers WHERE id = ?', [userId]);

//             if (user.length === 0) {
//                 await connection.release();
//                 return res.status(401).json({ message: 'User not found' });
//             }

//             const userRole = user[0].role;

//             if (userRole !== requiredRole) {
//                 await connection.release();
//                 return res.status(403).json({ message: 'Access denied' });
//             }

//             req.userId = userId; 
//             connection.release();
//             next();
//         } catch (error) {
//             console.error('Error verifying token or checking role:', error);
//             res.status(401).json({ message: 'Invalid token' });
//         }
//     };
// };

app.post('/adduser', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const connection = await pool.getConnection();

        const [tables] = await connection.execute("SHOW TABLES LIKE 'tripusers'");
        if (tables.length === 0) {
            const query = await fs.readFileSync('db/tripusers.sql', 'utf8');
            await connection.query(query);
        }

        const [existingUser] = await connection.execute(
            'SELECT id FROM tripusers WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            await connection.release();
            return res.status(400).json({ message: 'User already exists' });
        }

        const [result] = await connection.execute(
            'INSERT INTO tripusers (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, role]
        );

        await connection.release();

        res.status(201).json({ message: 'User added successfully', userId: result.insertId });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Error adding user' });
    }
});

app.post('/userlogin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const connection = await pool.getConnection();

        const [user] = await connection.execute(
            'SELECT id, password, role FROM tripusers WHERE email = ?',
            [email]
        );

        if (user.length === 0) {
            await connection.release();
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const storedHashedPassword = user[0].password;
        const userId = user[0].id;
        const userRole = user[0].role;

        const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

        if (!passwordMatch) {
            await connection.release();
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const accessToken = jwt.sign(
            { userId: userId },
            process.env.PRIVATE_KEY,
            { expiresIn: '1d' }
        );

        await connection.release();
        res.status(200).json({
            message: 'Login successful',
            token: accessToken,
            role: userRole
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

app.get('/alltrips', async (req, res) => {
    try {
        const { status = 'published' } = req.query;

        if (!['published', 'trash'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status parameter' });
        }

        const connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT tripdata.*, images.file_path
            FROM tripdata
            LEFT JOIN images ON tripdata.trip_id = images.trip_id
            WHERE tripdata.status = ?
        `, [status]);

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



app.post('/addtrips', upload.single('image'), async (req, res) => {
    const {
        trip_name, trip_code, cost, seats, trip_start_date, end_date,
        trip_start_point, trip_end_point, destination, trip_duration,
        traveller_type, inclusion, exclusion, points_to_note, trip_type, days
    } = req.body;

    const slug = generateSlug(trip_name);
    const file_path = req.file ? `/uploads/${req.file.filename}` : null;

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Insert trip data
        const insertTripSQL = `
            INSERT INTO tripdata (
                trip_name, trip_code, slug, cost, seats, trip_start_date, end_date,
                trip_start_point, trip_end_point, destination, trip_duration,
                traveller_type, inclusion, exclusion, points_to_note, trip_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const tripValues = [
            trip_name, trip_code, slug, cost, seats, trip_start_date, end_date,
            trip_start_point, trip_end_point, destination, trip_duration,
            traveller_type, inclusion, exclusion, points_to_note, trip_type
        ];
        const [result] = await connection.query(insertTripSQL, tripValues);
        const trip_id = result.insertId;

        // Insert itinerary data
        const insertItinerarySQL = `
            INSERT INTO tripitenary (
                TRIP_NAME, TRIP_CODE, TRIP_ID, DAY, DATE, DAY_TITLE, DAY_DESCRIPTION
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        for (const day of JSON.parse(days)) {
            const itineraryValues = [
                trip_name, trip_code, trip_id, day.DAY, day.DATE, day.DAY_TITLE, day.DAY_DESCRIPTION
            ];
            await connection.query(insertItinerarySQL, itineraryValues);
        }

        // Insert image data
        if (file_path) {
            const insertImageSQL = `
                INSERT INTO images (
                    trip_id, file_path
                ) VALUES (?, ?)
            `;
            await connection.query(insertImageSQL, [trip_id, file_path]);
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


app.put('/deletetrips/:trip_id', async (req, res) => {
    const { trip_id } = req.params;
    console.log(trip_id)
    if (!trip_id) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query('UPDATE tripdata SET status = ? WHERE trip_id = ?', ['trash', trip_id]);

        await connection.query('UPDATE tripitenary SET status = ? WHERE trip_id = ?', ['trash', trip_id]);

        await connection.commit();
        res.status(200).json({ message: 'Trip moved to trash successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error moving trip to trash:', error);
        res.status(500).json({ message: 'Error moving trip to trash' });
    } finally {
        connection.release();
    }
});



app.get('/getbookingdetails', async (req, res) => {
    const trip_id = req.query.trip_id;
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
app.get('/supervisordashboard', async (req, res) => {
    const { user_id } = req.query;
    try {
        const connection = await pool.getConnection();

        const [userResult] = await connection.query('SELECT email FROM tripusers WHERE id = ?', [user_id]);

        if (userResult.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'User not found' });
        }

        const userEmail = userResult[0].email;

        const [tripIds] = await connection.query(
            `SELECT tc.trip_id
             FROM tripcoordinators tc
             WHERE tc.email = ? AND tc.role = 'Trip Supervisor'`,
            [userEmail]
        );

        if (tripIds.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'No trips found for this supervisor' });
        }

        const tripIdsArray = tripIds.map(row => row.trip_id);

        const [tripData] = await connection.query(
            `SELECT * 
             FROM tripdata
             WHERE trip_id IN (?)`,
            [tripIdsArray]
        );

        connection.release();
        res.json(tripData);
    } catch (error) {
        console.error('Error fetching supervisor dashboard:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/userdashboard', async (req, res) => {
    const { user_id } = req.query;
    console.log(user_id)
    try {
        const connection = await pool.getConnection();

        const [userResult] = await connection.query('SELECT email FROM tripusers WHERE id = ?', [user_id]);

        if (userResult.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'User not found' });
        }

        const userEmail = userResult[0].email;
        console.log(userEmail)
        const [tripIds] = await connection.query(
            `SELECT tc.trip_id
             FROM tripcoordinators tc
             WHERE tc.email = ? AND tc.role = 'Trip Coordinator'`,
            [userEmail]
        );

        if (tripIds.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'No trips found for this User' });
        }
        console.log(tripIds)
        const tripIdsArray = tripIds.map(row => row.trip_id);

        const [tripData] = await connection.query(
            `SELECT * 
             FROM tripdata
             WHERE trip_id IN (?)`,
            [tripIdsArray]
        );

        connection.release();
        res.json(tripData);
    } catch (error) {
        console.error('Error fetching supervisor dashboard:', error);
        res.status(500).json({ message: 'Internal server error' });
    }


});

app.get('/getallusers', async (req, res) => {


    try {
        const connection = await pool.getConnection();
        const [users] = await connection.query('select  * from tripusers')

        connection.release();

        res.json(users)
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });

    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on https://admin.yeahtrips.in:${process.env.PORT}`);
});
