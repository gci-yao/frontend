import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaPhoneAlt, FaEnvelope, FaWhatsapp, FaRobot, FaPaperPlane, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

export default function LandingWithDraggableAI() {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPos, setAiPos] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingMessage, setTypingMessage] = useState(null);
  const [aiSpeaking, setAiSpeaking] = useState(true);
  const [listening, setListening] = useState(false);

  const aiRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  const loginButtonRef = useRef(null);
  const registerButtonRef = useRef(null);
  const callRef = useRef(null);
  const emailRef = useRef(null);
  const whatsappRef = useRef(null);
  const injureRef = useRef(null);
  const thankRef = useRef(null);

  const injures = [
    "idiot","bête","imbécile","crétin","stupide","nul","con","connard","sot","abruti","débile","pauvre type","chiant","sale","vilain","mauvais","chien"
  ];

  useEffect(() => {
  const setDefaultAiPos = () => {
    const buttonSize = 64; // taille du bouton IA
    const boxWidth = Math.min(320, window.innerWidth * 0.8);  // max 320px ou 80% de l'écran
    const boxHeight = Math.min(100, window.innerHeight * 0.5); // max 300px ou 50% de la hauteur

    setAiPos({
      x: window.innerWidth - boxWidth - 16, // 16px marge droite
      y: window.innerHeight - boxHeight - buttonSize - 16, // juste au-dessus du bouton
    });
  };

  // Initial position
  setDefaultAiPos();

  // Recalculer si l'écran change (responsive)
  window.addEventListener("resize", setDefaultAiPos);

  return () => window.removeEventListener("resize", setDefaultAiPos);
}, []);


  const speak = (text) => {
    if (!aiSpeaking || !aiRef.current) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "fr-FR";
    aiRef.current.speak(utter);
  };

  const sendAiMessage = (text) => {
    setTypingMessage({ text, index: 0, content: "" });
    speak(text);
  };

  useEffect(() => {
    if (!typingMessage) return;
    const { text, index, content } = typingMessage;
    if (index >= text.length) {
      setMessages(prev => [...prev, { from: "ai", text }]);
      setTypingMessage(null);
      return;
    }
    const timeout = setTimeout(() => {
      setTypingMessage({ text, index: index + 1, content: content + text[index] });
    }, 30);
    return () => clearTimeout(timeout);
  }, [typingMessage]);

  const highlightButton = (buttonRef) => {
    if (!buttonRef.current) return;
    buttonRef.current.classList.add("highlight");
    setTimeout(() => buttonRef.current.classList.remove("highlight"), 2000);
  };

  const handleAiResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("login")) {
      sendAiMessage("Cliquez sur le bouton Login pour vous connecter.");
      highlightButton(loginButtonRef);
    } else if (lower.includes("register")) {
      sendAiMessage("Cliquez sur le bouton Register pour créer un compte.");
      highlightButton(registerButtonRef);
    } else if (lower.includes("call") || lower.includes("téléphone") || lower.includes("appel")) {
      sendAiMessage("Cliquez sur le bouton Call pour appeler.");
      highlightButton(callRef);
    } else if (lower.includes("email") || lower.includes("mail")) {
      sendAiMessage("Cliquez sur le bouton Email pour envoyer un email.");
      highlightButton(emailRef);
    } else if (lower.includes("whatsapp") || lower.includes("chat")) {
      sendAiMessage("Cliquez sur le bouton WhatsApp pour discuter.");
      highlightButton(whatsappRef);
    } else if (lower.includes("merci") || lower.includes("thank") || lower.includes("thanks")) {
      sendAiMessage("Je vous en prie, j'espère que j'ai répondu à votre préoccupation !");
      highlightButton(thankRef);
    } else if (injures.some(word => lower.includes(word))) {
      sendAiMessage("Oooh. Je suis désolé, je peux vous aider à Login, Register, Call, Email ou WhatsApp !");
      highlightButton(injureRef);
    } else {
      sendAiMessage("Je peux vous aider à Login, Register, Call, Email ou WhatsApp !");
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { from: "user", text: input }]);
    handleAiResponse(input);
    setInput("");
  };

  const onMouseDown = (e) => {
    setDragging(true);
    setDragOffset({ x: e.clientX - aiPos.x, y: e.clientY - aiPos.y });
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setAiPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };
  const onMouseUp = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const spokenText = last[0].transcript;
      setMessages(prev => [...prev, { from: "user", text: spokenText }]);
      handleAiResponse(spokenText);
    };
    recognitionRef.current = recognition;
  };

  const toggleListening = () => {
    if (!recognitionRef.current) initRecognition();
    if (!listening) {
      recognitionRef.current.start();
      setListening(true);
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const handleAiIconClick = () => {
    setAiOpen(prev => !prev);
    if (!aiOpen) {
      if (!recognitionRef.current) initRecognition();
      setTimeout(() => {
        recognitionRef.current?.start();
        setListening(true);
      }, 100);
    } else {
      recognitionRef.current?.stop();
      setListening(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 bg-slate-950 relative">

      {/* 🔹 Grid principale */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 🔹 Carte principale */}
        <div className="p-6 md:p-8 rounded-lg-soft neon bg-[rgba(6,10,14,0.65)] shadow-soft hover:scale-[1.02] transition w-full min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">GreenHat Cloud</h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base">
            Manage multiple Wi-Fi hotspot businesses, revenue sharing, subscriptions and router fleets — all from one place.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link ref={loginButtonRef} to="/login" className="px-4 py-2 bg-primary text-black rounded-md font-semibold hover:scale-105 transition text-center">
              Login
            </Link>
            <Link ref={registerButtonRef} to="/register" className="px-4 py-2 border border-slate-700 rounded-md text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition text-center">
              Register
            </Link>
          </div>
        </div>

        {/* 🔹 Carte Features */}
        <div className="p-6 md:p-8 rounded-lg-soft neon bg-[rgba(6,10,14,0.65)] shadow-soft hover:scale-[1.02] transition w-full min-w-0">
          <h3 className="text-xl text-slate-300">Features</h3>
          <div className="mt-4 grid gap-4">
            <div className="p-3 bg-[rgba(10,14,18,0.6)] rounded-lg hover:bg-[rgba(20,24,28,0.8)] transition text-sm sm:text-base">Role-based dashboards</div>
            <div className="p-3 bg-[rgba(10,14,18,0.6)] rounded-lg hover:bg-[rgba(20,24,28,0.8)] transition text-sm sm:text-base">Auto-triggered sessions from payments</div>
          </div>
        </div>

        {/* 🔹 Carte Contact */}
        <div className="p-6 md:p-8 rounded-lg-soft neon bg-[rgba(6,10,14,0.65)] shadow-soft col-span-1 md:col-span-2 w-full min-w-0">
          <h3 className="text-xl text-slate-300 mb-6">Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 justify-center">
            <a ref={callRef} href="tel:+2250706836722" className="contact-box">
              <FaPhoneAlt className="text-3xl text-cyan-300" />
              <div className="justify-center">
                <div className="text-slate-400 text-sm ">Call</div>
                <div className="text-white font-semibold tracking-wide">07 06 83 67 22</div>
              </div>
            </a>
            <a ref={emailRef} href="https://mail.google.com/mail/?view=cm&fs=1&to=legeny225@gmail.com" target="_blank" rel="noreferrer" className="contact-box">
              <FaEnvelope className="text-3xl text-purple-300" />
              <div>
                <div className="text-slate-400 text-sm">Email</div>
                <div className="text-white font-semibold tracking-wide">legeny225@gmail.com</div>
              </div>
            </a>
            <a ref={whatsappRef} href="https://wa.me/qr/D2RV5VOMDPESF1" target="_blank" rel="noreferrer" className="contact-box">
              <FaWhatsapp className="text-3xl text-green-300" />
              <div>
                <div className="text-slate-400 text-sm">WhatsApp</div>
                <div className="text-white font-semibold tracking-wide">Chat on WhatsApp</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* 🔹 Icône IA flottante */}
      <button
        onClick={handleAiIconClick}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 p-4 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-500 transition flex items-center justify-center z-50"
      >
        <FaRobot className="text-2xl" />
      </button>

      {/* 🔹 IA Box flottante draggable */}
      {aiOpen && (
        <div
          onMouseDown={onMouseDown}
          className="absolute bg-[rgba(6,10,14,0.95)] border border-cyan-500 rounded-lg p-4 shadow-xl z-50 cursor-move w-72 sm:w-80 max-w-[90vw] max-h-[80vh] overflow-hidden"
          style={{ top: aiPos.y, left: aiPos.x }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-white flex items-center gap-2">
              <FaRobot /> GreenHat Assistant
            </span>
            <div className="flex gap-2">
              <button onClick={toggleListening} className="text-white px-2 py-1 bg-cyan-700 rounded hover:bg-cyan-600 transition">
                {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              <button onClick={() => { setAiOpen(false); recognitionRef.current?.stop(); setListening(false); }} className="text-white px-2 py-1 bg-red-700 rounded hover:bg-red-500 transition">✕</button>
            </div>
          </div>

          <div className="flex-1 p-2 flex flex-col gap-2 max-h-60 sm:max-h-48 overflow-y-auto bg-slate-900 rounded">
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded-lg ${m.from === "ai" ? "bg-cyan-800 text-white self-start" : "bg-slate-700 text-white self-end"}`}>
                {m.text}
              </div>
            ))}
            {typingMessage && (
              <div className="p-2 rounded-lg bg-cyan-800 text-white self-start">{typingMessage.content}</div>
            )}
          </div>

          <div className="flex mt-2 border border-slate-700 rounded overflow-hidden">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrire un message..."
              className="flex-1 p-2 bg-slate-900 text-white focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="px-3 bg-cyan-500 hover:bg-cyan-400 transition text-white flex items-center justify-center">
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          .contact-box {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(6,200,255,0.05), rgba(0,150,255,0.05));
            border: 1px solid rgba(6,200,255,0.2);
            border-radius: 1rem;
            transition: all 0.3s;
          }
          .contact-box:hover {
            transform: scale(1.05);
            box-shadow: 0 0 25px rgba(6,200,255,0.3);
          }
          @media (max-width: 640px) {
            .contact-box {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }
          }
          .highlight {
            animation: highlightAnim 2s ease-in-out;
          }
          @keyframes highlightAnim {
            0% { box-shadow: 0 0 15px 3px yellow; transform: scale(1.1); }
            50% { box-shadow: 0 0 25px 5px orange; transform: scale(1.15); }
            100% { box-shadow: 0 0 0 0; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}
