import { useState } from "react";

export default function App() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Welcome! Type a message to update the roster." }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", text: input };
    setMessages([...messages, userMessage]);

    try {
      const res = await fetch("https://lambdabot100.onrender.com/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      const botReply = data.success
        ? data.message
        : `Error: ${data.error || 'Something went wrong'}`;
      setMessages(prev => [...prev, { role: "bot", text: botReply }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Server error." }]);
    }

    setInput("");
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Fraternity Roster Chatbot</h2>
      <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.role === "user" ? "right" : "left" }}>
            <div style={{
              display: "inline-block", padding: "8px 12px", margin: "4px 0",
              background: m.role === "user" ? "#007aff" : "#ddd",
              color: m.role === "user" ? "white" : "black",
              borderRadius: 12
            }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <input
          style={{ flex: 1, padding: 10 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} style={{ padding: "0 20px" }}>Send</button>
      </div>
    </div>
  );
}
