import { FileInterface } from "../types/file";
import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";
import { FolderInterface } from "../types/folders";

interface MainSecionType {
  type: "" | "quick-item" | "file" | "folder";
  id: string;
  file: FileInterface | null;
  folder: FolderInterface | null;
}

type MoveStateType = {
  type: "" | "file" | "folder" | "multi-select";
  file: FileInterface | null;
  folder: FolderInterface | null;
};

export interface SelectedStateType {
  mainSection: MainSecionType;
  popupModal: {
    type: "" | "quick-item" | "file";
    file: FileInterface | null;
  };
  multiSelectMode: boolean;
  multiSelectMap: {
    [key: string]: MainSecionType;
  };
  multiSelectCount: number;
  shareModal: {
    file: FileInterface | null;
  };
  moveModal: MoveStateType;
  navigationMap: {
    [key: string]: {
      url: string;
      scrollTop: number;
    };
  };
}

const initialState: SelectedStateType = {
  mainSection: {
    type: "",
    id: "",
    file: null,
    folder: null,
  },
  popupModal: {
    type: "",
    file: null,
  },
  multiSelectMode: false,
  multiSelectMap: {},
  multiSelectCount: 0,
  shareModal: {
    file: null,
  },
  moveModal: {
    type: "",
    file: null,
    folder: null,
  },
  navigationMap: {},
};

const selectedSlice = createSlice({
  name: "selected",
  initialState,
  reducers: {
    setMainSelect: (state, action: PayloadAction<MainSecionType>) => {
      state.mainSection = action.payload;
    },
    resetSelected: () => initialState,
    setMultiSelectMode: (state, action: PayloadAction<MainSecionType[]>) => {
      const currentSelection = { ...state.mainSection };
      state.mainSection = { type: "", id: "", file: null, folder: null };

      const selects = action.payload;

      const selectsIds = selects.map((select) => select.id);

      for (const select of selects) {
        if (
          state.multiSelectMap[select.id] &&
          state.multiSelectMap[select.id].type !== select.type
        ) {
          state.multiSelectMode = true;
          state.multiSelectMap[select.id] = select;
        } else if (state.multiSelectMap[select.id]) {
          delete state.multiSelectMap[select.id];
          const newCount = state.multiSelectCount - 1;
          if (newCount === 0) {
            state.multiSelectMode = false;
          }
          state.multiSelectCount = newCount;
        } else {
          state.multiSelectMode = true;
          state.multiSelectMap[select.id] = select;
          state.multiSelectCount++;
        }
      }

      if (
        currentSelection.id !== "" &&
        !selectsIds.includes(currentSelection.id)
      ) {
        state.multiSelectMap[currentSelection.id] = currentSelection;
        state.multiSelectCount++;
      }
    },
    resetMultiSelect: (state) => {
      state.multiSelectMode = false;
      state.multiSelectMap = {};
      state.multiSelectCount = 0;
    },
    setPopupSelect: (
      state,
      action: PayloadAction<{
        type: "quick-item" | "file";
        file: FileInterface;
      }>
    ) => {
      state.popupModal = {
        type: action.payload.type,
        file: action.payload.file,
      };
    },
    resetPopupSelect: (state) => {
      state.popupModal = {
        type: "",
        file: null,
      };
    },
    setShareModal: (state, action: PayloadAction<FileInterface>) => {
      state.popupModal = {
        type: "",
        file: null,
      };
      state.shareModal = {
        file: action.payload,
      };
    },
    resetShareModal: (state) => {
      state.shareModal = {
        file: null,
      };
    },
    setMoveModal: (state, action: PayloadAction<MoveStateType>) => {
      state.moveModal = action.payload;
    },
    resetMoveModal: (state) => {
      state.moveModal = {
        type: "",
        file: null,
        folder: null,
      };
    },
    addNavigationMap: (
      state,
      action: PayloadAction<{
        url: string;
        scrollTop: number;
      }>
    ) => {
      const navigationMap = state.navigationMap;
      navigationMap[action.payload.url] = {
        url: action.payload.url,
        scrollTop: action.payload.scrollTop,
      };
      state.navigationMap = navigationMap;
    },
    removeNavigationMap: (state, action: PayloadAction<string>) => {
      const navigationMap = state.navigationMap;
      delete navigationMap[action.payload];
      state.navigationMap = navigationMap;
    },
  },
});

export const {
  setMainSelect,
  resetSelected,
  setMultiSelectMode,
  resetMultiSelect,
  setPopupSelect,
  resetPopupSelect,
  setShareModal,
  resetShareModal,
  setMoveModal,
  resetMoveModal,
  addNavigationMap,
  removeNavigationMap,
} = selectedSlice.actions;

export default selectedSlice.reducer;
