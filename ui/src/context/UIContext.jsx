import React, { createContext, useContext, useMemo, useReducer } from 'react';

const UIStateContext = createContext(null);
const UIDispatchContext = createContext(null);

const initialState = {
  mobileSidebarOpen: false,
  selectedAcademicYearId: localStorage.getItem('selectedAcademicYearId') || '',
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'OPEN_MOBILE_SIDEBAR':
      return { ...state, mobileSidebarOpen: true };
    case 'CLOSE_MOBILE_SIDEBAR':
      return { ...state, mobileSidebarOpen: false };
    case 'TOGGLE_MOBILE_SIDEBAR':
      return { ...state, mobileSidebarOpen: !state.mobileSidebarOpen };
    case 'SET_ACADEMIC_YEAR':
      return { ...state, selectedAcademicYearId: action.payload || '' };
    default:
      return state;
  }
};

export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);
  const stateValue = useMemo(() => state, [state]);

  return (
    <UIStateContext.Provider value={stateValue}>
      <UIDispatchContext.Provider value={dispatch}>
        {children}
      </UIDispatchContext.Provider>
    </UIStateContext.Provider>
  );
};

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useUIState must be used within UIProvider');
  }
  return context;
};

export const useUIDispatch = () => {
  const context = useContext(UIDispatchContext);
  if (!context) {
    throw new Error('useUIDispatch must be used within UIProvider');
  }
  return context;
};
