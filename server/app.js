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
const nodemailer = require('nodemailer');

app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


const uploadDir = path.join(__dirname, 'uploads');
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
        const fileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml']; // Add SVG, JPG
        if (fileTypes.includes(file.mimetype)) {
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
const otps = {};


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'dev.yeahtrip@gmail.com',
        pass: 'fnzz xhlc jqsg gxqm'
    }
});

const sendOTPByEmail = (email, otp) => {
    const mailOptions = {
        from: 'dev.yeahtrip@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for a short period. Please do not share it with anyone.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending OTP email:', error);
        } else {
            console.log('OTP email sent:', info.response);
        }
    });
};

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token' });

        // If token is valid, attach the userId to the request
        req.userId = decoded.userId;
        next();
    });
}

app.post('/generatenewpassword', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ message: 'Email and new password are required.' });
    }

    const connection = await pool.getConnection();

    try {
        // Check if the user exists in the tripusers table
        const [rows] = await connection.query('SELECT * FROM tripusers WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Email address not found.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10); // You can adjust the salt rounds (10 is common)

        // Update the user's password in the database
        await connection.query('UPDATE tripusers SET password = ? WHERE email = ?', [hashedPassword, email]);

        res.status(200).json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ success: false, message: 'Error processing request. Please try again later.' });
    } finally {
        if (connection) connection.release();
    }
});

app.post('/adduser', upload.single('image'), async (req, res) => {
    const { email, password, role, name, link, profile_mode, position } = req.body;
    const profileImage = req.file ? `\\uploads\\${req.file.filename}` : null; // Adjust path based on your setup
    console.log(req.body);

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
            'INSERT INTO tripusers (email, password, role, profile_image, name, link, profile_mode, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, role, profileImage, name, link, profile_mode, position]
        );

        await connection.release();

        res.status(201).json({ message: 'User added successfully', userId: result.insertId });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Error adding user' });
    }
});




app.post('/verifytheotp', async (req, res) => {
    const { email, otp } = req.body;
    console.log(req.body); // Log the received data for debugging
    console.log("otpstored", otps);

    // Check if the email exists in the OTP storage and the OTP matches
    if (otps[email] && otps[email].otp === otp) {
        delete otps[email]; // Remove OTP after verification
        return res.status(200).json({ message: 'OTP verified successfully.' });
    } else {
        // If OTP does not match
        return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
});



app.post('/forgotthepassword', async (req, res) => {
    const { email } = req.body;
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query('SELECT * FROM tripusers WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Email address not found.' });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Random 4-digit OTP

        // Store OTP in the format: { email: email, otp: otp }
        otps[email] = { email: email, otp: otp };

        sendOTPByEmail(email, otp);
        res.status(200).json({ message: 'OTP sent to your email address.' });
    } catch (error) {
        console.error('Error in forgot-password:', error);
        res.status(500).json({ message: 'Error processing request. Please try again later.' });
    } finally {
        if (connection) connection.release();
    }
});




