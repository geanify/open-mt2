DROP TABLE IF EXISTS account_status;

CREATE TABLE account_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientStatus TEXT NOT NULL,
    allowLogin BOOLEAN NOT NULL,
    description TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS account;

CREATE TABLE account (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    lastLogin DATETIME NULL,
    deleteCode TEXT NOT NULL,
    accountStatusId INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (accountStatusId) REFERENCES account_status(id) ON DELETE CASCADE
);

INSERT INTO account_status (allowLogin, clientStatus, description)
VALUES (TRUE, 'OK', 'Default Status');

INSERT INTO account (deleteCode, email, lastLogin, password, accountStatusId, username)
VALUES ('1234567', 'admin@test.com', NULL, '$2b$05$KXeREc2TNuUR6IcgzUiX4.WA/0i3Yd3WpUHMtAcQi1ojWRdeQ9ExS', 1, 'admin');

INSERT INTO account (deleteCode, email, lastLogin, password, accountStatusId, username)
VALUES ('1234567', 'admin1@test.com', NULL, '$2b$05$KXeREc2TNuUR6IcgzUiX4.WA/0i3Yd3WpUHMtAcQi1ojWRdeQ9ExS', 1, 'admin1');

DROP TABLE IF EXISTS player;

CREATE TABLE player (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    accountId INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    empire INTEGER NOT NULL,
    playerClass INTEGER NOT NULL,
    skillGroup INTEGER NOT NULL,
    playTime INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    experience INTEGER NOT NULL DEFAULT 0,
    gold INTEGER NOT NULL DEFAULT 0,
    st INTEGER NOT NULL DEFAULT 0,
    ht INTEGER NOT NULL DEFAULT 0,
    dx INTEGER NOT NULL DEFAULT 0,
    iq INTEGER NOT NULL DEFAULT 0,
    positionX INTEGER NOT NULL,
    positionY INTEGER NOT NULL,
    health INTEGER NOT NULL,
    mana INTEGER NOT NULL,
    stamina INTEGER NOT NULL,
    bodyPart INTEGER NOT NULL DEFAULT 0,
    hairPart INTEGER NOT NULL DEFAULT 0,
    name TEXT NOT NULL,
    givenStatusPoints INTEGER NOT NULL DEFAULT 0,
    availableStatusPoints INTEGER NOT NULL DEFAULT 0,
    slot INTEGER NOT NULL DEFAULT 0
);

DROP TABLE IF EXISTS item;

CREATE TABLE item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerId INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    window INTEGER NOT NULL,
    position INTEGER NOT NULL,
    count INTEGER NOT NULL,
    protoId INTEGER NOT NULL DEFAULT 0,
    socket0 INTEGER DEFAULT 0,
    socket1 INTEGER DEFAULT 0,
    socket2 INTEGER DEFAULT 0,
    attributeType0 INTEGER DEFAULT 0,
    attributeValue0 INTEGER DEFAULT 0,
    attributeType1 INTEGER DEFAULT 0,
    attributeValue1 INTEGER DEFAULT 0,
    attributeType2 INTEGER DEFAULT 0,
    attributeValue2 INTEGER DEFAULT 0,
    attributeType3 INTEGER DEFAULT 0,
    attributeValue3 INTEGER DEFAULT 0,
    attributeType4 INTEGER DEFAULT 0,
    attributeValue4 INTEGER DEFAULT 0,
    attributeType5 INTEGER DEFAULT 0,
    attributeValue5 INTEGER DEFAULT 0,
    attributeType6 INTEGER DEFAULT 0,
    attributeValue6 INTEGER DEFAULT 0,
    FOREIGN KEY (ownerId) REFERENCES player(id) ON DELETE CASCADE
); 