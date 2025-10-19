// frontend/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import ProjectCard from './ProjectCard'; // Import the new component
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you find a property today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for the chat window to enable auto-scrolling
  const chatWindowRef = useRef(null);

  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://nobrokerage-com-ai-chat-interface.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Create the bot's response message object
      const botMessage = {
        text: data.reply,
        isBot: true,
        projects: data.results || [], // Attach the project results
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = { text: "Sorry, I'm having trouble connecting to the server. Please try again later.", isBot: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message-container ${msg.isBot ? 'bot' : 'user'}`}>
            <div className={`message ${msg.isBot ? 'bot' : 'user'}`}>
              <p>{msg.text}</p>
            </div>
            {/* If the message is from the bot and has projects, render them */}
            {msg.isBot && msg.projects && msg.projects.length > 0 && (
              <div className="projects-container">
                {msg.projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message bot"><p><i>Thinking...</i></p></div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., 3BHK in Pune under 2.3 Cr"
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>Send</button>
      </div>
    </div>
  );
}

export default App;