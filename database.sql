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
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ,
    attendance BOOLEAN DEFAULT FALSE,
    confirmation_status VARCHAR(255) NOT NULL,
    event_id SERIAL,
    FOREIGN KEY (event_id) REFERENCES events (id)
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    serial_code VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    stored BOOLEAN DEFAULT true,
    description VARCHAR(1024) NOT NULL,
    working BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ
);