"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { colourMap } from "../../globals";

export default function GamePage() {
    const params = useParams();
    const [game, setGame] = useState(null);
    const [displayedMessages, setDisplayedMessages] = useState([]);
    const [isAdvancing, setIsAdvancing] = useState(false);
    const [viewingRoundIndex, setViewingRoundIndex] = useState(null); // null means viewing the latest round
    const messagesEndRef = useRef(null);

    // Helper to build displayed messages including votes from game state
    const buildDisplayedMessages = (gameData) => {
        const currentRound = gameData.rounds[gameData.rounds.length - 1];
        const messages = [...currentRound.messages];
        
        // Add votes as vote messages
        if (currentRound.votes && currentRound.votes.length > 0) {
            for (const vote of currentRound.votes) {
                messages.push({
                    type: "vote",
                    voter: vote.voter,
                    accused: vote.accused || vote.vote
                });
            }
        }
        
        return messages;
    };

    // Load initial game state
    useEffect(() => {
        async function loadGame() {
            const res = await axios.get(`/api/game/${params.gameId}/state`);
            setGame(res.data);
            setDisplayedMessages(buildDisplayedMessages(res.data));
        }
        loadGame();
    }, [params.gameId]);

    // Sync displayed messages when viewing round changes or game state updates
    useEffect(() => {
        if (!game) return;
        const roundIdx = viewingRoundIndex ?? game.rounds.length - 1;
        const roundData = { ...game, rounds: game.rounds.slice(0, roundIdx + 1) };
        setDisplayedMessages(buildDisplayedMessages(roundData));
    }, [viewingRoundIndex, game]);

    // Auto-scroll to bottom when new messages arrive (only on lg+ screens)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [displayedMessages]);

    // Auto-advance the game
    useEffect(() => {
        if (!game || isAdvancing) return;
        
        // Only auto-advance when viewing the latest round
        const isViewingLatest = viewingRoundIndex === null || viewingRoundIndex === game.rounds.length - 1;
        if (!isViewingLatest) return;
        
        const currentRound = game.rounds[game.rounds.length - 1];
        
        // If round is over, don't advance
        if (currentRound.over) return;
        
        // Advance game
        const advance = async () => {
            setIsAdvancing(true);
            try {
                const res = await axios.get(`/api/game/${params.gameId}/next`)
                const data = res.data;
                
                if (data.openingStatements) {
                    // Display opening statements with delays
                    for (let i = 0; i < data.openingStatements.length; i++) {
                        await new Promise(resolve => setTimeout(resolve, i === 0 ? 0 : 3000));
                    }
                } else if (data.newResponse) {
                    // Add new message
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else if (data.newVote) {
                    // Add vote
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else if (data.roundOver) {
                    // Show round end
                    setGame(prev => ({
                        ...prev,
                        rounds: prev.rounds.map((r, i) => 
                            i === prev.rounds.length - 1 
                                ? { ...r, over: true, ejected: data.ejected, scoresRoundEnd: Object.entries(data.scores).map(([player, score]) => ({ player, score })) }
                                : r
                        ),
                        score: Object.entries(data.scores).map(([player, score]) => ({ player, score }))
                    }));
                }
                
                // Reload full state to stay synced
                const stateRes = await axios.get(`/api/game/${params.gameId}/state`);
                setGame(stateRes.data);
                // Only update displayed messages if still viewing latest round
                setDisplayedMessages(prev => {
                    // This will be picked up by the effect that syncs displayedMessages with viewingRoundIndex
                    return buildDisplayedMessages(stateRes.data);
                });
            } catch (err) {

                if(err.status && err?.status === 423) {
                    // Someone else is generating. We should refresh.
                    const stateRes = await axios.get(`/api/game/${params.gameId}/state`);
                    setGame(stateRes.data);
                    return ;
                }

                console.log("Advance error:", err);
            } finally {
                setIsAdvancing(false);
            }
        };
        
        // Delay before next advance
        const timer = setTimeout(advance, 2_500);
        return () => clearTimeout(timer);
    }, [game, isAdvancing, params.gameId, viewingRoundIndex]);

    if (!game) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <p className="text-white text-2xl">Loading game...</p>
            </div>
        );
    }

    const newRound = async () => {
        setIsAdvancing(true);
        try {
            await axios.post(`/api/game/${params.gameId}/start-round`, {});
            // Reload the game state to get the new round
            const res = await axios.get(`/api/game/${params.gameId}/state`);
            setGame(res.data);
            setViewingRoundIndex(null); // Switch to viewing the new latest round
        } catch (err) {
            console.error("Error starting new round:", err);
        } finally {
            setIsAdvancing(false);
        }
    };

    const currentRound = game.rounds[game.rounds.length - 1];
    const viewedRoundIdx = viewingRoundIndex ?? game.rounds.length - 1;
    const viewedRound = game.rounds[viewedRoundIdx];
    const scenario = viewedRound.scenario;
    const players = viewedRound.players;

    return (
        <div className="w-full h-screen flex flex-col items-center p-4 overflow-hidden bg-slate-900">
            <h1 className="font-black text-4xl text-white">Among <span className="text-red-400">AI</span></h1>
            <p className="text-lg text-white font-bold mb-2">Watch 5-10 AI models play Among Us against each other.</p>

            <div className="flex flex-col lg:flex-row w-full flex-1 justify-between gap-4 min-h-0 overflow-auto lg:overflow-hidden">

                {/* Messages */}
                <div className="w-full lg:w-[70%] p-4 rounded-xl text-white bg-slate-800/30 border-2 flex flex-col min-h-0">
                    {game.rounds.length > 1 && (
                        <div className="flex gap-2 mb-3">
                            {game.rounds.map((round, i) => (
                                <div 
                                    key={i} 
                                    className={`p-2 px-4 rounded-xl cursor-pointer ${(viewingRoundIndex === null ? i === game.rounds.length - 1 : i === viewingRoundIndex) ? "bg-blue-600 border-blue-400" : "bg-slate-700/30 hover:bg-slate-600/30"} border-2`}
                                    onClick={() => {
                                        setViewingRoundIndex(i === game.rounds.length - 1 ? null : i);
                                    }}
                                >
                                    Round {i + 1}
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-2xl font-bold mb-3 border-b border-slate-600 pb-2">💬 Messages</p>
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                        {displayedMessages.map((msg, i) => {
                            if (msg.type === "vote") {
                                const voterColor = colourMap[msg.voter] || colourMap.white;
                                const accusedColor = colourMap[msg.accused] || colourMap.white;
                                return (
                                    <div key={i} className={`w-full p-2 rounded-lg ${voterColor.bg} border ${voterColor.border} italic`}>
                                        <span className="font-semibold capitalize">{msg.voter}</span> voted for <span className="font-semibold capitalize">{msg.accused || msg.vote}</span>
                                    </div>
                                );
                            }
                                                    
                            const color = colourMap[msg.author] || colourMap.white;
                            const player = players.find(p => p.colour === msg.author);
                            
                            if (!player) {
                                // Fallback if player not found
                                return (
                                    <div key={i} className={`w-full flex items-start gap-3 p-2 rounded-lg ${color.bg} border ${color.border}`}>
                                        <p>
                                            <span className={`text-xl font-semibold ${color.text}`}>
                                                <span className="capitalize font-semibold">{msg.author}</span>
                                            </span>
                                            <br />
                                            <span className="text-lg">{msg.message}</span>
                                        </p>
                                    </div>
                                );
                            }
                            
                            return (
                                <div key={i} className={`w-full flex items-start gap-3 p-2 rounded-lg ${color.bg} border ${color.border}`}>
                                    <p>
                                        <span className={`text-xl font-semibold ${color.text}`}>
                                            <span className="capitalize font-semibold">{player.colour}</span> ({player.model.split("/")[1]})
                                        </span>
                                        <br />
                                        <span className="text-lg">{msg.message}</span>
                                    </p>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Loading indicator - only show when viewing latest round and it's not over */}
                    {viewedRoundIdx === game.rounds.length - 1 && !viewedRound.over && (
                        <div className="mt-2 w-full flex items-center gap-3 p-2 rounded-lg bg-slate-700/20 border border-slate-600/40">
                            {isAdvancing ? "Generating response..." : "Waiting for next message..."}
                        </div>
                    )}
                    
                    {/* Round over */}
                    {viewedRound.over && viewedRound.ejected && (
                        <div className="mt-2 w-full flex flex-col gap-2 p-4 rounded-lg bg-slate-700/40 border-2 border-slate-600">
                            <p className="text-xl font-bold">Round Over!</p>
                            <p className="text-lg">
                                <span className="capitalize font-semibold">{viewedRound.ejected.ejected}</span> was ejected.
                                {viewedRound.ejected.wasImpostor ? " They WERE the impostor! ✅" : " They were NOT the impostor. ❌"}
                            </p>
                            {viewedRoundIdx === game.rounds.length - 1 && (
                                <button 
                                    onClick={newRound}
                                    disabled={isAdvancing}
                                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-semibold"
                                >
                                    {isAdvancing ? "Starting..." : "Next Round →"}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-full lg:w-[25%] flex flex-col gap-3 min-h-0">
                    {/* Scenario */}
                    <div className="p-4 rounded-xl text-white bg-slate-800/30 border-2">
                        <p className="text-2xl font-bold mb-3 border-b border-slate-600 pb-2">🗺️ Scenario</p>
                        <p className="text-lg">{scenario.description}</p>
                        <p className="text-sm text-gray-400 mt-2">Evidence: {scenario.evidence}</p>
                    </div>

                    {/* Players */}
                    <div className="p-4 rounded-xl text-white bg-slate-800/30 border-2 flex flex-col lg:min-h-0">
                        <p className="text-2xl font-bold mb-3 border-b border-slate-600 pb-2">👥 Players</p>
                        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                            {players?.map((player, i) => {
                                const color = colourMap[player.colour] || colourMap.white;
                                return (
                                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${color.bg} border ${color.border}`}>
                                        <div className={`w-4 h-4 rounded-full ${color.dot}`}></div>
                                        <span className={`${color.text} font-medium`}>
                                            <span className="capitalize font-semibold">{player.colour}</span> ({player.model.split("/")[1]})
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scores */}
                    <div className="p-4 rounded-xl text-white bg-slate-800/30 border-2 flex flex-col lg:min-h-0">
                        <p className="text-2xl font-bold mb-3 border-b border-slate-600 pb-2">🏆 Scores</p>
                        <div className="flex flex-col gap-2 flex-1 lg:overflow-y-auto">
                            {game.score
                                ?.sort((a, b) => b.score - a.score)
                                ?.map((s, i) => {
                                    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
                                    const bgColor = i === 0 ? "bg-yellow-500/20 border-yellow-500" : 
                                        i === 1 ? "bg-gray-300/20 border-gray-300" : 
                                            i === 2 ? "bg-amber-600/20 border-amber-600" : 
                                                "bg-gray-500/20 border-gray-500";
                                    const displayName = s.model ? s.model.split("/")[1] : s.player;
                                    return (
                                        <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${bgColor}`}>
                                            <span className="font-medium">
                                                {medal} #{i + 1} - {displayName} ({s.score}pts)
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
