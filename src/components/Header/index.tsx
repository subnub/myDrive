import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header>
      <div className="px-6 flex justify-between min-h-[68px] items-center py-[15px]">
        <div className="flex items-center w-[260px]">
          <a
            className="inline-flex items-center justify-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img className="w-[35px]" src="/images/icon.png" alt="logo" />
          </a>
        </div>
        <SearchBar />
        <div className="flex justify-end w-[260px]">
          <div>
            <div>
              <a
                onClick={() => navigate("/settings")}
                className="cursor-pointer"
              >
                <img src="/assets/settings.svg" alt="settings" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
