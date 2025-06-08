import React, { useState } from "react";
import ChatInbox from "../components/ChatInbox";
import ChatBox from "../components/ChatBox";
import { useAuthSessionQuery } from "../django-allauth/sessions/hooks";
import { Infor, User } from "../components/interface_type";
import SearchUser from "../components/SearchUser";


const ChatPage: React.FC = () => {
    const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
    const userId = authData?.user?.id;
    const isAuthenticated = authData?.isAuthenticated;
    console.log("ChatPage authData:", authData);
    console.log("ChatPage isAuthenticated:", isAuthenticated);

    console.log("ChatPage userId:", userId);
    const [partnerId, setPartnerId] = useState<number | null>(null);
    const [partnerImage, setPartnerImage] = useState<string | File | null>(null);
    const [partnerFullName, setPartnerFullName] = useState<string | null>(null);
    const [partnerProfile, setPartnerProfile] = useState<User | null>(null);

    if (authLoading) return <div>Đang tải...</div>;
    if (!isAuthenticated || !userId) return <div>Bạn cần đăng nhập để sử dụng chat.</div>;
    // const handleSelectUser = (user: Infor) => {
    //     setPartnerId(user.user?.id ?? null);
    //     setPartnerImage(user.image ?? null);
    //     setPartnerFullName(user.full_name ?? null);
    //     setPartnerProfile(user.user ?? null);
    // };
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
            <div className="w-[17rem] shadow-md pl-[1rem] p-[0.5rem]">
                <h1 className="text-[#228B22] mb-[1rem] font-bold text-2xl">Chat</h1>
                <SearchUser onSelect={handleSelectUser} excludeId={userId} />
                <hr className="my-2" />
                {/* <ChatInbox userId={userId} onSelect={id => { setPartnerId(id); setPartnerProfile(null); }} /> */}
                <ChatInbox userId={userId} onSelect={handleSelectUser} />
            </div>
            <div className="flex-1 shadow-md ">
                {partnerId ? (
                    <ChatBox userId={userId} partnerId={partnerId}  partnerImage={partnerImage ?? undefined} partnerFullName={partnerFullName ?? undefined}/>
                ) : (
                    <div className="flex items-center justify-center h-full">Chọn một hội thoại để bắt đầu chat</div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;