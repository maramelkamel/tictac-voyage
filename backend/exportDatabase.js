require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const tables = [
  "transport_requests",
  "transports",
  "promotions",
  "custom_trips",
  "contact_messages",
  "omra_packages",
  "favorites",
  "omra_reservations",
  "clients",
  "voyages_organises",
  "voyage_reservations",
  "circuit_reservations",
  "admins",
  "circuits",
  "reservations",
  "airports",
  "flights",
  "hotels",
  "flight_reservations",
  "settings",
  "hotel_reservations",
  "hotels_catalog"
];

async function exportTXT() {
  await client.connect();

  let output = "TIC TAC VOYAGES - DATABASE EXPORT\n\n";

  for (const table of tables) {
    const result = await client.query(`SELECT * FROM ${table}`);

    output += `\n==================== ${table.toUpperCase()} ====================\n`;
    output += JSON.stringify(result.rows, null, 2);
    output += "\n";
  }

  fs.writeFileSync("tictac-database.txt", output);

  console.log("TXT Export done ✅");
  await client.end();
}

exportTXT();