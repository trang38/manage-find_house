import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#fff] text-[#333] pt-[1rem] mt-auto border-t-[1px]">
      <div className="mx-auto px-[5rem] flex flex-col justify-between items-center gap-4">
        <div className="flex flex-row justify-between w-full">
          <div className="flex gap-4 text-sm flex-col">
            <div className="flex flex-row items-center">
              <Link to={"/"}><img src={process.env.PUBLIC_URL + "/logo2.png"} alt="" className="h-[4rem] rounded-xl overflow-hidden"/></Link>
              <p className="font-bold text-[#00b14f] uppercase ml-[2rem]">Manage & Find boarding houses</p>
            </div>
            <Link to="/about" className="hover:underline">About</Link>
          </div>
          <Link to="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="shadow-md w-[2rem] h-[2rem] flex items-center justify-center rounded-md"><img src={process.env.PUBLIC_URL + "/up-arrow.png"} alt="" className="h-[1.5rem]"/></Link>
        </div>

        <div className="text-sm mt-[1rem]">
          &copy; {new Date().getFullYear()} The system for managing and finding boarding house. All rights reserved.
        </div>
      </div>
    </footer>
  );
}