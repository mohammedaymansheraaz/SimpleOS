import React, { useEffect } from 'react';
import { OSProvider, useOS } from './context/OSContext';
import { Desktop } from './components/desktop/Desktop';
import { Taskbar } from './components/desktop/Taskbar';
import { WindowFrame } from './components/window/WindowFrame';
import { WindowRenderer } from './components/desktop/WindowRenderer';
import { ContextMenu } from './components/desktop/ContextMenu';
import { NotificationToasts } from './components/notifications/NotificationToasts';
import { LockScreen } from './components/desktop/LockScreen';
import { GlobalSearchOverlay } from './components/desktop/GlobalSearchOverlay';

const SimpleOSRoot: React.FC = () => {
  const { windows, closeContextMenu, isSearchOpen, closeSearch } = useOS();

  // Dismiss context menu on click anywhere outside
  useEffect(() => {
    const handleClick不易 = () => {
      closeContextMenu();
    };
    window.addEventListener('click', handleClick不易);
    return () => window.removeEventListener('click', handleClick不易);
  }, [closeContextMenu]);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-sans bg-[#080808] text-stone-100">
      {/* Desktop Workspace */}
      <Desktop />

      {/* Active Windows Layer */}
      {windows.map((win) => (
        <WindowFrame key={win.id} window={win}>
          <WindowRenderer window={win} />
        </WindowFrame>
      ))}

      {/* Global Taskbar & System Tray */}
      <Taskbar />

      {/* OS Context Menu */}
      <ContextMenu />

      {/* Notification Toast Stack */}
      <NotificationToasts />

      {/* Global File & App Search Overlay (Super+K) */}
      <GlobalSearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />

      {/* System Lock & Login Screen */}
      <LockScreen />
    </div>
  );
};

export function App() {
  return (
    <OSProvider>
      <SimpleOSRoot />
    </OSProvider>
  );
}

export default App;
