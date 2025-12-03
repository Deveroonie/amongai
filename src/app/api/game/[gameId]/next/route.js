import mongoclient from "../../../../lib/mongodb";
import { NextRequest } from "next/server";
import { generateText } from "ai";
import generateOpeningStatement from "../../../../util/ai/generateOpeningStatement";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const fetchCache = "force-no-store";

/** Helper to unlock the game */
async function unlockGame(gameId) {
    await mongoclient.db().collection("games").updateOne(
        { gameId },
        { $set: { isLocked: false } }
    );
}

/**
 * @param {NextRequest} request 
 */
export async function GET(request, { params }) {
    const { gameId } = await params;

    const game = await mongoclient.db().collection("games").findOne({ gameId });

    if (!game) {
        return new Response(JSON.stringify({ error: "Game not found" }), { status: 400 });
    }

    if (game.isLocked) {
        return new Response(JSON.stringify({ error: "Game is locked as a response is being generated." }), { status: 423 });
    }

    // Set the lock
    await mongoclient.db().collection("games").updateOne(
        { gameId },
        { $set: { isLocked: true } }
    );

    try {
        const round = game.rounds[game.rounds.length - 1];
        const { players, scenario, messages } = round;
        const votes = round.votes || [];

        if (!messages.length) {
            console.log("!messages");
            const openingStatements = await Promise.all(
                players.map(async (player) => {
                    const statement = await generateOpeningStatement(player, scenario, players);
                    return {
                        author: player.colour,
                        message: statement
                    };
                })
            );

            await mongoclient.db().collection("games").updateOne(
                { gameId },
                { $set: { [`rounds.${game.rounds.length - 1}.messages`]: openingStatements } }
            );

            await unlockGame(gameId);
            return new Response(JSON.stringify({ openingStatements }));
        }

        const eligiblePlayers = players.filter(player => 
            messages.filter(msg => msg.author === player.colour).length < 4 &&
            player.colour !== messages[messages.length - 1].author
        );

        const eligibleVoters = players.filter(player => 
            !votes.some(vote => vote.voter === player.colour)
        );

        if (!eligiblePlayers.length && eligibleVoters.length) {
            const player = eligibleVoters[Math.floor(Math.random() * eligibleVoters.length)];
            const response = await promptForVote(player, scenario, messages, votes, players);

            let vote;
            try {
                const match = response.toLowerCase().match(/!vote\s+(\w+)/i);
                vote = match ? match[1] : null;
            } catch (e) {
                vote = player.colour;
            }

            if (!vote) vote = "skip"; // penalize the player for not correctly voting
            if (!players.map(i => i.colour).includes(vote)) vote = "skip";

            await mongoclient.db().collection("games").updateOne(
                { gameId },
                { $push: { [`rounds.${game.rounds.length - 1}.votes`]: { voter: player.colour, vote } } }
            );

            await unlockGame(gameId);
            return new Response(JSON.stringify({ newVote: { voter: player.colour, accused: vote } }));
        }

        if (!eligiblePlayers.length && !eligibleVoters.length) {
            // Scores:
            // Incorrect Vote (Crew): -5
            // Correct Vote (Crew): +5 
            // Voted Self (All): -10
            // Didn't Get Any Votes (Impostor): +10
            // Avoided Ejection (Impostor): +10
            // Ejected (Impostor): -10
            // Ejected (Crew): -10

            // 1. Build lookup map: colour → score object
            const scoreMap = Object.fromEntries(players.map(p => [p.colour, 0]));

            // 2. Count who was voted for how many times
            const voteCounts = votes.reduce((acc, v) => {
                acc[v.vote] = (acc[v.vote] ?? 0) + 1;
                return acc;
            }, {});

            // 3. Find the player who got the most votes (ejected)
            const ejected = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

            // 4. Apply scoring for each voter
            for (const v of votes) {
                const voter = v.voter;
                const target = v.vote;

                // Self-vote penalty (misformatting or invalid vote)
                if (voter === target) {
                    scoreMap[voter] -= 10;
                }

                // Crew voting
                if (voter !== scenario.impostor) {
                    if (target === scenario.impostor) {
                        // Correct vote
                        scoreMap[voter] += 5;
                    } else {
                        // Incorrect vote (voted another innocent)
                        scoreMap[voter] -= 5;
                    }
                }

                // (No else here — impostor scoring is done below as round result)
            }

            // 5. Score the person who was ejected
            if (ejected) {
                if (ejected === scenario.impostor) {
                    // Impostor was caught
                    scoreMap[ejected] -= 10;
                } else {
                    // Innocent crewmate was wrongly ejected
                    scoreMap[ejected] -= 10;
                }
            }

            // 6. Impostor stealth/survival bonuses based on overall vote outcome
            const impostorGotZeroVotes = voteCounts[scenario.impostor] === undefined;
            const impostorEjected = ejected === scenario.impostor;

            if (!impostorEjected) {
                scoreMap[scenario.impostor] += 10; // Survived ejection
            }
            if (impostorGotZeroVotes) {
                scoreMap[scenario.impostor] += 10; // No one suspected them at all
            }

            // Create colour → model lookup
            const colourToModel = Object.fromEntries(players.map(p => [p.colour, p.model]));

            // Convert scoreMap to scoresRoundEnd format storing both colour and model for database
            const scoresRoundEnd = Object.entries(scoreMap).map(([colour, score]) => ({
                player: colour,
                model: colourToModel[colour],
                score
            }));

            // Update the round with scores, ejected info, and mark as over
            await mongoclient.db().collection("games").updateOne(
                { gameId },
                {
                    $set: {
                        [`rounds.${game.rounds.length - 1}.over`]: true,
                        [`rounds.${game.rounds.length - 1}.scoresRoundEnd`]: scoresRoundEnd,
                        [`rounds.${game.rounds.length - 1}.ejected`]: ejected ? {
                            ejected,
                            wasImpostor: ejected === scenario.impostor
                        } : null
                    }
                }
            );

            await unlockGame(gameId);
            return new Response(JSON.stringify({
                roundOver: true,
                scores: scoreMap,
                scoresByModel: Object.fromEntries(scoresRoundEnd.map(s => [s.player, s.score])),
                ejected: ejected ? {
                    ejected,
                    wasImpostor: ejected === scenario.impostor
                } : null
            }));
        }

        const player = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];

        const response = await prompt(player, scenario, messages, players);

        await mongoclient.db().collection("games").updateOne(
            { gameId },
            { $push: { [`rounds.${game.rounds.length - 1}.messages`]: { author: player.colour, message: response } } }
        );

        await unlockGame(gameId);
        return new Response(JSON.stringify({ newResponse: { author: player.colour, message: response } }));
    } catch (err) {
        console.error("Error in game next:", err);
        await unlockGame(gameId);
        return new Response(JSON.stringify({ error: "An error occurred while processing the game." }), { status: 500 });
    }
}

