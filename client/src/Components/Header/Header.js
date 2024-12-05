// Header.js
import React, { useContext } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import logo_image from "../../Assets/Logo/logo_blue.png";
import { AppDarkMode } from '../../App'; 

const Header = ({ toggleDarkMode }) => {

  const darkMode = useContext(AppDarkMode)
  return (
    <header className="flex justify-between items-center h-20">
      <div className="relative flex justify-start items-center h-full p-2">
        <img src={logo_image} alt="logo" className="mt-3"/>
      </div>

      <button
        onClick={toggleDarkMode}
        className="p-4 rounded-full focus:outline-none"
      >
        {darkMode ? (
          <SunIcon className="h-6 w-6" />
        ) : (
          <MoonIcon className="h-6 w-6" />
        )}
      </button>
    </header>
  );
};

export default Header;
