import { colours, models } from "../../../globals";
import { scenarioTemplates } from "../../../scenarioData";
import mongoclient from "../../../lib/mongodb";
import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import scenarioPlaceholderInjector from "../../../lib/scenarioPlaceholderInjector";
import generateOpeningStatement from "../../../util/ai/generateOpeningStatement";

export const dynamic = "force-dynamic";

function isValidModelsArray(modelsArray) {
    if (!modelsArray) return false;
    if (modelsArray.length < 5) return false;
    if (modelsArray.length > 10) return false;
    return true;
}

/**
 * 
 * @param {NextRequest} request 
 */
export async function POST(request) {
    const req = await request.json();

    if (!isValidModelsArray(req.models)) {
        return new Response(JSON.stringify({error: "Invalid model data."}), {
            status: 400
        });
    }

    const players = [];

    for (const model of req.models) {
        if(!model.model || !models.find(m => m.api === model.model)) {
            console.log(`Invalid model: ${model.model}, valid models are: ${models.join(", ")}`);
            return new Response(JSON.stringify({error: "Invalid model data."}), {status: 400});
        }

        if(model.colour && colours.includes(model.colour)) {
            players.push({model: model.model, colour: model.colour, instructions: model.instructions || null, impostor: false});
        } else {
            const usedColours = players.map(p => p.colour);
            const availableColours = colours.filter(c => !usedColours.includes(c));
            const randomColour = availableColours[Math.floor(Math.random() * availableColours.length)];
            players.push({model: model.model, colour: randomColour, instructions: model.instructions || null, impostor: false});
        }
    }

    players[Math.floor(Math.random()*players.length)].impostor = true;

    // Connect to the AI SDK to get initial responses

    // Initlize the game
    const gameId = uuid();
    const roundId = uuid();

    const scenario = scenarioPlaceholderInjector(scenarioTemplates[Math.floor(Math.random()*scenarioTemplates.length)], players);
    const round = {
        roundId,
        scenario,
        players,
        messages: [],
        votes: [],
    };

    const game = {
        gameId,
        rounds: [round]
    };

    try {
        await mongoclient.db().collection("games").insertOne(game);
    } catch(err) {
        console.log(err);
        return new Response(JSON.stringify({
            error: "Database error",
            details: err.errInfo
        }), { status: 500 });
    }


    return new Response(JSON.stringify({
        gameId,
        players: players.map(i => i.colour),
        // statements: openingStatements,
        scenario: {
            room: scenario.room,
            description: scenario.description,
        }
    }));
}