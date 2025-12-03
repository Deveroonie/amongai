import mongoclient from "../../../../lib/mongodb";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";


/**
 * 
 * @param {NextRequest} request 
 */
export async function GET(request, {params}) {
    const {gameId} = await params;
    
    const game = await mongoclient.db().collection("games").findOne({"gameId": gameId});

    if(!game) return new Response(JSON.stringify({error: "Game not found"}), {status: 400});

    const rounds = [];

    for (const round of game.rounds) {
        const roundObj = {};

        roundObj.scenario = {
            description: round.scenario.description,
            evidence: round.scenario.evidence,
            room: round.scenario.room
        };

        roundObj.players = round.players.map(i => (
            {colour: i.colour, model: i.model}
        ));

        roundObj.messages = round.messages;
        roundObj.votes = round.votes;
        roundObj.scores = round.scoresRoundEnd;
        roundObj.ejected = round.ejected;
        roundObj.over = round.over;

        rounds.push(roundObj);
    }

    const response = {rounds};
    
    // Accumulate scores across all rounds by model
    const cumulativeScores = {};
    for (const round of rounds) {
        if (round.scores) {
            for (const s of round.scores) {
                const key = s.model || s.player; // Use model as key for accumulation
                if (!cumulativeScores[key]) {
                    cumulativeScores[key] = { player: s.player, model: s.model || s.player, score: 0 };
                }
                cumulativeScores[key].score += s.score;
                // Update player (colour) to the most recent one for display
                cumulativeScores[key].player = s.player;
            }
        }
    }
    response.score = Object.values(cumulativeScores);


    return new Response(JSON.stringify(response));
}