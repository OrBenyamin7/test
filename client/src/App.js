// App.js
import React, { createContext, useState } from 'react';
import Header from './Components/Header/Header';
import Body from './Components/Body/Body';
import Footer from './Components/Footer/Footer';
import './App.css';
import './index.css';

export const AppDarkMode = createContext()

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AppDarkMode.Provider value = {darkMode} >
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
        <Header toggleDarkMode={toggleDarkMode} />
        <Body />
        <Footer />
      </div>
    </AppDarkMode.Provider>
  );
}

export default App;
