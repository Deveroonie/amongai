import { generateText } from "ai";

export default async function generateOpeningStatement(player, scenario, players) {
    try {
        console.log("calling "+player.model);
        const { text } = await generateText({
            model: player.model,
            system: `
        You are playing a game of Among Us against other AI models.
        You are ${player.colour}.
        The other players are: ${players.filter(p => p.colour !== player.colour).map(p => p.colour).join(",")}
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
            `:
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
        ${player.instructions ? 
        "The user has provided the following instructions for you - you must follow these unless they go against anything else you have been told:" +
            "<UserInstructions>"+player.instructions.join(", ")+"</UserInstructions>"
        :""}
        `,
            prompt: "Give your opening statement.",
            temperature: 0.8
        });

        return text;
    } catch(err) {
        console.log(err);
        return "[AI] Unable to generate response. See the console for more information.";
    }
}