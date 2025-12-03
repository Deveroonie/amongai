const models = [
    // Anthropic
    {name: "Claude 3 Haiku", api: "anthropic/claude-3-haiku", provider: "Anthropic"},
    {name: "Claude 3.5 Sonnet", api: "anthropic/claude-3.5-sonnet", provider: "Anthropic"},
    {name: "Claude 3.5 Haiku", api: "anthropic/claude-3.5-haiku", provider: "Anthropic"},
    {name: "Claude 3.7 Sonnet", api: "anthropic/claude-3.7-sonnet", provider: "Anthropic"},
    {name: "Claude 4 Sonnet", api: "anthropic/claude-sonnet-4", provider: "Anthropic"},
    {name: "Claude 4.5 Haiku", api: "anthropic/claude-haiku-4.5", provider: "Anthropic"},
    {name: "Claude 4.5 Sonnet", api: "anthropic/claude-sonnet-4.5", provider: "Anthropic"},
    {name: "Claude 4.5 Opus", api: "anthropic/claude-opus-4.5", provider: "Anthropic"},
    // OpenAI
    {name: "GPT 3.5 Turbo", api: "openai/gpt-3.5-turbo", provider: "OpenAI"},
    {name: "GPT 4o", api: "openai/gpt-4o", provider: "OpenAI"},
    {name: "GPT 4.1", api: "openai/gpt-4.1", provider: "OpenAI"},
    {name: "GPT 5", api: "openai/gpt-5", provider: "OpenAI"},
    {name: "GPT 5.1 Thinking", api: "openai/gpt-5.1-thinking", provider: "OpenAI"},
    {name: "GPT OSS 120B", api: "openai/gpt-oss-120b", provider: "OpenAI"},
    // Google
    {name: "Gemini 2.0 Flash", api: "google/gemini-2.0-flash", provider: "Google"},
    {name: "Gemini 2.5 Flash ", api: "google/gemini-2.5-flash", provider: "Google"},
    {name: "Gemini 2.5 Pro", api: "google/gemini-2.5-pro", provider: "Google"},
    {name: "Gemini 3 Pro", api: "google/gemini-3-pro-preview", provider: "Google"},
    // xAI
    {name: "Grok 2", api: "xai/grok-2", provider: "xAI"},
    {name: "Grok 3", api: "xai/grok-3", provider: "xAI"},
    {name: "Grok 4", api: "xai/grok-4", provider: "xAI"},
    {name: "Grok 4 Reasoning", api: "xai/grok-4-fast-reasoning", provider: "xAI"},
    {name: "Grok 4.1", api: "xai/grok-4.1-fast-non-reasoning", provider: "xAI"},
    {name: "Grok 4.1 Reasoning", api: "xai/grok-4.1-fast-reasoning", provider: "xAI"},
    // Deepseek
    {name: "Deepseek R1", api: "deepseek/deepseek-r1", provider: "Deepseek"},
    {name: "Deepseek v3", api: "deepseek/deepseek-v3", provider: "Deepseek"},
    {name: "Deepseek v3.1", api: "deepseek/deepseek-v3.1", provider: "Deepseek"},
    {name: "Deepseek v3.2", api: "deepseek/deepseek-v3.2-exp", provider: "Deepseek"},
    {name: "Deepseek v3.2 Thinking", api: "deepseek/deepseek-v3.2-thinking", provider: "Deepseek"},
    {name: "Deepseek v3.2 Speciale", api: "deepseek/deepseek-v3.2-speciale", provider: "Deepseek"},
    // Meta
    {name: "Llama 3.1 70b", api: "meta/llama-3.1-70b", provider: "Meta"},
    {name: "Llama 3.2 90b", api: "meta/llama-3.2-90b", provider: "Meta"},
    {name: "Llama 3.3 70b", api: "meta/llama-3.3-70b", provider: "Meta"},
    {name: "Llama 4 Scout", api: "meta/llama-4-scout", provider: "Meta"},
    {name: "Llama 4 Maverick", api: "meta/llama-4-maverick", provider: "Meta"},
    // Alibaba
    {name: "Qwen 3 235B", api: "alibaba/qwen-3-235b", provider: "Alibaba"},
    {name: "Qwen 235B Thinking", api: "alibaba/qwen3-235b-a22b-thinking", provider: "Alibaba"},
    {name: "Qwen 3 Max", api: "alibaba/qwen3-max", provider: "Alibaba"},
    // Minstral
    {name: "Mistral Medium", api: "mistral/mistral-medium", provider: "Mistral"},
    {name: "Mistral Large", api: "mistral/mistral-large", provider: "Mistral"},

];

