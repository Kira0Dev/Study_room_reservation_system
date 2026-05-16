CREATE TABLE Users(
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user'
)

CREATE TABLE Rooms(
    RoomID INT PRIMARY KEY AUTO_INCREMENT,
    RoomName VARCHAR(100) NOT NULL UNIQUE,
    Capacity INT NOT NULL,
    Sttatus VARCHAR(20) NOT NULL DEFAULT 'available'
)

CREATE TABLE Features(
    FeatureID INT PRIMARY KEY AUTO_INCREMENT,
    FeatureName VARCHAR(100) NOT NULL UNIQUE
)

CREATE TABLE Rooms_Features(
    RoomID INT,
    FeatureID INT,
    PRIMARY KEY (RoomID, FeatureID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID) ON DELETE CASCADE,
    FOREIGN KEY (FeatureID) REFERENCES Features(FeatureID) ON DELETE CASCADE
)

CREATE TABLE Reservations(
    ReservationID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    RoomID INT,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'pending',
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID) ON DELETE CASCADE
)

INSERT INTO Users (Username, Email, PasswordHash, role) VALUES
('Alejandro Peralta', 'aleper@gmail.com', 'AleRules123', 'admin'),
('Maria Gomez', 'mariagomez@gmail.com', 'MariaPass456', 'user')

INSERT INTO Rooms (RoomName, Capacity, Sttatus) VALUES
('Study Room Tokyo', 10, 'available'),
('Study Room Munich', 5, 'available')

INSERT INTO Features (FeatureName) VALUES
('Whiteboard'),
('Projector'),
('Video Conferencing')

INSERT INTO Rooms_Features (RoomID, FeatureID) VALUES
(1, 1), -- Study Room Tokyo has Whiteboard
(1, 2), -- Study Room Tokyo has Projector
(2, 1), -- Study Room Munich has Whiteboard
(2, 3)  -- Study Room Munich has Video Conferencing

INSERT INTO Reservations (UserID, RoomID, StartTime, EndTime, Status) VALUES
(1, 1, '2024-07-01 10:00:00', '2024-07-01 12:00:00', 'in progress'),
(2, 2, '2024-07-02 14:00:00', '2024-07-02 16:00:00', 'pending')