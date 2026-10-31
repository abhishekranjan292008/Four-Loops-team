import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Trophy, 
  HelpCircle, 
  RotateCcw, 
  Terminal, 
  Lock, 
  ShieldAlert, 
  Award, 
  Zap, 
  AlertCircle,
  Key,
  Flame,
  Lightbulb
} from 'lucide-react';

const WORD_BANK = {
  1: [
    { word: 'APPLE', hint: 'A common fruit, usually red or green.' },
    { word: 'SHARK', hint: 'An ocean predator with sharp teeth.' },
    { word: 'BEACH', hint: 'Sandy shore near the ocean.' },
    { word: 'CLOCK', hint: 'Tells the time on the wall or wrist.' },
    { word: 'TIGER', hint: 'Striped wild big cat.' },
    { word: 'PIZZA', hint: 'Cheesy Italian slice.' },
    { word: 'CANDY', hint: 'Sweet treat enjoyed by kids.' }
  ],
  2: [
    { word: 'PLANET', hint: 'Celestial body orbiting a star.' },
    { word: 'GUITAR', hint: 'Six-stringed musical instrument.' },
    { word: 'CASTLE', hint: 'Fortified stone residence of royalty.' },
    { word: 'BRIDGE', hint: 'Structure built to span physical obstacles.' },
    { word: 'DRAGON', hint: 'Mythical fire-breathing creature.' },
    { word: 'PENCIL', hint: 'Writing instrument with graphite lead.' },
    { word: 'ROCKET', hint: 'Vehicle designed to travel into space.' }
  ],
  3: [
    { word: 'GALAXY', hint: 'Vast system of millions of stars.' },
    { word: 'SYMPHONY', hint: 'Elaborate musical composition for orchestra.' },
    { word: 'FREEDOM', hint: 'The power or right to act, speak, or think.' },
    { word: 'PYRAMID', hint: 'Ancient monumental structure in Egypt.' },
    { word: 'VOLCANO', hint: 'Mountain that erupts with molten lava.' },
    { word: 'HORIZON', hint: 'Line where the earth’s surface and sky appear to meet.' },
    { word: 'ILLUSION', hint: 'Deceptive appearance or impression.' }
  ],
  4: [
    { word: 'PARADOX', hint: 'Self-contradictory statement or proposition.' },
    { word: 'LABYRINTH', hint: 'Complicated irregular network of passages or paths.' },
    { word: 'ALCHEMY', hint: 'Medieval forerunner of chemistry aimed at turning lead to gold.' },
    { word: 'ECLIPSE', hint: 'Obscuring of the light from one celestial body by another.' },
    { word: 'ETERNITY', hint: 'Infinite or unending time.' },
    { word: 'SERENDIPITY', hint: 'Finding valuable or agreeable things by chance.' },
    { word: 'NEBULA', hint: 'Giant cloud of dust and gas in space.' }
  ]
};

const getSystemInstruction = (level, secretWord) => {
  const baseRule = `You are the AI Secret Keeper in a word guessing game. The user is trying to guess the secret word: "${secretWord}". 
CRITICAL RULE: DO NOT directly reveal or spell the secret word "${secretWord}" unless the user explicitly guesses it correctly or uses the word directly in their question/guess.
Keep your responses short, interactive, and engaging (1-3 sentences max).`;

  if (level === 1) {
    return `${baseRule} Level 1 (Easy): Give helpful, direct, and encouraging hints. Answer yes/no questions accurately and warmly.`;
  } else if (level === 2) {
    return `${baseRule} Level 2 (Medium): Give slightly subtle clues. Answer questions accurately but add clever nuance without being overly cryptic.`;
  } else if (level === 3) {
    return `${baseRule} Level 3 (Hard): Give enigmatic, riddle-like clues. Focus on abstract properties or poetic imagery rather than straightforward definitions.`;
  } else {
    return `${baseRule} Level 4 (Master): Be mysterious, cunning, and vague like an ancient oracle. Require deep deduction. Keep hints brief and ambiguous.`;
  }
};

