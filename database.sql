CREATE DATABASE IF NOT EXISTS events;

CREATE TABLE IF NOT EXISTS tours (
    id SERIAL PRIMARY KEY,
    name VARCHAR(254) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS events(
    id SERIAL PRIMARY KEY,
    name VARCHAR(254) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    tour_id SERIAL,
    FOREIGN KEY (tour_id) REFERENCES tours (id)
);

CREATE TABLE IF NOT EXISTS attendees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(254) NOT NULL,
    code VARCHAR(100) NOT NULL,
    professional_code INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    attendance BOOLEAN DEFAULT FALSE,
    event_id SERIAL,
    FOREIGN KEY (event_id) REFERENCES events (id)
);