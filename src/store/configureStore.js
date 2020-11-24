import {createStore, combineReducers, applyMiddleware} from "redux"
import thunk from "redux-thunk";
import authReducer from "../reducers/auth";
import mainReducer from "../reducers/main";
import fileReducer from "../reducers/files"
import folderReducer from "../reducers/folders"
import filterReducer from "../reducers/filter";
import selectedItemReducer from "../reducers/selectedItem";
import uploadsReducer from "../reducers/uploads";
import storageReducer from "../reducers/storage";
import quickFilesReducer from "../reducers/quickFiles";
import popupFilesReducer from "../reducers/popupFile";
import settingsReducer from "../reducers/settings";
import parentReducer from "../reducers/parent";
import addOptionsReducer from "../reducers/addOptions";
import photoViewerReducer from "../reducers/photoViewer";
import routesReducer from "../reducers/routes";
import moverReducer from "../reducers/mover";
import folderTreeReducer from "../reducers/folderTree"
import uploadStorageSwitcherReducer from "../reducers/uploadStorageSwitcher";
import mobileContextMenuReducer from "../reducers/mobileContextMenu";

//const composeEnchancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {

    const store = createStore(
        combineReducers({
            auth: authReducer,
            main:mainReducer,
            files: fileReducer,
            folders: folderReducer,
            filter: filterReducer,
            selectedItem: selectedItemReducer,
            uploads: uploadsReducer,
            storage: storageReducer,
            quickFiles: quickFilesReducer,
            popupFile: popupFilesReducer,
            settings: settingsReducer,
            parent: parentReducer,
            addOptions: addOptionsReducer,
            photoViewer: photoViewerReducer,
            routes: routesReducer,
            mover: moverReducer,
            folderTree: folderTreeReducer,
            storageSwitcher: uploadStorageSwitcherReducer,
            mobileContextMenu: mobileContextMenuReducer,
        }),

        applyMiddleware(thunk)
        //composeEnchancers(applyMiddleware(thunk))
    )

    return store; 
}