import { colours } from "../globals";
import { rooms, roomMap } from "../scenarioData";

/**
 * @typedef {Object} Player
 * @property {string} colour - The player's color
 * @property {string} model - The AI model identifier
 * @property {boolean} impostor - Whether this player is the impostor
 * @property {string[]} [instructions] - Optional custom instructions
 */

/**
 * @typedef {Object} ScenarioTemplate
 * @property {string} description - Description with placeholders
 * @property {string} evidence - Evidence found at the scene
 * @property {Object} alibis - Alibi templates for different roles
 * @property {string} [alibis.impostor] - Impostor's alibi template
 * @property {string} [alibis.nearby] - Nearby player's alibi template
 * @property {string} [alibis.far] - Far player's alibi template
 * @property {string} [alibis.finder] - Finder's alibi template
 * @property {string} [alibis.all] - Alibi for everyone (lights off scenarios)
 * @property {string} [alibis.grouped] - Alibi for grouped players
 */

/**
 * @typedef {Object} GeneratedScenario
 * @property {string} description - Filled description
 * @property {string} evidence - Evidence at the scene
 * @property {string} room - Room where murder occurred
 * @property {string} victim - Color of victim
 * @property {string} impostor - Color of impostor
 * @property {string[]} nearby - Colors of nearby players
 * @property {Object.<string, string>} alibis - Alibis mapped by color
 */

/**
 * Injects placeholders into scenario template and generates alibis
 * @param {ScenarioTemplate} template - The scenario template
 * @param {Player[]} players - Array of players in the game
 * @returns {GeneratedScenario} The generated scenario with alibis
 */
export default function scenarioPlaceholderInjector(template, players) {
    const impostor = players.find(p => p.impostor);
    const crewmates = players.filter(p => !p.impostor);
    
    const allocatedColours = players.map(p => p.colour);
    const unallocatedColours = colours.filter(c => !allocatedColours.includes(c));
    
    // Pick victim (unused color)
    const victim = unallocatedColours[Math.floor(Math.random() * unallocatedColours.length)];
    
    // Pick murder room
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    // Replace description placeholders
    let description = template.description;
    description = description.replaceAll("%%__VICTIM__%%", victim);
    description = description.replaceAll("%%__ROOM__%%", room);
    description = description.replaceAll("%%__IMPOSTOR__%%", impostor.colour);
    
    // Replace each %%__PLAYER__%% with a different random crewmate
    const usedCrewmates = [];
    while (description.includes("%%__PLAYER__%%")) {
        const availableCrewmates = crewmates.filter(c => !usedCrewmates.includes(c.colour));
        if (availableCrewmates.length === 0) break; // Ran out of unique crewmates
        
        const randomCrewmate = availableCrewmates[Math.floor(Math.random() * availableCrewmates.length)];
        description = description.replace("%%__PLAYER__%%", randomCrewmate.colour);
        usedCrewmates.push(randomCrewmate.colour);
    }
    
    // Determine who was mentioned as "nearby" in the description
    const nearbyPlayers = players.filter(p => 
        description.includes(p.colour) && p.colour !== victim
    );
    const farPlayers = players.filter(p => !nearbyPlayers.includes(p));
    
    // Generate alibis for each player
    const alibis = {};
    
    for (const player of players) {
        let alibiTemplate;
        
        // Special case: if template has "all" alibi (like lights off scenario)
        if (template.alibis.all) {
            alibiTemplate = template.alibis.all;
        }
        // Special case: if template has "grouped" alibi
        else if (template.alibis.grouped && nearbyPlayers.includes(player) && !player.impostor) {
            alibiTemplate = template.alibis.grouped;
        }
        // Impostor alibi
        else if (player.impostor) {
            alibiTemplate = template.alibis.impostor;
        }
        // Finder alibi (if template specifies)
        else if (template.alibis.finder && nearbyPlayers.includes(player) && nearbyPlayers.indexOf(player) === 0) {
            alibiTemplate = template.alibis.finder;
        }
        // Nearby player alibi
        else if (nearbyPlayers.includes(player)) {
            alibiTemplate = template.alibis.nearby || template.alibis.all;
        }
        // Far player alibi
        else {
            alibiTemplate = template.alibis.far;
        }
        
        // Fill alibi template placeholders
        let alibi = alibiTemplate;
        alibi = alibi.replaceAll("%%__VICTIM__%%", victim);
        alibi = alibi.replaceAll("%%__ROOM__%%", room);
        
        // Replace %%__FAR_ROOM__%% with a room far from murder scene
        if (alibi.includes("%%__FAR_ROOM__%%")) {
            const farRoom = roomMap[room]?.far?.[Math.floor(Math.random() * roomMap[room].far.length)] || "Admin";
            alibi = alibi.replaceAll("%%__FAR_ROOM__%%", farRoom);
        }
        
        // Replace %%__NEARBY_ROOM__%% with a room near murder scene
        if (alibi.includes("%%__NEARBY_ROOM__%%")) {
            const nearbyRoom = roomMap[room]?.near?.[Math.floor(Math.random() * roomMap[room].near.length)] || "Storage";
            alibi = alibi.replaceAll("%%__NEARBY_ROOM__%%", nearbyRoom);
        }
        
        // Replace %%__WITNESS__%% with another far player
        if (alibi.includes("%%__WITNESS__%%")) {
            const otherFarPlayers = farPlayers.filter(p => p !== player);
            const witness = otherFarPlayers.length > 0 
                ? otherFarPlayers[Math.floor(Math.random() * otherFarPlayers.length)].colour 
                : "no one";
            alibi = alibi.replaceAll("%%__WITNESS__%%", witness);
        }
        
        // Replace any remaining %%__PLAYER__%% in alibis with random players
        while (alibi.includes("%%__PLAYER__%%")) {
            const otherPlayers = players.filter(p => p !== player);
            const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
            alibi = alibi.replace("%%__PLAYER__%%", randomPlayer.colour);
        }
        
        alibis[player.colour] = alibi;
    }
    
    return {
        description,
        evidence: template.evidence,
        room,
        victim,
        impostor: impostor.colour,
        nearby: nearbyPlayers.map(p => p.colour),
        alibis
    };
}