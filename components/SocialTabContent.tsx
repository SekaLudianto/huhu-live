import React from 'react';
import ChatBox from './ChatBox';
import GiftBox from './GiftBox';
import { ChatMessage, GiftMessage } from '../types';

interface SocialTabContentProps {
    latestChatMessage: ChatMessage | null;
    latestGiftMessage: GiftMessage | null;
}

const SocialTabContent: React.FC<SocialTabContentProps> = ({ latestChatMessage, latestGiftMessage }) => {
    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex-1 min-h-0">
                <ChatBox latestMessage={latestChatMessage} />
            </div>
            <div className="flex-1 min-h-0">
                <GiftBox latestGift={latestGiftMessage} />
            </div>
        </div>
    );
};

export default SocialTabContent;
