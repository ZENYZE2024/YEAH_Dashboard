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


const uploadDir = 'uploads\\';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'), false);
        }
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


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json());
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});


// async function updateAdditionalImages(connection, trip_id, additionalImagesData) {
//     const updateImageSQL = `
//         UPDATE images
//         SET additional_image_1 = ?,
//             additional_image_2 = ?,
//             additional_image_3 = ?,
//             additional_image_4 = ?
//         WHERE trip_id = ?
//     `;
//     const additionalImagesArray = [
//         additionalImagesData['additional_image_1'] || null,
//         additionalImagesData['additional_image_2'] || null,
//         additionalImagesData['additional_image_3'] || null,
//         additionalImagesData['additional_image_4'] || null,
//         trip_id
//     ];
//     await connection.query(updateImageSQL, additionalImagesArray);
// }


// Check if the image already exists before inserting




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

app.get('/editdetailstrips/:trip_id', async (req, res) => {
    const trip_id = req.params.trip_id;
    if (!trip_id) {
        return res.status(400).json({ error: 'trip_id is required' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.query(
            `SELECT tripdata.*, images.file_path
             FROM tripdata
             LEFT JOIN images ON tripdata.trip_id = images.trip_id
             WHERE tripdata.trip_id = ?`,
            [trip_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json(rows); // Sends JSON response
    } catch (error) {
        console.error('Error fetching trip data:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    } finally {
        if (connection) connection.release(); // Ensure connection is released
    }
});




app.get('/tripitenary/:trip_id', async (req, res) => {
    const trip_id = req.params.trip_id;

    if (!trip_id) {
        return res.status(400).json({ error: 'trip_id is required' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT * 
             FROM tripitenary
             WHERE trip_id = ?`,
            [trip_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Trip itinerary data not found' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching trip itinerary data:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    } finally {
        if (connection) connection.release(); // Ensure connection is released
    }
});


app.get('/cancellationpolicies/:trip_id', async (req, res) => {
    const trip_id = req.params.trip_id;

    if (!trip_id) {
        return res.status(400).json({ error: 'trip_id is required' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(
            `SELECT * 
             FROM cancellationpolicies
             WHERE trip_id = ?`,
            [trip_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cancellation policies not found' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching cancellation policies:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    } finally {
        if (connection) connection.release();
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
app.post('/addtrips', upload.any(), async (req, res) => {
    console.log('Request Body:', req.body);

    try {
        const {
            trip_name, trip_code, cost, seats, trip_start_date_formatted, end_date_formatted,
            trip_start_point, trip_end_point, destination, trip_duration,
            traveller_type, inclusion, exclusion, points_to_note, trip_type,
            itinerary, trip_description, googlemap, whatsapplink, userId, coordinators,
            cancellationPolicies,cancellationType 
        } = req.body;
        const trip_start_date = trip_start_date_formatted;
        const end_date = end_date_formatted;
        const totalseats = seats;
        const slug = generateSlug(trip_name);
        const files = req.files || [];

        let tripImagePath = '';
        const additionalImages = {};
        const imagesMap = {};
        const coordinatorImages = {};
        let { additionalPickUpPoints } = req.body;

        // Process additional pick-up points
        additionalPickUpPoints = additionalPickUpPoints.map(point => {
            if (typeof point === 'string' && point.includes('[object Object]')) {
                return null;
            }
            if (typeof point === 'string') {
                try {
                    return JSON.parse(point);
                } catch (err) {
                    console.error('Error parsing JSON string:', point);
                    return null;
                }
            }
            return point;
        }).filter(point => point);

        console.log("Parsed additional pick-up points:", additionalPickUpPoints);

        files.forEach(file => {
            const filePath = `\\uploads\\${file.filename}`; 
            const fieldName = file.fieldname;

            if (fieldName.startsWith('trip_images')) {
                tripImagePath = filePath;
            } else if (fieldName.startsWith('additional_images')) {
                const imageMatch = fieldName.match(/^additional_images_(\d+)\[(\d+)\]$/);
                if (imageMatch) {
                    const imageIndex = parseInt(imageMatch[1], 10) + 1;
                    additionalImages[`additional_image_${imageIndex}`] = filePath;
                }
            } else if (file.fieldname.includes('itinerary')) {
                const dayMatch = file.fieldname.match(/itinerary\[(\d+)\]/);
                const dayIndex = dayMatch ? parseInt(dayMatch[1], 10) : null;
                if (dayIndex !== null) {
                    imagesMap[dayIndex] = filePath;
                }
            } else if (file.fieldname.includes('coordinators')) {
                const coordinatorMatch = file.fieldname.match(/^coordinators\[(\d+)\]\[(\w+)\]$/);
                if (coordinatorMatch) {
                    const coordinatorIndex = parseInt(coordinatorMatch[1], 10) + 1;
                    const fieldType = coordinatorMatch[2];

                    if (!coordinatorImages[coordinatorIndex]) {
                        coordinatorImages[coordinatorIndex] = {};
                    }

                    if (fieldType === 'image') {
                        coordinatorImages[coordinatorIndex].image = filePath;
                    } else if (fieldType === 'name') {
                        coordinatorImages[coordinatorIndex].name = req.body[`coordinators[${coordinatorIndex - 1}][name]`];
                    } else if (fieldType === 'role') {
                        coordinatorImages[coordinatorIndex].role = req.body[`coordinators[${coordinatorIndex - 1}][role]`];
                    } else if (fieldType === 'email') {
                        coordinatorImages[coordinatorIndex].email = req.body[`coordinators[${coordinatorIndex - 1}][email]`];
                    }
                }
            }
        });

        console.log('Trip Image Path:', tripImagePath);
        console.log('Additional Images:', additionalImages);
        console.log('Images Map:', imagesMap);
        console.log('Coordinator Images:', coordinatorImages);

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [userResult] = await connection.query(
                'SELECT name FROM tripusers WHERE id = ?',
                [userId]
            );
            const userName = userResult[0]?.name;

            if (!userName) {
                throw new Error('User not found');
            }

            const createdAt = new Date();

            const insertTripSQL = `
                INSERT INTO tripdata (
                    trip_name, trip_code, slug, cost, seats, totalseats, trip_start_date, end_date,
                    trip_start_point, trip_end_point, destination, trip_duration,
                    traveller_type, inclusion, exclusion, points_to_note, trip_type, trip_description, googlemap, whatsapplink,
                    created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const tripValues = [
                trip_name, trip_code, slug, cost, seats, totalseats, trip_start_date, end_date,
                trip_start_point, trip_end_point, destination, trip_duration,
                traveller_type, inclusion, exclusion, points_to_note, trip_type, trip_description, googlemap, whatsapplink,
                userName, createdAt
            ];

            const [result] = await connection.query(insertTripSQL, tripValues);
            const trip_id = result.insertId;

            console.log('Inserted Trip ID:', trip_id);

            // Insert trip image into `images` table
            if (tripImagePath) {
                const insertImageSQL = `
                    INSERT INTO images (trip_id, file_path)
                    VALUES (?, ?)
                `;
                await connection.query(insertImageSQL, [trip_id, tripImagePath]);
                console.log(`Inserted trip image with path: ${tripImagePath}`);
            }

            // Insert additional images into `additionalimages` table
            const insertAdditionalImagesSQL = `
                INSERT INTO additionalimages (trip_id, additional_images)
                VALUES (?, ?)
            `;
            for (const [key, imagePath] of Object.entries(additionalImages)) {
                await connection.query(insertAdditionalImagesSQL, [trip_id, imagePath]);
                console.log(`Inserted additional image with path: ${imagePath}`);
            }

            // Insert itinerary data into `tripitenary` table
            const itineraryData = Array.isArray(itinerary) ? itinerary : JSON.parse(itinerary);

            const insertItinerarySQL = `
                INSERT INTO tripitenary (
                    TRIP_NAME, TRIP_CODE, TRIP_ID, DAY, DATE, DAY_TITLE, DAY_DESCRIPTION, DAY_IMG
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            for (const day of itineraryData) {
                const dayIndex = parseInt(day.DAY.replace('Day ', ''), 10) - 1;
                const itineraryValues = [
                    trip_name, trip_code, trip_id, dayIndex + 1, day.DATE, day.DAY_TITLE, day.DAY_DESCRIPTION,
                    imagesMap[dayIndex] || null
                ];
                await connection.query(insertItinerarySQL, itineraryValues);
            }

            // Insert coordinator data into `tripcoordinators` table
            const insertCoordinatorSQL = `
                INSERT INTO tripcoordinators (trip_id, cordinator_id, image, name, role, email,link,profile_mode)
                VALUES (?, ?, ?, ?, ?, ?,?,?)
            `;
            for (const coordinator of coordinators) {
                const coordinatorValues = [
                    trip_id, coordinator.cordinator_id || null, coordinatorImages[coordinator.cordinator_id]?.image || null,
                    coordinator.name || null, coordinator.role || null, coordinator.email || null,coordinator.link || null,coordinator.profile_mode || null
                ];
                await connection.query(insertCoordinatorSQL, coordinatorValues);
            }

            let processedPolicies = [];
            cancellationPolicies.forEach(policy => {
                if (typeof policy === 'string') {
                    if (policy.startsWith('[object Object]')) {
                        console.warn('Ignoring invalid cancellation policy:', policy);
                    } else {
                        try {
                            const parsedPolicies = JSON.parse(policy);
                            if (Array.isArray(parsedPolicies)) {
                                processedPolicies = processedPolicies.concat(parsedPolicies);
                            }
                        } catch (err) {
                            console.error('Error parsing JSON string:', policy);
                        }
                    }
                }
            });
            
            console.log('Processed Cancellation Policies:', processedPolicies);
            
            const insertCancellationPolicySQL = `
            INSERT INTO cancellationpolicies (policy_startdate, policy_endDate, fee, trip_id, cancellationType)
            VALUES (?, ?, ?, ?, ?)
        `;
        
            
        for (const policy of processedPolicies) {
            const cancellationPolicyValues = [
                policy.startDay, policy.endDay, policy.fee, trip_id, cancellationType 
            ];
            await connection.query(insertCancellationPolicySQL, cancellationPolicyValues);
        }
            
            console.log('Inserted cancellation policies');

            await connection.commit();
            res.json({ message: 'Trip, images, itinerary data, and cancellation policies inserted successfully!' });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Transaction error:', error);
            res.status(500).json({ error: 'Failed to process request' });
        } finally {
            if (connection) connection.release();
        }
    } catch (err) {
        console.error('Error in /addtrips route:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});








// Helper function to insert image
async function insertImage(connection, trip_id, filePath, imageType) {
    const insertImageSQL = `INSERT INTO images (trip_id, file_path, image_type) VALUES (?, ?, ?)`;
    await connection.query(insertImageSQL, [trip_id, filePath, imageType]);
}

// Helper function to update additional images
async function updateAdditionalImages(connection, trip_id, additionalImagesData) {
    const updateImageSQL = `
        UPDATE images
        SET additional_image_1 = ?,
            additional_image_2 = ?,
            additional_image_3 = ?,
            additional_image_4 = ?
        WHERE trip_id = ?
    `;
    const additionalImagesArray = [
        additionalImagesData['additional_image_1'] || null,
        additionalImagesData['additional_image_2'] || null,
        additionalImagesData['additional_image_3'] || null,
        additionalImagesData['additional_image_4'] || null,
        trip_id
    ];

    console.log('Update Additional Images SQL:', updateImageSQL);
    console.log('Update Additional Images Params:', additionalImagesArray);

    try {
        await connection.query(updateImageSQL, additionalImagesArray);
    } catch (err) {
        console.error('Error updating additional images:', err);
        throw err;
    }
}


















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



app.get('/getbookingdetails/:trip_id', async (req, res) => {
    const trip_id = req.params.trip_id;
    console.log("id for bookings", trip_id)
    if (!trip_id) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`
             SELECT * FROM members WHERE trip_id = ?
            `, [trip_id]);

        connection.release();
        console.log("rows", rows)
        res.json(rows);
    } catch (error) {
        console.error('Error connecting to the database:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
})
app.get('/cancellations/:trip_id', async (req, res) => {
    const trip_id = req.params.trip_id

    if (!trip_id) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(`
            SELECT * FROM cancellations WHERE trip_id = ?
           `, [trip_id]);

        connection.release();
        res.json(rows);
    } catch (error) {
        console.error('Error connecting to the database:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
})

app.get('/getcoordinatordetails/:trip_id', async (req, res) => {
    const  trip_id  = req.params.trip_id;
    console.log(req)
    if (!trip_id) {
        return res.status(400).send('trip_id is required');
    }

    try {
        const [rows] = await pool.query('SELECT * FROM tripcoordinators WHERE trip_id = ?', [trip_id]);
        res.json(rows);
        console.log(rows)
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});



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

app.post('/carousaldatasdetailsinformation', async (req, res) => {
    const { title, author } = req.body;
    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
    }

    const connection = await pool.getConnection();
    try {
        const [result] = await connection.query('INSERT INTO tripcarousals (title, author) VALUES (?, ?)', [title, author]);
        res.status(201).json({ id: result.insertId, title, author });
    } catch (err) {
        console.error(err); // Log error to server logs
        res.status(500).json({ message: 'Error inserting carousal' });
    } finally {
        connection.release();
    }
});

app.get('/gettheinformationsincorousals', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        const [rows] = await connection.query('SELECT * FROM tripcarousals');
        
        res.json(rows);
    } catch (err) {
        console.error('Error fetching carousals:', err);
        res.status(500).json({ error: 'Database query failed' });
    } finally {
        if (connection) connection.release();
    }
});

app.delete('/carousaldatasdelete/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
        // Check if the carousal exists
        const [rows] = await connection.query('SELECT * FROM tripcarousals WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Carousal not found' });
        }

        // Delete the carousal
        await connection.query('DELETE FROM tripcarousals WHERE id = ?', [id]);
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting carousal:', err);
        res.status(500).json({ message: 'Error deleting carousal' });
    } finally {
        connection.release();
    }
});


app.post('/carousals', upload.any(), async (req, res) => {
    console.log('Request Body:', req.body);

    try {
        const { title, author, rating } = req.body;
        const files = req.files || [];

        let carousalImagePath = '';
        let authorImagePath = ''; // Variable to store author's image path

        // Loop through the uploaded files and assign the correct paths
        files.forEach(file => {
            const filePath = `uploads/${file.filename}`;
            const fieldName = file.fieldname;

            if (fieldName === 'image') {
                carousalImagePath = filePath;
                console.log(`Set carousalImagePath to: ${filePath}`);
            } else if (fieldName === 'authorImage') {
                authorImagePath = filePath;
                console.log(`Set authorImagePath to: ${filePath}`);
            } else {
                console.warn(`Unexpected fieldname format: ${fieldName}`);
            }
        });

        console.log('Carousal Image Path:', carousalImagePath);
        console.log('Author Image Path:', authorImagePath);

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const createdAt = new Date();

            // SQL query to insert carousal data including the author's image
            const insertCarousalSQL = `
                INSERT INTO carousals (
                    title, author, image, author_image, rating, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;
            const carousalValues = [
                title, author, carousalImagePath, authorImagePath, parseFloat(rating), createdAt // Include author's image path
            ];

            console.log('Inserting Carousal Values:', carousalValues);

            const [result] = await connection.query(insertCarousalSQL, carousalValues);
            const carousal_id = result.insertId;

            console.log('Inserted Carousal ID:', carousal_id);

            await connection.commit();
            res.json({ message: 'Carousal and author image inserted successfully!' });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Transaction error:', error);
            res.status(500).json({ error: 'Failed to process request' });
        } finally {
            if (connection) connection.release();
        }
    } catch (err) {
        console.error('Error processing request:', err);
        res.status(500).json({ error: 'Failed to process request' });
    }
});


app.get('/reviewcarousals', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM carousals');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching carousals:', err);
        res.status(500).json({ error: 'Failed to fetch carousals' });
    } finally {
        if (connection) connection.release();
    }
});


app.delete('/carousalsdelete/:id', async (req, res) => {
    let connection;
    const carousalId = req.params.id;

    try {
        connection = await pool.getConnection();
        
        const deleteQuery = 'DELETE FROM carousals WHERE id = ?';
        const [result] = await connection.query(deleteQuery, [carousalId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Carousal not found' });
        }

        res.json({ message: 'Carousal deleted successfully' });
    } catch (err) {
        console.error('Error deleting carousal:', err);
        res.status(500).json({ error: 'Failed to delete carousal' });
    } finally {
        if (connection) connection.release();
    }
});

app.put('/update-coordinator/:trip_id/:cordinator_id', async (req, res) => {
    const trip_id = req.params.trip_id;
    const cordinator_id = req.params.cordinator_id;
    const { name, role, email, link, profile_mode } = req.body;

    const connection = await pool.getConnection();

    const query = `
        UPDATE tripcoordinators 
        SET name = ?, role = ?, email = ?, link = ?, profile_mode = ? 
        WHERE trip_id = ? AND cordinator_id = ?`;

    connection.query(query, [name, role, email, link, profile_mode, trip_id, cordinator_id], (err, result) => {
        if (err) {
            console.error('Error updating coordinator:', err);
            res.status(500).json({ error: 'Failed to update coordinator' });
        } else {
            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'Coordinator updated successfully' });
            } else {
                res.status(404).json({ message: 'Coordinator not found for the given trip_id and cordinator_id' });
            }
        }
    });
});

app.put('/update-cancellation-policy/:policyId', async (req, res) => {
    const policyId = req.params.policyId;
    const { trip_id, policy_startdate, policy_endDate, fee, cancellationType } = req.body;

    console.log("body",req.body); // Debugging: Check the request body

    // Validate request body
    if (!policyId || !trip_id || !policy_startdate || !policy_endDate || fee === undefined || !cancellationType) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const query = `
            UPDATE cancellationpolicies 
            SET policy_startdate = ?, policy_endDate = ?, fee = ?, cancellationType = ?
            WHERE id = ? AND trip_id = ?`;

        const [result] = await connection.query(query, [policy_startdate, policy_endDate, fee, cancellationType, policyId, trip_id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Cancellation policy updated successfully' });
        } else {
            res.status(404).json({ message: 'Cancellation policy not found or trip_id does not match' });
        }
    } catch (error) {
        console.error('Error updating cancellation policy:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    } finally {
        if (connection) connection.release(); // Ensure connection is released
    }
});



app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on https://admin.yeahtrips.in:${process.env.PORT}`);
});
