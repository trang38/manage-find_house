import { Link } from "react-router-dom";
import { useAuthSessionQuery } from "../django-allauth/sessions/hooks";

export default function Header() {
    const { data, isLoading } = useAuthSessionQuery();
    return (
        <div className="h-[30px] bg-[#39ff14] text-[#fff] flex  flex-row items-center justify-between">
            <div></div>
            <div className="flex flex-row gap-[10px]">
                <Link to={"/"}>Home</Link>
                {isLoading ? (
                <span>Loading...</span>
                ) : data?.isAuthenticated ? (
                <Link to="/profile/me" className="hover:underline">
                    {data.user?.username || "Profile"}
                </Link>
                ) : (
                <Link to="/auth/login" className="hover:underline">Login</Link>
                )}
            </div>
        </div>
    )
}