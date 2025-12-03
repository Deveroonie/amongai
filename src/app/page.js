"use client";

import { useState } from "react";
import { models, providers } from "./globals";
import axios from "axios";
import Modal from "./components/Modal";

export default function Home() {
    const getProviderModels = (providerName) => models.filter(m => m.provider === providerName);

    const [selection,setSelection] = useState([]);
    const gameId = useState(null);

    const startGame = () => {
        if(selection.length < 5) return;


        axios.post("/api/game/start", {
            models: selection.map(model => ({model: model.model, instructions: model.instructions}))
        }).then((res) => {
            window.location = `/game/${res.data.gameId}`;
        });
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center p-8">
            <h1 className="font-black text-5xl text-white text-shadow-black text-shadow-sm">Among <span className="text-red-400">AI</span></h1>
            <p className="text-xl text-white font-bold">Watch 5-10 AI models play Among Us against each other.</p>

            <div className="w-full max-w-4xl mt-8">
                <div className="sticky top-0 z-10 w-full p-4 border-2 border-white/30 bg-slate-700 rounded-xl text-white mb-2">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-lg text-white font-semibold">Selected Models</span>
                        <span className="text-white text-sm">
                            {selection.length}/10
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {selection.map(i => (
                            <div key={i.model} className={"flex items-center gap-2 p-2 rounded-lg border-2 text-white hover:bg-slate-600/30 transition"}>
                                <input type="checkbox" className="accent-current bg-transparent cursor-pointer" checked onChange={() => {
                                    setSelection(selection.filter(s => s !== i));
                                }} />
                                <Modal trigger={
                                    <span className="cursor-pointer hover:underline">{models.find(m => m.api === i.model)?.name}</span>
                                }
                                content={
                                    <>
                                        <h3 className="text-xl font-semibold">Custom instructions for {models.find(m => m.api === i.model).name}</h3>
                                        {i.instructions.map((instruction, idx) => (
                                            <input 
                                                key={idx}
                                                type="text" 
                                                className="bg-white text-black p-2 rounded-xl border mb-2 w-full" 
                                                value={instruction}
                                                onChange={(e) => {
                                                    const newSelection = selection.map(s => {
                                                        if (s.model === i.model) {
                                                            const newInstructions = [...s.instructions];
                                                            newInstructions[idx] = e.target.value;
                                                            return { ...s, instructions: newInstructions };
                                                        }
                                                        return s;
                                                    });
                                                    setSelection(newSelection);
                                                }}
                                            />
                                        ))}
                                        <button 
                                            className="bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600"
                                            onClick={() => {
                                                const newSelection = selection.map(s => {
                                                    if (s.model === i.model) {
                                                        return { ...s, instructions: [...s.instructions, ""] };
                                                    }
                                                    return s;
                                                });
                                                setSelection(newSelection);
                                            }}
                                        >
                                            + Add Instruction
                                        </button>
                                    </>
                                }
                                />
                            </div>
                        ))}
                    </div>

                </div>

                {selection.length >= 5 ? (
			  <button className="w-full p-4 border-2 border-white/30 bg-slate-700 rounded-xl text-white text-center my-2 hover:font-semibold text-xl" onClick={e => startGame()}>Start Game</button>
                ) : <p className="text-lg text-white text-center">Starting a game requires at least 5 models - add some more.</p>}
                {providers.map(provider => (
                    <div key={provider.name} className={`border-2 bg-slate-700/30 rounded-xl p-4 ${provider.borderColor} mb-2`}>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-lg text-white font-semibold">{provider.name}</span>
                            <span className="text-white text-sm">
                                {selection.filter(m => m.provider === provider.name).length}/{getProviderModels(provider.name).length}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {getProviderModels(provider.name).map(model => (
                                <label
                                    key={model.api}
                                    className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer text-white hover:bg-slate-600/30 transition ${provider.borderColor}`}
                                >
                                    <input type="checkbox" className="accent-current bg-transparent" onChange={(e => {
                                        if(selection.some((s) => s.model === model.api)){setSelection(selection.filter(i => i.model !== model.api));} else {
                                            if(selection.length < 10) {setSelection([...selection, {model: model.api, instructions: []}]);};
                                        }
                                    })}
                                    checked={selection.some((s) => s.model === model.api)} />
                                    <span>{model.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}

