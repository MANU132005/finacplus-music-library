declare module 'music_library/MusicLibraryApp' {
  import React from 'react';
  interface MusicLibraryAppProps {
    userRole?: 'admin' | 'user';
    toast?: {
      success: (msg: string) => void;
      error: (msg: string) => void;
      info: (msg: string) => void;
    };
  }
  const MusicLibraryApp: React.ComponentType<MusicLibraryAppProps>;
  export default MusicLibraryApp;
}
