const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // 1. READ ALL AND FILTERS
    router.get('/', (req, res) => {
        console.log(">>> Query received:");
        console.log("startTime:", req.query.startTime);
        console.log("endTime:", req.query.endTime);

        

        const { search, capacity, features, startTime, endTime } = req.query;

        // First select all rooms with a default status of 'Available'
        let selectClause = "SELECT *, 'Nop' AS DynamicStatus FROM Rooms WHERE 1=1";
        let params = [];

        // Calculate room availability based on time filters
        if (endTime && startTime) {
            selectClause = `
                SELECT *,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM Reservations res
                        WHERE res.RoomID = Rooms.RoomID
                        AND res.StartTime <= ?
                        AND res.EndTime >= ?
                    ) THEN 'Reserved'
                    ELSE 'Available'
                END AS DynamicStatus
                FROM Rooms
                WHERE 1=1
            `;
            params.push(endTime, startTime);
        }

        // We save this base query in a variable to keep adding filters dynamically
        let sql = selectClause;

        // Filter by name (search)
        if (search) {
            sql += ' AND RoomName LIKE ?';
            params.push(`%${search}%`);
        }

        // Filter by capacity
        if (capacity) {
            sql += ' AND Capacity >= ?';
            params.push(Number(capacity));
        }

        // Filter by features
        if (features) {
            const featureList = features.split(',').map(Number);
            if (featureList.length > 0) {
                const placeholders = featureList.map(() => '?').join(',');
                sql += ` AND RoomID IN (
                    SELECT RoomID
                    FROM Rooms_Features
                    WHERE FeatureID IN (${placeholders})
                    GROUP BY RoomID
                    HAVING COUNT(DISTINCT FeatureID) = ?
                )`;
                params.push(...featureList, featureList.length);
            }
        }

        db.query(sql, params, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    });

    // 2. CREATE 
    router.post('/', (req, res) => {
        const { RoomName, Capacity, Status } = req.body;
        
        const sql = 'INSERT INTO Rooms (RoomName, Capacity, Status) VALUES (?, ?, ?)';
        db.query(sql, [RoomName, Capacity, Status || 'available'], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Room created successfully', roomId: result.insertId });
        });
    });

    // 3. UPDATE
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { RoomName, Capacity, Status } = req.body;

        const sql = 'UPDATE Rooms SET RoomName = ?, Capacity = ?, Status = ? WHERE id = ?';
        db.query(sql, [RoomName, Capacity, Status, id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Room not found' });
            res.json({ message: 'Room updated successfully' });
        });
    });

    // 4. DELETE
    router.delete('/:id', (req, res) => {
        const { id } = req.params;

        const sql = 'DELETE FROM Rooms WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Room not found' });
            res.json({ message: 'Room deleted successfully' });
        });
    });

    return router;
};