import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './views/Home';
import Catalog from './views/Catalog';
import MyBooks from './views/MyBooks';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
          {activeTab === 'catalog' && <Catalog />}
          {activeTab === 'my-books' && <MyBooks />}
        </main>
      </div>
    </div>
  );
}
