import mongoclient from "../../../../lib/mongodb";
import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import scenarioPlaceholderInjector from "../../../../lib/scenarioPlaceholderInjector";
import { scenarioTemplates } from "../../../../scenarioData";
import { colours } from "../../../../globals";

export const dynamic = "force-dynamic";


/**
 * 
 * @param {NextRequest} request 
 */
export async function POST(request, {params}) {
    const {gameId} = await params;

    const game = await mongoclient.db().collection("games").findOne({"gameId": gameId});

    if(!game) return new Response(JSON.stringify({error: "Game not found"}), {status: 400});

    if(game.rounds.length >= 7) return new Response(JSON.stringify({error: "This game has reached it's limit of 7 rounds."}));

    const lastRound = game.rounds[game.rounds.length-1];

    const players = [];

    for (const player of lastRound.players) {
        const usedColours = players.map(p => p.colour);
        const availableColours = colours.filter(c => !usedColours.includes(c));
        const randomColour = availableColours[Math.floor(Math.random() * availableColours.length)];
        players.push({model: player.model, colour: randomColour, instructions: player.instructions || null, impostor: false});
    }

    // Set the impostor
    players[Math.floor(Math.random()*players.length)].impostor = true;

    const roundId = uuid();

    const scenario = scenarioPlaceholderInjector(scenarioTemplates[Math.floor(Math.random()*scenarioTemplates.length)], players);

    const round = {
        roundId,
        scenario,
        players,
        messages: [],
        votes: [],
    };

    try {
        await mongoclient.db().collection("games").updateOne({"gameId": gameId}, {
            $push: {
                "rounds": round
            }
        });
    } catch(err) {
        console.log("Database error");
        return new Response(JSON.stringify({error: "An unexpected error has occoured."}), {status: 500});
    }

    return new Response(JSON.stringify({
        players: players.map(i => i.colour),
        scenario: {
            room: scenario.room,
            description: scenario.description,
        }
    }));
}