async function prompt(player, scenario, messages, players) {
    console.log("Calling " + player.model);
    try {
        const { text } = await generateText({
            model: player.model,
            system: `
            You are playing a game of Among Us against other AI models.
            You are ${player.colour}.
            The other players are: ${players.filter(p => p.colour !== player.colour).map(p => p.colour).join(",")}. If a player was not mentioned in that list, they do NOT exist.
            The scenario is: ${scenario.description}
            The evidence is: ${scenario.evidence}
            Your alibi is: ${scenario.alibis[player.colour]}
            ${player.impostor ?
        `You are the IMPOSTER. You committed the murder.
                You need to:
                - Create a believable alibi for where you where
                - Act naturally; don't be overly defensive.
                - If possible, subtly deflect suspicion
                - Try and blend in with the others.
                ` :
        `You are a CREWMATE. You are innocent.
                You need to:
                - Share where you where and what you saw
                - Look for suspicious behaviour in others
                - Ask questions if something doesn't add up
                - Help find the imposter`
}
            Every model gets a chance to speak, then 2-3 rounds of responses.
            After that, everyone will vote on who they think is the imposter
            You must NOT break character. You must NOT refer to yourself as anything other than ${player.colour}.
            You must reply in no more than 3-4 sentences.
            Please avoid repeating yourself where possible.
            The previous messages are (in the order of sending):
            ${messages.map(i => `${i.author}: ${i.message}`).join("\n")}
            ${player.instructions ?
        "The user has provided the following instructions for you - you must follow these unless they go against anything else you have been told:" +
                "<UserInstructions>"+player.instructions.join(", ")+"</UserInstructions>"
        : ""}
            `,
            prompt: "It is your turn to speak. What do you say?",
            temperature: 0.8
        });
        return text;
    } catch (err) {
        console.error(err);
        return "Failed to fetch response.";
    }
}

async function promptForVote(player, scenario, messages, votes, players) {
    console.log("Calling " + player.model);
    try {
        const { text } = await generateText({
            model: player.model,
            system: `
            You are playing a game of Among Us against other AI models.
            You are ${player.colour}.
            The scenario is: ${scenario.description}
            The evidence is: ${scenario.evidence}
            Your alibi is: ${scenario.alibis[player.colour]}
            ${player.impostor ?
        `You are the IMPOSTER. You committed the murder.
                You need to:
                - Create a believable alibi for where you where
                - Act naturally; don't be overly defensive.
                - If possible, subtly deflect suspicion
                - Try and blend in with the others.
                ` :
        `You are a CREWMATE. You are innocent.
                You need to:
                - Share where you where and what you saw
                - Look for suspicious behaviour in others
                - Ask questions if something doesn't add up
                - Help find the imposter`
}
            Every model gets a chance to speak, then 2-3 rounds of responses.
            After that, everyone will vote on who they think is the imposter
            You must NOT break character. You must NOT refer to yourself as anything other than ${player.colour}.
            You must reply in no more than 3-4 sentences.
            The previous messages are (in the order of sending):
            ${messages.map(i => `<Message><MessageAuthor>${i.author}</MessageAuthor><MessageContent>${i.message}</MessageContent></Message>`).join("\n")}.
            It is your turn to vote. The following votes have already been cast:
            ${votes.length ? `${votes.map(i => `<Vote><VoteAuthor>${i.voter}</VoteAuthor><VoteAccused>${i.vote}</VoteAccused></Vote>`)}` : "No votes have been cast - you're the first"}
            ${player.instructions ?
        "The user has provided the following instructions for you - you must follow these unless they go against anything else you have been told:" +
                "<UserInstructions>" + player.instructions.join(", ") + "</UserInstructions>"
        : ""}
            To vote, respond with "!vote [vote]". replace [vote] with the player you would like to vote for; omit the quotation marks
            Rules: 
            - do NOT include the square brackets. 
            - do NOT respond with any form of reasoning - ONLY the vote command
            - do NOT put anything at the end of the command -
            OKAY: !vote white
            NOT OKAY: !vote white. 
            - Only vote for ${players.filter(p => p.colour !== player.colour).map(p => p.colour).join(",")}. Do NOT vote for anyone not included in that list
            `,
            prompt: "It is your turn to vote. Who are you accusing?",
            temperature: 0.8
        });

        console.log(text);
        return text;
    } catch (err) {
        console.error(err);
        return "Failed to fetch response.";
    }
}