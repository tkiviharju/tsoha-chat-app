import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

function App() {
    const [messages, setMessages] = useState([]);
    const [clientId] = useState(Date.now());
    const [value, setValue] = useState('');
    const webSocket = useRef(null);

    useEffect(() => {
        webSocket.current = new WebSocket(`ws://localhost:8000/ws/${clientId}`);
        webSocket.current.onopen = () => console.log('ws opened');
        webSocket.current.onmessage = (event) => {
            console.log(event);
            const { data } = event;
            setMessages((messages) => messages.concat(data));
        };
        webSocket.current.onclose = () => console.log('ws closed');
        return () => {
            webSocket.current.close();
        };
    }, [clientId]);

    const sendMessage = (event) => {
        event.preventDefault();
        console.log(value);
        webSocket.current.send(value);
        setValue('');
    };

    return (
        <StyledWrapper>
            <h1>Chat app</h1>
            <div>chat id: {clientId}</div>
            <form onSubmit={sendMessage}>
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
            <ul>
                {messages.map((message) => (
                    <li key={message}>{message}</li>
                ))}
            </ul>
        </StyledWrapper>
    );
}

export default App;

const StyledWrapper = styled.div`
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;
