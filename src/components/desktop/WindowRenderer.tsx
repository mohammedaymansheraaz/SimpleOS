import React from 'react';
import { WindowState } from '../../types/os';
import { useOS } from '../../context/OSContext';
import { FileExplorer } from '../apps/FileExplorer';
import { AppStore } from '../apps/AppStore';
import { WebBrowser } from '../apps/WebBrowser';
import { TextEditor } from '../apps/TextEditor';
import { PaintApp } from '../apps/PaintApp';
import { TerminalApp } from '../apps/TerminalApp';
import { CalculatorApp } from '../apps/CalculatorApp';
import { MediaPlayer } from '../apps/MediaPlayer';
import { TaskManager } from '../apps/TaskManager';
import { SettingsApp } from '../apps/SettingsApp';
import { StorageManagerApp } from '../apps/StorageManagerApp';
import { SystemRegistryApp } from '../apps/SystemRegistryApp';
import { StickyNotes } from '../apps/StickyNotes';
import { SnakeGame } from '../apps/SnakeGame';
import { Game2048 } from '../apps/Game2048';
import { PomodoroApp } from '../apps/PomodoroApp';
import { ClockApp } from '../apps/ClockApp';
import { CalendarApp } from '../apps/CalendarApp';
import { WeatherApp } from '../apps/WeatherApp';
import { CameraApp } from '../apps/CameraApp';
import { GenericWebApp } from '../apps/GenericWebApp';

interface WindowRendererProps {
  window: WindowState;
}

export const WindowRenderer: React.FC<WindowRendererProps> = ({ window: win }) => {
  const { installedApps } = useOS();

  switch (win.appId) {
    case 'files':
    case 'file-explorer':
      return <FileExplorer initialFolderId={win.extraProps?.folderId || win.params?.currentFolderId} />;

    case 'browser':
    case 'web-browser':
      return <WebBrowser initialUrl={win.extraProps?.url || win.params?.initialUrl} />;

    case 'appstore':
    case 'app-store':
      return <AppStore />;

    case 'editor':
    case 'text-editor':
      return <TextEditor fileId={win.extraProps?.fileId || win.params?.fileId} filePath={win.extraProps?.filePath || win.params?.filePath} />;

    case 'paint':
      return <PaintApp imageContent={win.extraProps?.imageContent || win.params?.imageContent} />;

    case 'terminal':
      return <TerminalApp />;

    case 'calc':
    case 'calculator':
      return <CalculatorApp />;

    case 'clock':
      return <ClockApp />;

    case 'calendar':
      return <CalendarApp />;

    case 'weather':
      return <WeatherApp />;

    case 'camera':
      return <CameraApp />;

    case 'media':
    case 'media-player':
      return <MediaPlayer />;

    case 'tasks':
    case 'task-manager':
      return <TaskManager />;

    case 'settings':
      return <SettingsApp />;

    case 'storage-manager':
      return <StorageManagerApp />;

    case 'system-registry':
      return <SystemRegistryApp />;

    case 'stickynotes':
    case 'sticky-notes':
      return <StickyNotes />;

    case 'snake':
    case 'app-snake':
      return <SnakeGame />;

    case 'game2048':
    case 'app-2048':
      return <Game2048 />;

    case 'pomodoro':
    case 'app-pomodoro':
      return <PomodoroApp />;

    default: {
      // Look up in installed apps (e.g. web apps or custom URLs)
      const manifest = installedApps.find(a => a.id === win.appId);
      if (manifest && manifest.type === 'web-url') {
        return <GenericWebApp manifest={manifest} urlOverride={win.extraProps?.url || win.params?.url} />;
      }
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-stone-400 text-xs">
          <div className="font-semibold text-stone-300 mb-1">{win.title}</div>
          <div>Application `{win.appId}` is loaded and running.</div>
        </div>
      );
    }
  }
};
