import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Button } from '@material-ui/core';

function App() {
    const [messages, setMessages] = useState([]);
    const [channels, setChannels] = useState([]);
    const [currentChannel, setCurrentChannel] = useState(null);
    const [username, setUsername] = useState(
        `user_${Date.now().toString().substring(7)}`
    );
    const [user, setUser] = useState(null);
    const [messageValue, setMessageValue] = useState('');
    const webSocket = useRef(null);

    const fetchData = async (path, setState) => {
        const { data } = await axios.get(`http://localhost:8000${path}`);
        if (data) {
            console.log(data);
            setState(data);
        }
    };

    function updateScroll() {
        const element = document.getElementById('channel');
        element.scrollTop = element.scrollHeight;
    }

    useEffect(() => {
        fetchData('/channels', setChannels);
        const user = localStorage.getItem('chatUser');
        if (user) {
            setUser(JSON.parse(user));
        }
    }, []);

    useEffect(() => {
        updateScroll();
    }, [messages]);

    useEffect(() => {
        if (!currentChannel && channels?.length) {
            setCurrentChannel(channels?.[0]);
        }
    }, [channels]);

    useEffect(() => {
        if (currentChannel) {
            fetchData(`/channels/${currentChannel.id}/messages`, setMessages);
        }
    }, [currentChannel]);

    useEffect(() => {
        if (user && currentChannel) {
            localStorage.setItem('chatUser', JSON.stringify(user));
            console.log(user);
            webSocket.current = new WebSocket(
                `ws://localhost:8000/ws/${currentChannel.id}`
            );
            webSocket.current.onopen = () => console.log('ws opened');
            webSocket.current.onmessage = (event) => {
                console.log(event);
                const { data } = event;
                const { username, content, channel_id, created } = JSON.parse(
                    data
                );
                // console.log(data);
                setMessages((messages) =>
                    messages.concat({ username, content, channel_id, created })
                );
                updateScroll();
            };
            webSocket.current.onclose = () => console.log('ws closed');
            return () => {
                webSocket.current.close();
            };
        }
    }, [user, currentChannel]);

    const sendMessage = (event) => {
        event.preventDefault();
        if (messageValue && user) {
            webSocket.current.send(
                JSON.stringify({
                    content: `${messageValue}`,
                    user_id: user.id,
                    username: user.username,
                })
            );
            setMessageValue('');
        }
    };

    const updateUser = async (event) => {
        if (event) event.preventDefault();
        const {
            data: { id },
        } = await axios.post('http://localhost:8000/users', {
            username,
        });
        fetchData(`/users/${id}`, setUser);
    };

    const handleChannelClick = (event, channel) => {
        setCurrentChannel(channel);
    };

    const handleKeyDown = (event) => {
        if (event.keyCode === 13 && !event.shiftKey) {
            sendMessage(event);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <StyledWrapper>
            <StyledSidebar>
                <div>
                    <div>Username:</div>
                    {user ? (
                        <StyledRow>
                            <StyledName>{user.username}</StyledName>
                            <StyledLogout onClick={handleLogout}>
                                logout
                            </StyledLogout>
                        </StyledRow>
                    ) : (
                        <StyledUserNameForm onSubmit={updateUser}>
                            <StyledInput
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <StyledSmallButton type="submit">
                                Create
                            </StyledSmallButton>
                        </StyledUserNameForm>
                    )}
                </div>
                <StyledList>
                    {channels.map((channel) => {
                        return (
                            <StyledListedChannel
                                onClick={(event) =>
                                    handleChannelClick(event, channel)
                                }
                                key={channel.id}
                                current={currentChannel?.name === channel?.name}
                            >
                                {channel?.name || ''}
                            </StyledListedChannel>
                        );
                    })}
                </StyledList>
            </StyledSidebar>
            <StyledContainer>
                <StyledChannelInfo>
                    <h1>{currentChannel?.name || ''}</h1>
                </StyledChannelInfo>
                <StyledChannel id="channel">
                    <StyledMessages>
                        {messages
                            .filter((message) => {
                                console.log(message);
                                return message.channel_id === currentChannel.id;
                            })
                            .map((message) => {
                                const date = new Date(message.created);
                                const datetime = `${date.getDate()}.${date.getMonth()}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
                                return (
                                    <li
                                        key={message.id}
                                    >{`${datetime} <${message.username}>: ${message.content}`}</li>
                                );
                            })}
                    </StyledMessages>
                </StyledChannel>
                <StyledInputFormWrapper>
                    <StyledForm onSubmit={sendMessage}>
                        <StyledTextarea
                            value={messageValue}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setMessageValue(e.target.value)}
                        />
                        <StyledButton
                            disabled={!(messageValue && user)}
                            type="submit"
                        >
                            Send
                        </StyledButton>
                    </StyledForm>
                </StyledInputFormWrapper>
            </StyledContainer>
        </StyledWrapper>
    );
}

export default App;

const backgroundGray = '#2e3136';
const backgroundGrayLight = '#36393f';

const StyledWrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    max-height: 100vh;
    background: ${backgroundGray};
    color: #f5f5f5;
`;

const StyledContainer = styled.div`
    height: 100%;
    width: 100%;
    max-height: 100vh;
    overflow-y: scroll;
    position: relative;
`;

const StyledSidebar = styled.div`
    width: 300px;
    height: 100%;
    padding: 20px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    box-shadow: rgba(0, 0, 0, 0.11) 0 3px 3px;
`;

const StyledName = styled.div`
    font-size: 12px;
    margin: 5px 0;
`;

const StyledLogout = styled.div`
    font-size: 12px;
    margin: 5px 0 5px 10px;
    cursor: pointer;
`;

const StyledChannelInfo = styled.div`
    width: 100%;
    height: 100px;
    padding: 0 20px;
    position: absolute;
    top: 0;
    background: ${backgroundGrayLight};
    display: flex;
    align-items: center;
    box-shadow: rgba(0, 0, 0, 0.11) 0px 3px 3px;

    h1 {
        color: #43b581;
        :before {
            content: '#';
        }
    }
`;

const StyledList = styled.ul`
    width: 100%;
    font-size: 12px;
    list-style: none;
    padding: 0;

    li {
        margin: 5px 0;
    }
`;

const StyledMessages = styled(StyledList)`
    padding: 80px 0 60px;
`;

const StyledListedChannel = styled.li`
    cursor: pointer;
    width: 100%;
    border-radius: 5px;
    font-size: 14px;
    padding: 5px;
    margin: 8px 0;
    background: ${(props) => (props.current ? backgroundGrayLight : 'initial')};
    :before {
        content: '#';
    }
`;

const StyledTextarea = styled.textarea`
    padding: 5px 10px;
    border-radius: 3px;
    border: 0;
    width: 600px;
    max-width: 50%;
    resize: none;
    background: #f5f5f5;
    outline: none;
`;

const StyledChannel = styled.div`
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    background: ${backgroundGrayLight};
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow-y: auto;
`;

const StyledInputFormWrapper = styled.div`
    position: absolute;
    bottom: 0;
    height: 80px;
    padding: 0 20px;
    width: 100%;
    background: ${backgroundGrayLight};
    display: flex;
    box-shadow: rgba(0, 0, 0, 0.11) -5px -3px 3px;
`;

const StyledInput = styled.input`
    padding: 5px 10px;
    border-radius: 3px;
    width: 80px;
    border: 0;
    background: #f5f5f5;
    outline: none;
`;

const StyledForm = styled.form`
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
`;

const StyledButton = styled(Button)`
    &&& {
        background-color: #43b581;
        text-transform: none;
        margin-left: 20px;
        padding: 3px 20px;
    }
`;

const StyledSmallButton = styled(StyledButton)`
    &&& {
        font-size: 12px;
        padding: 0;
        margin-left: 10px;
    }
`;

const StyledUserNameForm = styled.form`
    display: flex;
    margin-top: 5px;
`;

const StyledRow = styled.div`
    display: flex;
    padding: 3px 0;
    align-items: center;
    justify-content: space-between;
`;