app.put('/updateuser/:userId', upload.single('profile_image'), async (req, res) => {
    const { userId } = req.params;
    const { email, password, role, name, link, profile_mode } = req.body;

    // Check if a new image was uploaded
    const profileImage = req.file ? `\\uploads\\${req.file.filename}` : null; // Adjust path based on your setup

    try {
        const connection = await pool.getConnection();

        // Check if the user exists
        const [existingUser] = await connection.execute(
            'SELECT * FROM tripusers WHERE id = ?',
            [userId]
        );

        if (existingUser.length === 0) {
            await connection.release();
            return res.status(404).json({ message: 'User not found' });
        }

        // If a new password is provided, hash it
        let hashedPassword;
        if (password) {
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        // Prepare the update query
        const updateQuery = `
            UPDATE tripusers
            SET 
                email = COALESCE(?, email),
                password = COALESCE(?, password),
                role = COALESCE(?, role),
                profile_image = COALESCE(?, profile_image),
                name = COALESCE(?, name),
                link = COALESCE(?, link),
                profile_mode = COALESCE(?, profile_mode)
            WHERE id = ?
        `;

        const updateParams = [
            email,
            hashedPassword,
            role,
            profileImage,
            name,
            link,
            profile_mode,
            userId
        ];

        await connection.execute(updateQuery, updateParams);
        await connection.release();

        res.status(200).json({ message: 'User details updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user details' });
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
        console.log(rows)
    } catch (error) {
        console.error('Error fetching trip itinerary data:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    } finally {
        if (connection) connection.release(); // Ensure connection is released
    }
});


app.get('/cancellationpolicies/:trip_id', async (req, res) => {
    const trip_id = req.params.trip_id;
    console.log(trip_id);

    if (!trip_id) {
        return res.status(400).json({ error: 'trip_id is required' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // Step 1: Get policy_ids for the given trip_id
        const [cancellationPolicies] = await connection.query(
            `SELECT policy_id 
             FROM cancellationpolicies
             WHERE trip_id = ?`,
            [trip_id]
        );

        if (cancellationPolicies.length === 0) {
            return res.status(404).json({ error: 'Cancellation policies not found for the given trip_id' });
        }

        // Step 2: Extract policy_ids
        const policyIds = cancellationPolicies.map(policy => policy.policy_id);

        // Step 3: Get details from cancellationpolicy and policy_date_range tables
        const [policyDetails] = await connection.query(
            `SELECT p.policy_id, p.fee_type, d.start_date, d.end_date, d.fee, d.policy_name 
             FROM cancellationpolicy p
             JOIN policy_date_ranges d ON p.policy_id = d.policy_id
             WHERE p.policy_id IN (?)`,
            [policyIds]
        );

        res.json(policyDetails);
    } catch (error) {
        console.error('Error fetching cancellation policies:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    } finally {
        if (connection) connection.release();
    }
});


app.put('/updatetrip', upload.single('trip_image'), async (req, res) => {
    const tripDetails = req.body;
    const trip_id = tripDetails.trip_id;
    const { trip_start_date, end_date, ...otherDetails } = tripDetails;

    console.log("Trip ID:", trip_id);
    console.log("Received Trip Data:", req.body);

    try {
        // Establish database connection
        const connection = await pool.getConnection();

        try {
            // Start the transaction
            await connection.beginTransaction();

            // Update trip details in the tripdata table
            const { file_path, ...updateFields } = tripDetails;
            const setClause = Object.keys(updateFields)
                .map(key => `${key} = ?`)
                .join(', ');

            if (setClause) {
                const sqlUpdate = `UPDATE tripdata SET ${setClause} WHERE trip_id = ?`;
                const valuesUpdate = [...Object.values(updateFields), trip_id];
                await connection.query(sqlUpdate, valuesUpdate);
                console.log("Trip details updated in tripdata table");
            }

            // Handle the image file update if a new file is uploaded
            if (req.file) {
                const newFilePath = `/uploads/${req.file.filename}`;
                const [rows] = await connection.query('SELECT * FROM images WHERE trip_id = ?', [trip_id]);

                let sql;
                let values;

                if (rows.length > 0) {
                    sql = 'UPDATE images SET file_path = ? WHERE trip_id = ?';
                    values = [newFilePath, trip_id];
                } else {
                    sql = 'INSERT INTO images (trip_id, file_path) VALUES (?, ?)';
                    values = [trip_id, newFilePath];
                }

                await connection.query(sql, values);
                console.log("Image file updated");
            }

            // Update the itinerary dates
            if (trip_start_date && end_date) {
                console.log("Trip start date:", trip_start_date);
                console.log("Trip end date:", end_date);

                // Fetch the itinerary entries for the given trip_id
                const [itineraryRows] = await connection.query('SELECT * FROM tripitenary WHERE TRIP_ID = ?', [trip_id]);

                console.log("Itinerary Rows:", itineraryRows);
                if (itineraryRows.length > 0) {
                    const firstDay = itineraryRows[0];
                    const lastDay = itineraryRows[itineraryRows.length - 1];

                    console.log("First Day:", firstDay);
                    console.log("Last Day:", lastDay);

                    // Update the first day with the start date
                    const resultFirstDay = await connection.query(
                        'UPDATE tripitenary SET DATE = ? WHERE TRIP_ID = ? AND DAY = ?',
                        [trip_start_date, trip_id, firstDay.DAY]
                    );

                    // Update the last day with the end date
                    const resultLastDay = await connection.query(
                        'UPDATE tripitenary SET DATE = ? WHERE TRIP_ID = ? AND DAY = ?',
                        [end_date, trip_id, lastDay.DAY]
                    );
                } else {
                    console.log("No itinerary data found for trip_id:", trip_id);
                }
            }

            // Commit the transaction if everything is successful
            await connection.commit();
            res.json({ message: 'Trip details, itinerary dates, and image file updated successfully!' });

        } catch (err) {
            // Rollback the transaction if an error occurs
            await connection.rollback();
            console.error('Transaction Error:', err);
            res.status(500).json({ error: 'Failed to update trip details, itinerary, or image.' });
        } finally {
            // Release the connection back to the pool
            connection.release();
        }

    } catch (err) {
        // Log connection errors
        console.error('Database Connection Error:', err);
        res.status(500).json({ error: 'Database connection failed.' });
    }
});




app.put('/updatetinerary/:dayIndex', upload.single('image'), async (req, res) => {
    const dayIndex = parseInt(req.params.dayIndex, 10);  // Get the specific day index from the route and parse to integer
    const { DATE, DAY_TITLE, DAY_DESCRIPTION, TRIP_ID, DAY } = req.body;
    const imageFile = req.file; // Access the uploaded image, if present

    // Log the request body and image file details
    console.log('Request Body:', req.body);
    console.log('Uploaded Image File:', imageFile);

    // Build the SQL update data
    const updateData = {
        DATE,
        DAY_TITLE,
        DAY_DESCRIPTION,
        DAY_IMG: imageFile ? `/uploads/${imageFile.filename}` : undefined  // Use new image if uploaded
    };

    // Filter out undefined fields (e.g., when no new image is uploaded)
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Log the SQL update data and parameters
    console.log('Update Data:', updateData);
    console.log('TRIP_ID:', TRIP_ID);
    console.log('Day Index:', dayIndex);

    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Update the specific day in the database
            const sql = 'UPDATE tripitenary SET ? WHERE TRIP_ID = ? AND DAY = ?';
            const [result] = await connection.query(sql, [updateData, TRIP_ID, DAY]);

            // Log the result of the query
            console.log('Query Result:', result);

            await connection.commit();
            res.json({ message: 'Itinerary day updated successfully!' });
        } catch (err) {
            await connection.rollback();
            console.error('Error updating itinerary day:', err);
            res.status(500).json({ error: 'Failed to update itinerary day' });
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
            cancellationPolicies, cancellationType
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

            const insertTripSQL = `INSERT INTO tripdata (
                trip_name, trip_code, slug, cost, seats, totalseats, trip_start_date, end_date,
                trip_start_point, trip_end_point, destination, trip_duration,
                traveller_type, inclusion, exclusion, points_to_note, trip_type, trip_description, googlemap, whatsapplink,
                created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
                const insertImageSQL = `INSERT INTO images (trip_id, file_path) VALUES (?, ?)`;
                await connection.query(insertImageSQL, [trip_id, tripImagePath]);
                console.log(`Inserted trip image with path: ${tripImagePath}`);
            }

            // Insert additional images into `additionalimages` table
            const insertAdditionalImagesSQL = `INSERT INTO additionalimages (trip_id, additional_images) VALUES (?, ?)`;
            for (const [key, imagePath] of Object.entries(additionalImages)) {
                await connection.query(insertAdditionalImagesSQL, [trip_id, imagePath]);
                console.log(`Inserted additional image with path: ${imagePath}`);
            }

            // Insert itinerary data into `tripitenary` table
            const itineraryData = Array.isArray(itinerary) ? itinerary : JSON.parse(itinerary);

            const insertItinerarySQL = `INSERT INTO tripitenary (
                TRIP_NAME, TRIP_CODE, TRIP_ID, DAY, DATE, DAY_TITLE, DAY_DESCRIPTION, DAY_IMG
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            for (const day of itineraryData) {
                const dayIndex = parseInt(day.DAY.replace('Day ', ''), 10) - 1;
                const itineraryValues = [
                    trip_name, trip_code, trip_id, dayIndex + 1, day.DATE, day.DAY_TITLE, day.DAY_DESCRIPTION,
                    imagesMap[dayIndex] || null
                ];
                await connection.query(insertItinerarySQL, itineraryValues);
            }

            // Fetch additional coordinator details and insert them into `tripcoordinators` table
            const fetchCoordinatorDetailsSQL = `SELECT id, link, profile_image, profile_mode FROM tripusers WHERE email = ?`;
            const insertCoordinatorSQL = `INSERT INTO tripcoordinators (
                trip_id, cordinator_id, image, name, role, email, link, profile_mode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            for (const coordinator of coordinators) {
                const [coordinatorDetails] = await connection.query(fetchCoordinatorDetailsSQL, [coordinator.email]);
                const coordinatorData = coordinatorDetails[0] || {};

                const coordinatorValues = [
                    trip_id, coordinatorData.id || null, // Use the id fetched from tripusers
                    coordinatorData.profile_image || null,
                    coordinator.name || null, coordinator.role || null, coordinator.email || null,
                    coordinatorData.link || null, coordinatorData.profile_mode || null
                ];
                await connection.query(insertCoordinatorSQL, coordinatorValues);
            }

            // Process and insert cancellation policies
            // Process and insert cancellation policies
            let processedPolicies = [];
            cancellationPolicies.forEach(policy => {
                if (typeof policy === 'string' && policy.trim() !== 'undefined') {
                    try {
                        const parsedPolicies = JSON.parse(policy);
                        if (Array.isArray(parsedPolicies)) {
                            processedPolicies = processedPolicies.concat(parsedPolicies);
                        }
                    } catch (err) {
                        console.error('Error parsing cancellation policy:', policy, err);
                    }
                }
            });

            console.log('Processed Cancellation Policies:', JSON.stringify(processedPolicies, null, 2));

            // Update the SQL query to only include policy_id and trip_id
            const insertCancellationPolicySQL = `INSERT INTO cancellationpolicies (
                policy_id, trip_id
            ) VALUES (?, ?)`;

            for (const policy of processedPolicies) {
                // Here you may want to extract policy_id from the policy object
                const policyId = policy.id; // Assuming policy_id exists in your policy object

                // Assuming trip_id is defined elsewhere in your code
                const tripId = trip_id; // Ensure trip_id is accessible

                // Prepare the values for insertion
                const cancellationPolicyValues = [
                    policyId,  // The policy_id from the policy object
                    tripId     // The trip_id
                ];

                // Insert the record into the database
                await connection.query(insertCancellationPolicySQL, cancellationPolicyValues);
            }

            console.log('Inserted cancellation policies');


            await connection.commit();
            res.json({ message: 'Trip, images, itinerary data, and policies inserted successfully!' });
        } catch (error) {
            console.error('Error inserting trip data:', error);
            if (connection) {
                await connection.rollback();
            }
            res.status(500).json({ message: 'Error inserting trip data', error });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Unexpected error occurred', error });
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
    console.log("id for bookings", trip_id);

    if (!trip_id) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }

    try {
        const connection = await pool.getConnection();

        // Query to get data from the members table using trip_id
        const [membersRows] = await connection.query(`
            SELECT * FROM members WHERE trip_id = ?
        `, [trip_id]);

        // Check if there are no members, but don't throw an error
        if (membersRows.length === 0) {
            connection.release();
            return res.json([]);  // Return an empty array if no members are found
        }

        // Extract booking_ids from membersRows
        const bookingIds = membersRows.map(member => member.booking_id);

        // Check if there are no booking IDs, but don't throw an error
        if (bookingIds.length === 0) {
            connection.release();
            return res.json([]);
        }

        const [bookingsRows] = await connection.query(`
            SELECT * FROM bookings WHERE booking_id IN (?)
        `, [bookingIds]);

        connection.release();

        const combinedData = membersRows.map(member => {
            const booking = bookingsRows.find(booking => booking.booking_id === member.booking_id);
            return {
                ...member,
                bookingDetails: booking || null  // Attach booking details or null if not found
            };
        });

        // Send the combined data as the response
        res.json(combinedData);
        console.log(combinedData);
    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

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
    const trip_id = req.params.trip_id;
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
app.put('/update-coordinator/:trip_id/:coordinator_id', upload.single('image'), async (req, res) => {
    const trip_id = req.params.trip_id;
    const coordinator_id = req.params.coordinator_id;
    const { name, role, email, link, profile_mode, existingImage } = req.body;
    console.log(req.body)
    const image = req.file ? `\\uploads\\${req.file.filename}` : existingImage; // If no new image, use existing image
    console.log("Image URL:", image);

    let connection;
    try {
        connection = await pool.getConnection();

        // Query to update coordinator details
        const query = `
            UPDATE tripcoordinators 
            SET name = ?, role = ?, email = ?, link = ?, profile_mode = ?, image = ? 
            WHERE trip_id = ? AND cordinator_id = ?`;

        const [result] = await connection.query(query, [name, role, email, link, profile_mode, image, trip_id, coordinator_id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Coordinator updated successfully' });
        } else {
            res.status(404).json({ message: 'Coordinator not found for the given trip_id and coordinator_id' });
        }
    } catch (error) {
        console.error('Error updating coordinator:', error);
        res.status(500).json({ error: 'Failed to update coordinator' });
    } finally {
        if (connection) connection.release(); // Ensure the connection is released
    }
});


app.put('/update-cancellation-policy/:tripId', async (req, res) => {
    const tripId = req.params.tripId; // This is the trip_id you want to update the policy_id for
    const { policy_id } = req.body; // Only policy_id is received from the request body

    console.log("body", req.body);

    // Validate request body
    if (!policy_id || !tripId) {
        return res.status(400).json({ error: 'Both policy_id and trip_id are required' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // Check if the tripId exists before attempting to update
        const [tripCheck] = await connection.query('SELECT * FROM cancellationpolicies WHERE trip_id = ?', [tripId]);
        if (tripCheck.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Update the policy_id for the specified trip_id
        const query = `
            UPDATE cancellationpolicies 
            SET policy_id = ? 
            WHERE trip_id = ?`;

        const [result] = await connection.query(query, [policy_id, tripId]); // Updating the policy_id

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Cancellation policy updated successfully' });
        } else {
            res.status(500).json({ message: 'Failed to update policy' });
        }
    } catch (error) {
        console.error('Error updating cancellation policy:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    } finally {
        if (connection) connection.release(); // Ensure connection is released
    }
});


app.get('/getwhatsapp-links', async (req, res) => {
    let connection;

    try {
        connection = await pool.getConnection();

        const [results] = await connection.query('SELECT * FROM whatsapp_links');

        res.json(results);

        console.log(results);

    } catch (error) {
        console.error('Error fetching data: ', error);

        res.status(500).json({ error: 'Database query failed' });
    } finally {
        if (connection) connection.release();
    }
});


app.post('/whatsapp-links', async (req, res) => {
    const { link, name } = req.body;

    if (!link || !name) {
        return res.status(400).send('Link and name are required');
    }

    let connection;

    try {
        connection = await pool.getConnection();

        const query = 'INSERT INTO whatsapp_links (link, name) VALUES (?, ?)';
        const [result] = await connection.execute(query, [link, name]);

        res.json({ id: result.insertId, link, name });

    } catch (error) {
        console.error('Error inserting WhatsApp link:', error);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
});

app.put('/updatewhatsapp-links/:id', async (req, res) => {
    const { id } = req.params; 
    const { link, name } = req.body; 
    console.log("edit",req.body)

    if (!link || !name) {
        return res.status(400).send('Link and name are required');
    }

    try {
        const connection = await pool.getConnection(); 

        try {
            const result = await connection.query(
                'UPDATE whatsapp_links SET link = ?, name = ? WHERE id = ?',
                [link, name, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).send('Link not found'); 
            }

            res.status(200).send({ id, link, name }); 
        } catch (queryErr) {
            console.error('Error executing UPDATE query:', queryErr);
            res.status(500).send('Error updating link'); 
        } finally {
            connection.release(); 
        }
    } catch (connErr) {
        console.error('Error establishing database connection:', connErr);
        res.status(500).send('Database connection error'); 
    }
});


app.delete('/whatsapp-links/:id', async (req, res) => {
    const { id } = req.params; 

    try {
        const connection = await pool.getConnection();

        try {
            const result = await connection.query('DELETE FROM whatsapp_links WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).send('Link not found'); 
            }
            
            res.status(200).send('Link deleted successfully'); 
        } catch (queryErr) {
            console.error('Error executing DELETE query:', queryErr);
            res.status(500).send('Error deleting link'); 
        } finally {
            connection.release(); 
        }
    } catch (connErr) {
        console.error('Error establishing database connection:', connErr);
        res.status(500).send('Database connection error'); 
    }
});

app.get('/getthecoordinators', async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query('SELECT * FROM tripusers');

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching coordinators:', error);
        res.status(500).json({ message: 'Error fetching coordinators' });
    } finally {
        connection.release();
    }
});

app.post('/entercancellationpolicy', async (req, res) => {
    const { policies } = req.body;

    // Log the received data
    console.log('Received data:', req.body);

    if (!Array.isArray(policies)) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        for (const policy of policies) {
            const { policyName, feeType, dateRanges } = policy;

            // Log the policy data
            console.log('Processing policy:', feeType, dateRanges);

            if (!feeType || !Array.isArray(dateRanges)) {
                return res.status(400).json({ error: 'Invalid policy data' });
            }

            // Insert policy
            const [policyResult] = await connection.query(
                'INSERT INTO cancellationpolicy (fee_type) VALUES (?)',
                [feeType]
            );

            const policyId = policyResult.insertId;

            // Insert date ranges, convert empty startDate to NULL, enforce non-NULL endDate
            const dateRangeValues = dateRanges.map(range => {
                // Ensure endDate is not empty or undefined
                if (!range.endDate || range.endDate === '') {
                    throw new Error('endDate cannot be empty');
                }

                return [
                    policyId,
                    range.startDate === '' ? null : range.startDate, // Convert empty startDate to NULL
                    range.endDate,  // endDate cannot be NULL or empty
                    range.fee,
                    policyName  // Include policyName in the values
                ];
            });

            // Update the insert query to include the policy_name column
            await connection.query(
                'INSERT INTO policy_date_ranges (policy_id, start_date, end_date, fee, policy_name) VALUES ?',
                [dateRangeValues]
            );
        }

        res.status(201).json({ message: 'Cancellation policies created successfully' });
    } catch (error) {
        console.error('Error creating cancellation policies:', error);

        // Handle custom error for empty endDate
        if (error.message === 'endDate cannot be empty') {
            return res.status(400).json({ error: 'endDate is required and cannot be empty.' });
        }

        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

app.put('/updatecancellationpolicy/:id', async (req, res) => {
    const policyId = req.params.id; // Extract policy ID from the URL
    const { policyName, feeType, dateRanges } = req.body; // Extract data from the request body

    // Log the received data
    console.log('Updating policy:', { policyId, policyName, feeType, dateRanges });

    // Check if the input is valid
    if (!feeType || !Array.isArray(dateRanges)) {
        return res.status(400).json({ error: 'Invalid policy data' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // Update the policy's fee type
        const [updatePolicyResult] = await connection.query(
            'UPDATE cancellationpolicy SET fee_type = ? WHERE policy_id = ?', // Use 'id' if that's the column name
            [feeType, policyId]
        );

        // Check if the policy was updated
        if (updatePolicyResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Policy not found' });
        }

        // Delete existing date ranges for the policy
        await connection.query('DELETE FROM policy_date_ranges WHERE policy_id = ?', [policyId]);

        // Insert new date ranges
        const dateRangeValues = dateRanges.map(range => {
            // Ensure endDate is defined (can be 0, but not undefined or null)
            if (range.endDate === undefined || range.endDate === null || (typeof range.endDate === 'string' && range.endDate.trim() === '')) {
                throw new Error('endDate cannot be empty or undefined');
            }

            return [
                policyId,  // Use the correct policy ID
                range.startDate === '' ? null : range.startDate, // Convert empty startDate to NULL
                range.endDate,  // Allow endDate to be 0
                range.fee,
                policyName  // Include policyName in the values
            ];
        });

        await connection.query(
            'INSERT INTO policy_date_ranges (policy_id, start_date, end_date, fee, policy_name) VALUES ?',
            [dateRangeValues]
        );

        res.status(200).json({ message: 'Cancellation policy updated successfully' });
    } catch (error) {
        console.error('Error updating cancellation policy:', error);

        // Handle custom error for empty endDate
        if (error.message.includes('endDate cannot be empty')) {
            return res.status(400).json({ error: 'endDate is required and cannot be empty or undefined.' });
        }

        res.status(500).json({ error: 'An error occurred while updating the policy' });
    } finally {
        if (connection) connection.release();
    }
});


app.get('/getCancellationPolicies', async (req, res) => {
    let connection;

    try {
        // Get a connection from the pool
        connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT cp.policy_id, cp.fee_type, dr.policy_name, dr.start_date, dr.end_date, dr.fee
            FROM cancellationpolicy AS cp
            LEFT JOIN policy_date_ranges AS dr ON cp.policy_id = dr.policy_id
        `);
        console.log(rows)

        const policies = {};
        rows.forEach(row => {
            if (!policies[row.policy_id]) {
                policies[row.policy_id] = {
                    id: row.policy_id,
                    feeType: row.fee_type,
                    policyName: row.policy_name, // Include policy_name from cancellationpolicies
                    dateRanges: [],
                };
            }

            // Push date ranges into the corresponding policy
            policies[row.policy_id].dateRanges.push({
                startDate: row.start_date,
                endDate: row.end_date,
                fee: row.fee,
            });
        });

        const result = Object.values(policies);

        res.json(result);
        console.log(result)
    } catch (error) {
        console.error('Error fetching cancellation policies:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
});



app.delete('/deletecancellationpolicy/:id', async (req, res) => {
    const policyId = req.params.id;

    try {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const deleteDateRangesQuery = 'DELETE FROM policy_date_ranges WHERE policy_id = ?';
            await connection.query(deleteDateRangesQuery, [policyId]);

            const deletePolicyQuery = 'DELETE FROM cancellationpolicy WHERE policy_id = ?';
            await connection.query(deletePolicyQuery, [policyId]);

            await connection.commit();

            res.status(200).json({ message: 'Policy and related date ranges deleted successfully' });

        } catch (error) {
            await connection.rollback();
            console.error('Error during transaction:', error);
            res.status(500).json({ message: 'Failed to delete policy' });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).json({ message: 'Failed to connect to the database' });
    }
});

app.post('/discountcoupons', async (req, res) => {
    const { couponCode, discountValue, discountTypes, range, expiryDate, isActive, emails } = req.body;

    console.log(req.body);

    // Validate input
    if (!couponCode || !discountValue || !range?.min || !range?.max || !expiryDate) {
        return res.status(400).send({ message: 'Invalid input' });
    }

    try {
        const connection = await pool.getConnection();

        const discountType = discountTypes.percentage ? 'percentage' : 'amount';
        const minAmount = Number(range.min);  // Ensure these are numbers
        const maxAmount = Number(range.max);

        // Insert coupon into the database
        const query = `
            INSERT INTO coupons (coupon_code, discount_type, discount_value, min_amount, max_amount, expiry_date, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(query, [
            couponCode,
            discountType,
            discountValue, // Use the correct property
            minAmount,
            maxAmount,
            expiryDate,
            isActive ? 1 : 0, // Convert boolean to TINYINT
        ]);

        const couponId = result.insertId;

        // Insert associated emails into coupon_emails table
        if (emails && emails.length > 0) {
            const emailQuery = `INSERT INTO coupon_emails (coupon_id, email) VALUES ?`;
            const emailValues = emails.map((email) => [couponId, email]);

            await connection.query(emailQuery, [emailValues]);
        }

        connection.release();

        res.status(200).send({ message: 'Coupon created successfully!' });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).send({ message: 'Error creating coupon.' });
    }
});



app.get('/getthecoupondetails', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        // Query to get the coupon details
        const couponQuery = `
            SELECT c.id AS coupon_id, c.coupon_code, c.discount_type,c.discount_value, c.min_amount, c.max_amount, c.expiry_date, c.is_active,
            GROUP_CONCAT(ce.email) AS emails
            FROM coupons c
            LEFT JOIN coupon_emails ce ON c.id = ce.coupon_id
            GROUP BY c.id
        `;

        const [coupons] = await connection.query(couponQuery);

        connection.release();

        if (coupons.length === 0) {
            return res.status(404).send({ message: 'No coupons found' });
        }

        res.status(200).send({ coupons });
        console.log(coupons)
    } catch (error) {
        console.error('Error fetching coupon details:', error);
        res.status(500).send({ message: 'Error fetching coupon details.' });
    }
});

app.put('/discountcoupons/:coupon_id', async (req, res) => {
    const couponId = req.params.coupon_id; // Get the coupon ID from the request parameters
    const { couponCode, discountValue, discountTypes, range, expiryDate, isActive, emails } = req.body;

    console.log(req.body); // Log incoming request body

    // Validate input
    if (!couponCode || !discountValue || !range.min || !range.max || !expiryDate) {
        return res.status(400).send({ message: 'Invalid input' });
    }

    // Extract only the date part from expiryDate
    const formattedExpiryDate = expiryDate.split('T')[0]; // Get the date in 'YYYY-MM-DD' format

    let connection;
    try {
        connection = await pool.getConnection();

        const discountType = discountTypes.percentage ? 'percentage' : 'amount';
        const minAmount = range.min;
        const maxAmount = range.max;

        // Update coupon details with discount value included
        const query = `
            UPDATE coupons 
            SET coupon_code = ?, discount_value = ?, discount_type = ?, min_amount = ?, max_amount = ?, expiry_date = ?, is_active = ? 
            WHERE id = ?
        `;
        await connection.query(query, [
            couponCode,
            discountValue, // Include discount_value in the query
            discountType,
            minAmount,
            maxAmount,
            formattedExpiryDate, // Use the formatted date here
            isActive,
            couponId, // This corresponds to the 'id' in your coupons table
        ]);

        // Update email list
        await connection.query(`DELETE FROM coupon_emails WHERE coupon_id = ?`, [couponId]);

        if (emails && emails.length > 0) {
            const emailQuery = `INSERT INTO coupon_emails (coupon_id, email) VALUES ?`;
            const emailValues = emails.map((email) => [couponId, email]);
            await connection.query(emailQuery, [emailValues]);
        }

        res.status(200).send({ message: 'Coupon updated successfully!' });
    } catch (error) {
        console.error('Error updating coupon:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).send({ message: 'Error updating coupon.' });
    } finally {
        if (connection) connection.release(); // Ensure connection is released
    }
});


app.get('/gettheeditpickuppoints', async (req, res) => {
    // Extract trip_id from request body
    const { trip_id } = req.query;

    if (!trip_id) {
        return res.status(400).json({ error: 'trip_id is required' });
    }

    try {
        const connection = await pool.getConnection();

        // Modify the SQL query to join tripdata and pickuppoints
        const [rows] = await connection.query(`
            SELECT pp.*, td.googlemap 
            FROM pickuppoints pp 
            JOIN tripdata td ON pp.trip_id = td.trip_id 
            WHERE pp.trip_id = ?
        `, [trip_id]);

        connection.release();

        if (rows.length > 0) {
            const googlemapLink = rows[0].googlemap;
            rows.forEach((item, index) => {
                if (index !== 0) {
                    delete item.googlemap;
                } else {
                    item.googlemap = googlemapLink;
                }
            });
        }

        res.json(rows);
    } catch (err) {
        console.error('Error fetching pickup points:', err);
        res.status(500).json({ error: 'An error occurred while fetching pickup points' });
    }
});





app.put('/updatethePickupPoints', async (req, res) => {
    const { trip_id, pickupPoints } = req.body;

    console.log(req.body); // For debugging

    if (!trip_id || !Array.isArray(pickupPoints)) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Update pickuppoints table
        const updatePickupPointsPromises = pickupPoints.map(async (point) => {
            const { id, pickuppoint, time } = point;
            const sql = `
          UPDATE pickuppoints 
          SET pickuppoint = ?, time = ?
          WHERE id = ? AND trip_id = ?
        `;
            const [result] = await connection.execute(sql, [pickuppoint, time, id, trip_id]);
            return result;
        });

        // Wait for all pickup point updates to finish
        await Promise.all(updatePickupPointsPromises);

        // Update the googlemap field in the tripdata table (use trip_id to update googlemap)
        const googlemap = pickupPoints[0]?.googlemap; // Assuming googlemap is provided in the first pickup point
        if (googlemap) {
            const updateGoogleMapSql = `
          UPDATE tripdata 
          SET googlemap = ?
          WHERE trip_id = ?
        `;
            await connection.execute(updateGoogleMapSql, [googlemap, trip_id]);
        }

        // Commit the transaction after all updates
        await connection.commit();
        res.status(200).json({ message: 'Pickup points and Google Map link updated successfully!' });
    } catch (error) {
        console.error('Error updating pickup points and Google Map link:', error);
        await connection.rollback();
        res.status(500).json({ error: 'Failed to update pickup points and Google Map link' });
    } finally {
        connection.release();
    }
});


app.get('/getuser/:id', async (req, res) => {
    const userId = req.params.id; // Get the user ID from the request parameters

    try {
        const connection = await pool.getConnection(); // Get a connection from the pool
        const [results] = await connection.query('SELECT * FROM tripusers WHERE id = ?', [userId]);

        connection.release(); // Release the connection back to the pool

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' }); // User not found response
        }

        res.json(results[0]); // Return the specific user object
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ error: 'Internal server error' }); // Handle errors
    }
});

app.get('/getcancellationpolicy/:policyId', async (req, res) => {
    let connection;

    try {
        // Get the policyId from the request parameters
        const policyId = req.params.policyId;

        // Get a connection from the pool
        connection = await pool.getConnection();

        // Query to fetch the specific cancellation policy based on policyId
        const [rows] = await connection.query(`
            SELECT cp.policy_id, cp.fee_type, dr.policy_name, dr.start_date, dr.end_date, dr.fee
            FROM cancellationpolicy AS cp
            LEFT JOIN policy_date_ranges AS dr ON cp.policy_id = dr.policy_id
            WHERE cp.policy_id = ?
        `, [policyId]);

        // Check if any rows are returned
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Policy not found' });
        }

        const policy = {
            id: rows[0].policy_id,
            feeType: rows[0].fee_type,
            policyName: rows[0].policy_name, // Include policy_name from cancellationpolicy
            dateRanges: [],
        };

        // Push date ranges into the corresponding policy
        rows.forEach(row => {
            policy.dateRanges.push({
                startDate: row.start_date,
                endDate: row.end_date,
                fee: row.fee,
            });
        });

        res.json(policy);
    } catch (error) {
        console.error('Error fetching cancellation policy:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
});

app.post('/coordinatorstrip', async (req, res) => {
    const { name, email, role, tripId } = req.body;

    if (!name || !email || !role || !tripId) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    let connection;
    try {
        connection = await pool.getConnection(); // Get a connection from the pool

        // Step 1: Fetch coordinator details from tripusers table
        const userQuery = 'SELECT id AS coordinator_id, profile_image AS image, link, profile_mode FROM tripusers WHERE email = ?';
        const [userResult] = await connection.query(userQuery, [email]);

        if (userResult.length === 0) {
            return res.status(404).json({ message: 'Coordinator not found with the provided email' });
        }

        const { coordinator_id, image, link, profile_mode } = userResult[0]; // Get the first user detail

        // Step 2: Insert the new coordinator into tripcoordinators table
        const sql = 'INSERT INTO tripcoordinators (name, email, role, trip_id, cordinator_id, image, link, profile_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

        // Execute the insert query
        const [result] = await connection.query(sql, [name, email, role, tripId, coordinator_id, image, link, profile_mode]);

        res.status(201).json({ message: 'Coordinator added successfully', id: result.insertId });
    } catch (err) {
        console.error('Error inserting coordinator:', err);
        res.status(500).json({ message: 'Failed to add coordinator' });
    } finally {
        if (connection) connection.release(); // Release the connection back to the pool
    }
});


app.post('/blog', upload.single('image'), async (req, res) => { 
    const connection = await pool.getConnection();
    try {
        const { title, slug, content } = req.body; 

        let imagePath = ''; 

        if (req.file) {
            imagePath = `\\uploads\\${req.file.filename}`; 
        }

        const sql = 'INSERT INTO blogs (image, title, slug, content) VALUES (?, ?, ?, ?)';
        await connection.query(sql, [imagePath, title, slug, content]);

        res.status(201).json({ message: 'Blog post created successfully!' });
    } catch (error) {
        console.error('Error inserting blog post:', error);
        res.status(500).json({ error: 'Error creating blog post. Please try again.' });
    } finally {
        connection.release(); 
    }
});


app.get('/communitygroupmembers', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const sql = 'SELECT * FROM communitymembers';

        const [results] = await connection.query(sql);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching community group members:', error);
        res.status(500).json({ error: 'Error fetching community group members. Please try again.' });
    } finally {
        connection.release();
    }
});


app.get('/letsgoforracampcommunitygroupmembers', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const sql = 'SELECT * FROM letsgoforacampcommunity';

        const [results] = await connection.query(sql);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching community group members:', error);
        res.status(500).json({ error: 'Error fetching community group members. Please try again.' });
    } finally {
        connection.release();
    }
});


app.post('/perfectmoments', upload.single('image'), async (req, res) => {
    const connection = await pool.getConnection();

    try {
        let imagePath = '';

        if (req.file) {
            imagePath = `\\uploads\\${req.file.filename}`;
        }

        const [result] = await connection.query('INSERT INTO perfectmomments (image) VALUES (?)', [imagePath]);

        res.status(200).json({ message: 'Image uploaded successfully!', id: result.insertId });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image. Please try again.' });
    } finally {
        connection.release();
    }
});

app.get('/getperfectmoments', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const sql = 'SELECT * FROM  perfectmomments';
        const [results] = await connection.query(sql);
        res.status(200).json(results);

    } catch (error) {
        console.error('Error fetching Perfect moments:', error);
        res.status(500).json({ error: 'Error fetching perfect moments. Please try again.' });
    } finally {
        connection.release();
    }
});



app.delete('/perfectmoments/:id', async (req, res) => {
    const imageId = req.params.id;
    console.log('Deleting image with ID:', imageId);

    let connection = null;
    try {
        connection = await pool.getConnection();

        const sql = 'DELETE FROM perfectmomments WHERE id = ?';

        const [result] = await connection.execute(sql, [imageId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Error deleting image' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

app.get('/getblogs', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const sql = 'SELECT * FROM  blogs';
        const [results] = await connection.query(sql);
        res.status(200).json(results);

    } catch (error) {
        console.error('Error fetching Blogs:', error);
        res.status(500).json({ error: 'Error fetching Blogs. Please try again.' });
    } finally {
        connection.release();
    }
});

app.delete('/deleteblog/:id', async (req, res) => {
    const { id } = req.params;

    let connection;
    try {
        connection = await pool.getConnection();

        const query = 'DELETE FROM blogs WHERE id = ?';

        const [results] = await connection.query(query, [id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        res.status(200).json({ message: 'Blog post deleted successfully' });
    } catch (err) {
        console.error('Error deleting blog post:', err);
        return res.status(500).json({ message: 'Error deleting blog post' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

app.put('/updateblog/:id', upload.single('image'), async (req, res) => {
    const blogId = req.params.id; 
    const { title, slug, content, image } = req.body; 

    console.log(req.body); 

    try {
        const connection = await pool.getConnection();

        const [currentBlog] = await connection.query('SELECT * FROM blogs WHERE id = ?', [blogId]);
        
        if (!currentBlog) {
            return res.status(404).json({ error: 'Blog not found.' });
        }

        const updateQuery = `
            UPDATE blogs 
            SET title = ?, content = ?, image = ?, slug = ? 
            WHERE id = ?
        `;

        let imagePath;

        if (req.file) {
            imagePath = `\\uploads\\${req.file.filename}`; 
        } else {
            imagePath =image; 
        }

        await connection.query(updateQuery, [title, content, imagePath, slug, blogId]);

        connection.release();

        res.status(200).json({ message: 'Blog updated successfully!' });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ error: 'An error occurred while updating the blog.' });
    }
});

app.delete('/deletecoordinator/:cordinator_id', async (req, res) => {
    const cordinatorId = req.params.cordinator_id;
    
    let connection;
    try {
      connection = await pool.getConnection();
  
      const deleteQuery = 'DELETE FROM tripcoordinators WHERE cordinator_id = ?';
  
      const [result] = await connection.execute(deleteQuery, [cordinatorId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Coordinator not found' });
      }
  
      res.status(200).json({ message: 'Coordinator deleted successfully' });
      
    } catch (err) {
      console.error('Error deleting coordinator:', err);
      res.status(500).json({ message: 'Error deleting coordinator' });
      
    } finally {
      if (connection) {
        connection.release();
      }
    }
  });

 

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on https://admin.yeahtrips.in:${process.env.PORT}`);
});
