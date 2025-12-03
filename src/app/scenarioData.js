const roomMap = {
    "cafeteria": {
        "near": ["weapons", "upper engine", "medbay", "admin"],
        "far": ["navigation", "shields", "communications", "storage", "electrical", "lower engine", "reactor"]
    },
    "weapons": {
        "near": ["cafeteria", "o2", "navigation"],
        "far": ["admin", "shields", "storage", "communications", "electrical", "lower engine", "upper engine", "reactor", "security", "medbay"]
    },
    "o2": {
        "near": ["weapons", "navigation", "shields", "admin"],
        "far": ["cafeteria", "storage", "communications", "electrical", "lower engine", "upper engine", "reactor", "security", "medbay"]
    },
    "navigation": {
        "near": ["weapons", "o2", "shields"],
        "far": ["cafeteria", "admin", "storage", "communications", "electrical", "lower engine", "upper engine", "reactor", "security", "medbay"]
    },
    "shields": {
        "near": ["navigation", "o2", "admin", "storage", "communications"],
        "far": ["cafeteria", "weapons", "electrical", "lower engine", "upper engine", "reactor", "security", "medbay"]
    },
    "communications": {
        "near": ["shields", "storage"],
        "far": ["cafeteria", "weapons", "o2", "navigation", "admin", "electrical", "lower engine", "upper engine", "reactor", "security", "medbay"]
    },
    "storage": {
        "near": ["cafeteria", "admin", "shields", "communications", "electrical"],
        "far": ["weapons", "o2", "navigation", "lower engine", "upper engine", "reactor", "security", "medbay"]
    },
    "admin": {
        "near": ["cafeteria", "storage", "o2"],
        "far": ["weapons", "navigation", "shields", "communications", "electrical", "lower engine", "upper engine", "reactor", "security", "medbay"]
    },
    "electrical": {
        "near": ["storage", "lower engine", "security"],
        "far": ["cafeteria", "weapons", "o2", "navigation", "shields", "communications", "admin", "upper engine", "reactor", "medbay"]
    },
    "lower engine": {
        "near": ["electrical", "reactor", "security"],
        "far": ["cafeteria", "weapons", "o2", "navigation", "shields", "communications", "storage", "admin", "upper engine", "medbay"]
    },
    "security": {
        "near": ["electrical", "lower engine", "reactor", "upper engine"],
        "far": ["cafeteria", "weapons", "o2", "navigation", "shields", "communications", "storage", "admin", "medbay"]
    },
    "reactor": {
        "near": ["upper engine", "lower engine", "security"],
        "far": ["cafeteria", "weapons", "o2", "navigation", "shields", "communications", "storage", "admin", "electrical", "medbay"]
    },
    "upper engine": {
        "near": ["reactor", "cafeteria", "medbay", "security"],
        "far": ["weapons", "o2", "navigation", "shields", "communications", "storage", "admin", "electrical", "lower engine"]
    },
    "medbay": {
        "near": ["cafeteria", "upper engine"],
        "far": ["weapons", "o2", "navigation", "shields", "communications", "storage", "admin", "electrical", "lower engine", "reactor", "security"]
    }
};