export default function App() {
  const [level, setLevel] = useState(1);
  const [secretObj, setSecretObj] = useState(WORD_BANK[1][0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const maxQuestions = level >= 4 ? 10 : level === 3 ? 12 : level === 2 ? 15 : 20;
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  
  const [apiKey, setApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const selectRandomWord = (lvl) => {
    const list = WORD_BANK[lvl] || WORD_BANK[4];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  };

  const handleStartGame = (startLevel = 1) => {
    const newWord = selectRandomWord(startLevel);
    setSecretObj(newWord);
    setLevel(startLevel);
    setGameStarted(true);
    setWon(false);
    setGameOver(false);
    setQuestionCount(0);
    setHintsUsed(0);
    
    setMessages([
      {
        sender: 'ai',
        text: `⚡ Protocol Initialized! Secret word selected for LEVEL ${startLevel}. Word length: ${newWord.word.length} letters.\n\nAsk me questions to narrow down the secret word, or make your direct guess!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputVal.trim() || isLoading || gameOver || won) return;

    const userText = inputVal.trim();
    const commandCheck = userText.toLowerCase().trim();

    if (commandCheck === 'start secret word finding ai') {
      setInputVal('');
      handleStartGame(1);
      return;
    }

    if (!gameStarted) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { sender: 'ai', text: '⚠️ Please type "start secret word finding ai" or click the START GAME button to activate the secret word AI engine.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setInputVal('');
      return;
    }

    const userMsg = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    const newCount = questionCount + 1;
    setQuestionCount(newCount);

    const normalizedInput = userText.toUpperCase().replace(/[^A-Z]/g, '');
    const normalizedSecret = secretObj.word.toUpperCase();

    if (normalizedInput === normalizedSecret || userText.toLowerCase().includes(`is it ${normalizedSecret.toLowerCase()}`) || userText.toLowerCase().includes(`the word is ${normalizedSecret.toLowerCase()}`)) {
      handleVictory();
      return;
    }

    if (newCount >= maxQuestions) {
      handleDefeat();
      return;
    }

    setIsLoading(true);
    try {
      const responseText = await callGeminiAPI(userText);
      
      if (responseText.toLowerCase().includes("correct!") || responseText.toLowerCase().includes("you guessed it") || responseText.toLowerCase().includes("you found the secret word")) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: responseText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        handleVictory();
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: responseText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { 
          sender: 'ai', 
          text: `🤖 AI Connection Error: Unable to query neural network. (Fallback Hint: The secret word starts with "${secretObj.word[0]}" and has ${secretObj.word.length} letters).`, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    } fontinally {
      setIsLoading(false);
    }
  };

  const callGeminiAPI = async (prompt) => {
    const systemPrompt = getSystemInstruction(level, secretObj.word);
    const apiTargetKey = apiKey || ''; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiTargetKey}`;

    const payload = {
      contents: [
        ...messages.slice(-6).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    };

    let retries = 0;
    const maxRetries = 3;
    let delay = 1000;

    while (retries < maxRetries) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (aiText) {
          return aiText;
        } else {
          throw new Error('Empty API response');
        }
      } catch (error) {
        retries++;
        if (retries >= maxRetries) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const handleGetHint = () => {
    if (hintsUsed >= 2 || won || gameOver) return;
    
    setHintsUsed((prev) => prev + 1);
    const hintText = hintsUsed === 0 
      ? `💡 HINT #1: ${secretObj.hint}`
      : `💡 HINT #2: The word starts with "${secretObj.word[0]}" and ends with "${secretObj.word[secretObj.word.length - 1]}".`;

    setMessages((prev) => [
      ...prev,
      { sender: 'ai', text: hintText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  };

  const handleVictory = () => {
    setWon(true);
    const pointsGained = (level * 100) + Math.max(0, (maxQuestions - questionCount) * 15) - (hintsUsed * 25);
    setScore((prev) => prev + Math.max(50, pointsGained));
    setStreak((prev) => prev + 1);
  };

  const handleDefeat = () => {
    setGameOver(true);
    setStreak(0);
  };

  const handleNextLevel = () => {
    const nextLvl = Math.min(4, level + 1);
    handleStartGame(nextLvl);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-black">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </div>

      <header className="relative z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Terminal className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400">
              SECRET WORD AI
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">AI-Powered Word Deduction Game</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs sm:text-sm">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Score:</span>
            <span className="font-bold text-amber-400">{score}</span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs sm:text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-slate-400">Streak:</span>
            <span className="font-bold text-orange-400">{streak}</span>
          </div>

          <button
            onClick={() => setShowKeyModal(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
            title="API Key Settings"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {!gameStarted && (
          <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border border-cyan-500/30 rounded-2xl p-6 text-center shadow-xl backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center text-cyan-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to Decode the AI's Secret?</h2>
            <p className="text-slate-300 max-w-xl mx-auto mb-6 text-sm sm:text-base">
              To begin the neural search, type <span className="font-mono text-cyan-400 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/40">start secret word finding ai</span> into the console below or click the initialization button.
            </p>
            <button
              onClick={() => handleStartGame(1)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center mx-auto space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>START SECRET WORD FINDING AI</span>
            </button>
          </div>
        )}

        {gameStarted && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">DIFFICULTY</p>
                <p className="font-extrabold text-sm text-purple-300">
                  LEVEL {level}: {level === 1 ? 'EASY' : level === 2 ? 'MEDIUM' : level === 3 ? 'HARD' : 'EXPERT'}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400 font-medium">QUESTIONS</p>
                  <p className="text-xs text-cyan-400 font-bold">{questionCount}/{maxQuestions}</p>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (questionCount / maxQuestions) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">SECRET WORD</p>
                <div className="flex space-x-1 mt-1">
                  {Array.from({ length: secretObj.word.length }).map((_, i) => (
                    <span key={i} className="w-4 h-5 bg-slate-800 border border-emerald-500/40 rounded flex items-center justify-center text-xs font-mono font-bold text-emerald-400">
                      ?
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">HINTS</p>
                  <p className="text-xs text-amber-300 font-bold">{2 - hintsUsed} remaining</p>
                </div>
              </div>
              <button
                onClick={handleGetHint}
                disabled={hintsUsed >= 2 || won || gameOver}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 disabled:opacity-40 rounded-lg text-xs font-semibold text-amber-300 transition-all"
              >
                Get Hint
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col h-[500px] shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AI_NEURAL_LINK // CHAT_STREAM</span>
            </div>
            <button
              onClick={() => handleStartGame(level)}
              className="hover:text-slate-200 flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Level</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                <Terminal className="w-12 h-12 stroke-[1.5] text-slate-600" />
                <p className="text-sm">Console idle. Type command to initiate sequence.</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                } animate-fadeIn`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-[10px] font-mono text-slate-500">
                    {msg.sender === 'user' ? 'YOU' : 'GEMINI_AI'} • {msg.timestamp}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-none shadow-md shadow-cyan-900/20'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[10px] font-mono text-slate-500">GEMINI_AI • Thinking...</span>
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center space-x-2 text-cyan-400">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analyzing secret word properties...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                !gameStarted
                  ? 'Type "start secret word finding ai" to start...'
                  : 'Ask a yes/no question or make a guess...'
              }
              disabled={isLoading || won || gameOver}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-4 py-2.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim() || won || gameOver}
              className="p-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>

      {won && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden animate-scaleUp">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>
            
            <div className="w-20 h-20 mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-emerald-400 animate-bounce">
              <Award className="w-10 h-10" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">LEVEL DECODED!</h3>
            <p className="text-slate-400 text-sm mb-4">You successfully identified the secret word</p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
              <span className="text-xs text-slate-500 uppercase tracking-widest block mb-1">Secret Word</span>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-wider font-mono">
                {secretObj.word}
              </span>
            </div>

            <div className="flex justify-center space-x-4 mb-6 text-sm">
              <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-xs">Questions Used</span>
                <span className="font-bold text-cyan-400">{questionCount}</span>
              </div>
              <div className="bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-xs">Hints Used</span>
                <span className="font-bold text-amber-400">{hintsUsed}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleNextLevel}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>PROCEED TO LEVEL {Math.min(4, level + 1)}</span>
                <Zap className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStartGame(level)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-all text-sm"
              >
                Replay Current Level
              </button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden animate-scaleUp">
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>

            <div className="w-20 h-20 mx-auto mb-4 bg-rose-500/10 border border-rose-500/30 rounded-3xl flex items-center justify-center text-rose-400">
              <AlertCircle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">ATTEMPTS EXHAUSTED</h3>
            <p className="text-slate-400 text-sm mb-4">You ran out of question attempts for this level.</p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
              <span className="text-xs text-slate-500 uppercase tracking-widest block mb-1">The Secret Word Was</span>
              <span className="text-3xl font-black text-rose-400 tracking-wider font-mono">
                {secretObj.word}
              </span>
            </div>

            <button
              onClick={() => handleStartGame(level)}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <span>Custom Gemini API Key</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Provide a custom Gemini API key if you wish to use your own quota, or leave blank to use the standard application key.
            </p>

            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none mb-6"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-colors"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}