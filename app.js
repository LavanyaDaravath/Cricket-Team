const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let database = null;
const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB is Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// return a list of all the players from the team
// API 1

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get Players API1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDBObjectToResponseObject(eachPlayer)
    )
  );
});

//POST player API2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_team(player_name, jersey_number, role)
    VALUES ('${playerName}', ${jerseyNumber}, '${role}');`;
  const playerDBResponse = await database.run(addPlayerQuery);
  response.send(`Player Added to Team`);
});

//GET player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};
    `;
  const player = await database.get(getPlayerQuery);
  response.send(convertDBObjectToResponseObject(player));
});

//PUT player API4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const updatePlayerQuery = `
    UPDATE cricket_team SET
        player_name = '${playerName}', 
        jersey_number = ${jerseyNumber}, 
        role = '${role}'
        WHERE player_id = ${playerId};
    `;
  await database.run(updatePlayerQuery);
  response.send(`Player Details Updated`);
});

//DELETE Player API5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team WHERE player_id = ${playerId};
    `;
  await database.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
