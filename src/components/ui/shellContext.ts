import { createContext, useContext } from 'react';

/** True for pages rendered inside the signed-in app (with its own navigation bar). */
export const InAppShell = createContext(false);
export const useInAppShell = () => useContext(InAppShell);
