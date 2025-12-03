import clientPromise from "./src/app/lib/mongodb.js"; // adjust path if needed

const gamesSchema = {
    bsonType: "object",
    required: ["gameId", "rounds"],
    properties: {
        gameId: { bsonType: "string" },
        isLocked: { bsonType: "bool" },
        totalRounds: { bsonType: "number"},
        rounds: {
            bsonType: "array",
            items: {
                bsonType: "object",
                properties: {
                    roundId: { bsonType: "string" },
                    scenario: { 
                        bsonType: "object",
                        required: ["description", "evidence", "room", "victim", "impostor", "nearby", "alibis"],
                        properties: {
                            description: { bsonType: "string" },
                            evidence: { bsonType: "string" },
                            room: { bsonType: "string" },
                            victim: { bsonType: "string" },
                            impostor: { bsonType: "string" },
                            nearby: { 
                                bsonType: "array",
                                items: { bsonType: "string" }
                            },
                            alibis: {
                                bsonType: "object"
                            }
                        }
                    },
                    over: { bsonType: "bool" },
                    players: {
                        bsonType: ["array", "null"],
                        items: {
                            bsonType: "object",
                            required: ["model", "colour", "instructions", "impostor"],
                            properties: {
                                model: { bsonType: "string" },
                                colour: { bsonType: "string" },
                                instructions: {
                                    bsonType: ["array", "null"],
                                    items: { bsonType: "string" }
                                },
                                impostor: { bsonType: "bool" }
                            }
                        }
                    },
                    messages: {
                        bsonType: ["array", "null"],
                        items: {
                            bsonType: "object",
                            properties: {
                                author: { bsonType: "string" },
                                message: { bsonType: "string" }
                            }
                        }
                    },
                    votes: {
                        bsonType: ["array", "null"],
                        items: {
                            bsonType: "object",
                            properties: {
                                voter: { bsonType: "string" },
                                vote: { bsonType: "string" }
                            }
                        }
                    },
                    ejected: {
                        bsonType: ["object", "null"],
                        properties: {
                            ejected: { bsonType: "string" },
                            wasImpostor: {bsonType: "bool"}
                        }
                    },
                    scoresRoundEnd: {
                        bsonType: ["array", "null"],
                        items: {
                            bsonType: "object",
                            properties: {
                                player: { bsonType: "string" },
                                score: { bsonType: "number" }
                            }
                        }
                    }
                }
            }
        }
    }
};

async function setup() {
    const client = await clientPromise;
    const db = client.db();

    try {
        await db.createCollection("games", {
            validator: { $jsonSchema: gamesSchema },
            validationLevel: "strict",
            validationAction: "error"
        });
        console.log("✅ Collection 'games' created");
    } catch (e) {
        if (e.codeName === "NamespaceExists") {
            console.log("ℹ️ Collection already exists, updating validator instead...");
            await db.command({
                collMod: "games",
                validator: { $jsonSchema: gamesSchema }
            });
            console.log("✅ Schema validator updated on existing collection");
        } else {
            console.error("❌ Unexpected error creating collection:", e);
            process.exit(1);
        }
    }

    await db.collection("games").createIndex({ gameId: 1 }, { unique: true });
    console.log("✅ Index created on gameId (unique)");

    await db.collection("games").createIndex({ "rounds.roundId": 1 });
    console.log("✅ Index created on rounds.roundId");

    console.log("\n🎉 Database setup complete!");
    process.exit(0);
}

setup();