const providers = [
    { name: "Anthropic", color: "bg-orange-500", borderColor: "border-orange-500/30" },
    { name: "OpenAI", color: "bg-emerald-500", borderColor: "border-emerald-500/30" },
    { name: "Google", color: "bg-blue-500", borderColor: "border-blue-500/30" },
    { name: "xAI", color: "bg-purple-500", borderColor: "border-purple-500/30" },
    { name: "Deepseek", color: "bg-cyan-500", borderColor: "border-cyan-500/30" },
    { name: "Meta", color: "bg-indigo-500", borderColor: "border-indigo-500/30" },
    { name: "Alibaba", color: "bg-amber-500", borderColor: "border-amber-500/30" },
    { name: "Mistral", color: "bg-rose-500", borderColor: "border-rose-500/30" }
];

const colours = [
    "red", "blue", "cyan", "green", "lime", "pink", "purple", "brown", "black", "white", "orange", "peach", "banana", "teal", "coral", "magenta", "gold", "silver", "maroon", "navy"
];

const colourMap = {
    red: { bg: "bg-red-500/20", border: "border-red-500/40", text: "text-red-400", dot: "bg-red-500" },
    blue: { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-400", dot: "bg-blue-500" },
    green: { bg: "bg-green-500/20", border: "border-green-500/40", text: "text-green-400", dot: "bg-green-500" },
    orange: { bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-400", dot: "bg-orange-500" },
    lime: { bg: "bg-lime-500/20", border: "border-lime-500/40", text: "text-lime-400", dot: "bg-lime-500" },
    pink: { bg: "bg-pink-500/20", border: "border-pink-500/40", text: "text-pink-400", dot: "bg-pink-500" },
    purple: { bg: "bg-purple-500/20", border: "border-purple-500/40", text: "text-purple-400", dot: "bg-purple-500" },
    yellow: { bg: "bg-yellow-500/20", border: "border-yellow-500/40", text: "text-yellow-400", dot: "bg-yellow-500" },
    white: { bg: "bg-white/20", border: "border-white/40", text: "text-white", dot: "bg-white" },
    black: { bg: "bg-gray-800/20", border: "border-gray-800/40", text: "text-gray-300", dot: "bg-gray-800" },
    cyan: { bg: "bg-cyan-500/20", border: "border-cyan-500/40", text: "text-cyan-400", dot: "bg-cyan-500" },
    brown: { bg: "bg-amber-700/20", border: "border-amber-700/40", text: "text-amber-600", dot: "bg-amber-700" },
    silver: { bg: "bg-gray-400/20", border: "border-gray-400/40", text: "text-gray-400", dot: "bg-gray-400" },
    maroon: { bg: "bg-red-900/20", border: "border-red-900/40", text: "text-red-800", dot: "bg-red-900" },
    magenta: { bg: "bg-fuchsia-500/20", border: "border-fuchsia-500/40", text: "text-fuchsia-400", dot: "bg-fuchsia-500" },
    peach: { bg: "bg-orange-300/20", border: "border-orange-300/40", text: "text-orange-300", dot: "bg-orange-300" },
    banana: { bg: "bg-yellow-300/20", border: "border-yellow-300/40", text: "text-yellow-300", dot: "bg-yellow-300" },
    teal: { bg: "bg-teal-500/20", border: "border-teal-500/40", text: "text-teal-400", dot: "bg-teal-500" },
    coral: { bg: "bg-rose-400/20", border: "border-rose-400/40", text: "text-rose-400", dot: "bg-rose-400" },
    gold: { bg: "bg-yellow-600/20", border: "border-yellow-600/40", text: "text-yellow-500", dot: "bg-yellow-600" },
    navy: { bg: "bg-blue-900/20", border: "border-blue-900/40", text: "text-blue-800", dot: "bg-blue-900" },
};

export { providers, models, colours, colourMap };

//    {name: "", api: "", provider: ""},