const scenarioTemplates = [
    {
        description: "%%__VICTIM__%% was found dead in Electrical. %%__PLAYER__%%, %%__IMPOSTOR__%%, and %%__PLAYER__%% were seen nearby.",
        evidence: "The vent was open and lights were flickering.",
        alibis: {
            impostor: "You were doing the download task in Electrical when you 'discovered' the body.",
            nearby: "You were in Storage and heard a noise, so you came to check.",
            far: "You were calibrating the distributor in Upper Engine (far from the scene)."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Medbay. %%__PLAYER__%% and %%__IMPOSTOR__%% were seen exiting the room.",
        evidence: "The medscan was interrupted mid-scan.",
        alibis: {
            impostor: "You were waiting to use the medscan after %%__VICTIM__%% and found them dead.",
            nearby: "You were in Cafeteria and saw people going in and out of Medbay.",
            far: "You were fixing wiring in Navigation (far from the scene)."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Admin. The lights were off at the time.",
        evidence: "Lights were sabotaged right before the kill.",
        alibis: {
            impostor: "You sabotaged the lights, killed %%__VICTIM__%% in the darkness, then vented away.",
            all: "You were nearby when the lights went out. You couldn't see anything."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Reactor. %%__PLAYER__%%, %%__PLAYER__%%, %%__IMPOSTOR__%%, and %%__PLAYER__%% all responded to a reactor meltdown.",
        evidence: "Reactor was sabotaged and everyone rushed to fix it.",
        alibis: {
            impostor: "You sabotaged reactor to create chaos, killed during the confusion, then helped fix reactor.",
            nearby: "You rushed to Reactor to fix the meltdown and found the body after.",
            far: "You were too far away and didn't make it to Reactor in time."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Security. %%__PLAYER__%% discovered the body when coming in to fix the cameras.",
        evidence: "Security cameras were disabled. No footage available.",
        alibis: {
            impostor: "You were doing tasks in Weapons (you killed earlier and someone else found it).",
            finder: "You came to Security to check cameras and discovered the body.",
            nearby: "You were in Electrical and heard someone scream.",
            far: "You were emptying garbage in Storage (far from the scene)."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Storage. %%__IMPOSTOR__%%, %%__PLAYER__%%, and %%__PLAYER__%% were all in the area.",
        evidence: "A blood trail leads toward Communications.",
        alibis: {
            impostor: "You were organizing supplies in Storage and 'just noticed' the body.",
            nearby: "You were passing through Storage on your way to Communications.",
            far: "You were in O2 tree room doing the oxygen filter task."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Navigation. %%__PLAYER__%% and %%__IMPOSTOR__%% were doing tasks there.",
        evidence: "The navigation console was damaged in the struggle.",
        alibis: {
            impostor: "You were charting the course when %%__VICTIM__%% walked in. You 'tried to help' but it was too late.",
            nearby: "You were in Weapons clearing asteroids and heard something.",
            far: "You were with %%__WITNESS__%% in Admin the whole time swiping cards."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Cafeteria. Everyone was scattered after an O2 emergency.",
        evidence: "O2 was sabotaged at the same time as the kill.",
        alibis: {
            impostor: "You were 'fixing' O2 in the hallway when the body was discovered.",
            all: "You were running between O2 locations trying to fix the sabotage."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Shields. %%__IMPOSTOR__%%, %%__PLAYER__%%, and %%__PLAYER__%% were all nearby.",
        evidence: "Shields were primed and ready to fire.",
        alibis: {
            impostor: "You were doing the shields task when you saw %%__VICTIM__%% collapse.",
            nearby: "You were in the corridor between Shields and Navigation.",
            far: "You were starting reactor in Upper Engine (far from the scene)."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Weapons. %%__PLAYER__%% was shooting asteroids at the time.",
        evidence: "The asteroid gun was still warm from recent use.",
        alibis: {
            impostor: "You finished shooting asteroids and left. You 'had no idea' %%__VICTIM__%% came in after.",
            finder: "You came to do the asteroid task and found %%__VICTIM__%% dead.",
            nearby: "You were in Cafeteria and saw people going to and from Weapons.",
            far: "You were all the way in Lower Engine doing fuel."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Communications. The body was discovered much later.",
        evidence: "Time of death unknown. Body was cold.",
        alibis: {
            impostor: "You were in Shields doing tasks (you killed much earlier).",
            all: "You were doing tasks in various locations. No one checked Communications for a while."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Upper Engine. %%__PLAYER__%%, %%__IMPOSTOR__%%, and %%__PLAYER__%% were doing tasks in the engine room.",
        evidence: "The engine alignment was left incomplete.",
        alibis: {
            impostor: "You were aligning the engine when %%__VICTIM__%% 'suddenly died' next to you.",
            nearby: "You were in Reactor and heard strange noises from Upper Engine.",
            far: "You were in Admin uploading data (far from the scene)."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in Lower Engine. %%__IMPOSTOR__%% called an emergency meeting immediately after.",
        evidence: "The body was still warm. Death was very recent.",
        alibis: {
            impostor: "You were coming from Electrical to do fuel and 'discovered' the body. You hit the button immediately.",
            nearby: "You were in Security watching cameras when the meeting was called.",
            far: "You were in Navigation and barely made it to the meeting."
        }
    },
  
    {
        description: "%%__VICTIM__%% was found dead in O2. %%__PLAYER__%%, %%__PLAYER__%%, and %%__IMPOSTOR__%% all claim they were together.",
        evidence: "The O2 filter was removed from its slot.",
        alibis: {
            impostor: "You were with %%__PLAYER__%% and %%__PLAYER__%% in Admin, then came to O2 together and found the body.",
            grouped: "You were in a group with %%__PLAYER__%% and %%__IMPOSTOR__%% doing tasks together.",
            far: "You were alone in Cafeteria doing card swipe."
        }
    }
];

const rooms = [
    "cafeteria", "upper engine", "weapons", "o2", "navigation", "shields", "communications", "storage", "admin", "electrical", "lower engine", "reactor", "security"
];

export {roomMap, rooms ,scenarioTemplates};