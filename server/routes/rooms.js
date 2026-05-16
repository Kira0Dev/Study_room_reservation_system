const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // 1. READ ALL 
    router.get('/', (req, res) => {
        db.query('SELECT * FROM Rooms', (err, results) => {
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