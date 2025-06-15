import React, { useState } from "react";
import ChatInbox from "../components/chat/ChatInbox";
import ChatBox from "../components/chat/ChatBox";
import { useAuthSessionQuery } from "../django-allauth/sessions/hooks";
import { Infor, User } from "../components/interface_type";
import SearchUser from "../components/chat/SearchUser";
import { useLocation } from "react-router-dom";


const ChatPage: React.FC = () => {
    const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
    const userId = authData?.user?.id;
    const isAuthenticated = authData?.isAuthenticated;
    const location = useLocation();
    const initialPartner = location.state;
    const [partnerId, setPartnerId] = useState<number | null>(initialPartner?.id ?? null);
    const [partnerImage, setPartnerImage] = useState<string | File | null>(initialPartner?.image ?? null);
    const [partnerFullName, setPartnerFullName] = useState<string | null>(initialPartner?.full_name ?? null);
    const [partnerProfile, setPartnerProfile] = useState<User | null>(null);
    const [inboxRefresh, setInboxRefresh] = useState(0);
    const handleNewMessage = () => setInboxRefresh(prev => prev + 1);
    if (authLoading) return <div>Đang tải...</div>;
    if (!isAuthenticated || !userId) return <div>Bạn cần đăng nhập để sử dụng chat.</div>;
    const handleSelectUser = (partner: {
        id: number;
        image?: string | File | null;
        full_name?: string | null;
        profile?: User | null;
    }) => {
        setPartnerId(partner.id);
        setPartnerImage(partner.image ?? null);
        setPartnerFullName(partner.full_name ?? null);
        setPartnerProfile(partner.profile ?? null);
    };

    return (
        <div className="flex flex-row gap-[1.5rem] mt-[4rem] mb-[.5rem] h-[calc(100vh-5.05rem)] pr-[1rem]">
            <div className="w-[17rem] shadow-lg pl-[1rem] p-[0.5rem]">
                <h1 className="text-[#228B22] mb-[1rem] font-bold text-2xl">Chat</h1>
                <SearchUser onSelect={handleSelectUser} excludeId={userId} />
                <hr className="my-2" />
                {/* <ChatInbox userId={userId} onSelect={id => { setPartnerId(id); setPartnerProfile(null); }} /> */}
                <ChatInbox userId={userId} onSelect={handleSelectUser} refresh={inboxRefresh} />
            </div>
            <div className="flex-1 shadow-lg ">
                {partnerId ? (
                    <ChatBox userId={userId} partnerId={partnerId} partnerImage={partnerImage ?? undefined} partnerFullName={partnerFullName ?? undefined} onNewMessage={handleNewMessage} />
                ) : (
                    <div className="flex items-center justify-center h-full">Chọn một hội thoại để bắt đầu chat</div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;