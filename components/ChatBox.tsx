import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface ChatBoxProps {
    latestMessage: ChatMessage | null;
    owners: Set<string>;
    moderators: Set<string>;
}

const ChatBox: React.FC<ChatBoxProps> = ({ latestMessage, owners, moderators }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (latestMessage) {
            setMessages(prev => {
                const newMessages = [latestMessage, ...prev];
                // Keep only the first 100 messages (the newest ones)
                return newMessages.slice(0, 100);
            });
        }
    }, [latestMessage]);

    const generateUsernameLink = (data: ChatMessage) => {
        return <a className="text-cyan-400 hover:underline" href={`https://www.tiktok.com/@${data.uniqueId}`} target="_blank" rel="noopener noreferrer">{data.nickname}</a>;
    };

    return (
        <div className="bg-gray-700/50 p-2 flex flex-col h-full">
            <h3 className="text-lg font-bold text-center text-white mb-2 flex-shrink-0">Obrolan Langsung</h3>
            <div className="flex-grow overflow-y-auto pr-2 space-y-3" ref={containerRef}>
                {messages.map((msg, index) => {
                    const uniqueIdLower = msg.uniqueId.toLowerCase();
                    const isOwner = owners.has(uniqueIdLower);
                    const isModerator = moderators.has(uniqueIdLower);

                    return (
                        <div key={index} className="bg-gray-800/50 p-2 rounded-lg flex items-start text-sm">
                            <img className="w-8 h-8 rounded-full mr-3 flex-shrink-0" src={msg.profilePictureUrl} alt={msg.nickname} />
                            <div className="flex-1 text-gray-200">
                                <div className="font-bold">
                                    {generateUsernameLink(msg)}
                                    {isOwner && <span className="ml-1.5 text-yellow-400" title="Owner">👑</span>}
                                    {!isOwner && isModerator && <span className="ml-1.5 text-cyan-400" title="Moderator">🛡️</span>}
                                    :
                                </div>
                                <div className="break-all text-white">{msg.comment}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatBox;