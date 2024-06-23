import HomePage from "./HomePage";
import { startSetStorage } from "../../actions/storage";
import { startSetQuickFiles, setQuickFiles } from "../../actions/quickFiles";
import {
  resetSelectedItem,
  resetSelected,
  setLastSelected,
  setRightSelected,
} from "../../actions/selectedItem";
import {
  startSetFiles,
  startSetAllItems,
  startSetFileAndFolderItems,
  startResetCache,
} from "../../actions/files";
import { startSetFolders } from "../../actions/folders";
import {
  goneSideBar,
  loadMoreItems,
  setCurrentRouteType,
  setCachedSearch,
} from "../../actions/main";
import {
  setFolderTreeID,
  resetFolderTreeID,
  setFirstLoadDetailsFolderTree,
} from "../../actions/folderTree";
import {
  setParent,
  resetParentList,
  startSetParentList,
  setParentList,
  startResetParentList,
} from "../../actions/parent";
import {
  enableListView,
  setSearch,
  setCurrentlySearching,
  resetCurrentlySearching,
  setIsGoogle,
  setNotGoogle,
} from "../../actions/filter";
import { setCurrentRoute, resetCurrentRoute } from "../../actions/routes";
// import { history } from "../../routers/AppRouter";
import uuid from "uuid";
import { connect } from "react-redux";
import React from "react";
import {
  setStorageSwitcherStorage,
  resetStorageSwitcherStorage,
} from "../../actions/storageSwitcher";
import env from "../../enviroment/envFrontEnd";
import withNavigate from "../HocComponent";

class HomePageContainer extends React.Component {
  constructor(props) {
    super(props);

    this.lastLocationKey = "";

    this.clearCache = false;
  }

  listStyleCheck = () => {
    if (window.localStorage.getItem("list-style") === "List") {
      this.props.dispatch(resetSelected());
      this.props.dispatch(enableListView());
    }
  };

  loginCheck = () => {
    const pathname = this.props.location.pathname;

    if (this.props.isAuthenticated) {
      if (pathname === "/home") {
        this.props.dispatch(setCurrentRouteType("home"));
        this.getFiles(false);
        this.props.dispatch(setParent("/"));
        this.props.dispatch(startResetParentList());
      } else if (pathname.includes("/search")) {
        this.setSearchItems();
        return;
      } else if (pathname.includes("/folder")) {
        this.setFolderItems();
        return;
      }

      this.props.dispatch(resetCurrentRoute());
      this.props.dispatch(startSetStorage());
      this.props.dispatch(resetCurrentlySearching());
      this.props.dispatch(startSetStorage());
    } else {
      // const currentPath = this.props.location.pathname;
      // this.props.dispatch(setCurrentRoute(currentPath));
      // console.log("navigate to login");
      // this.props.navigate("/23123");
    }
  };

  getStorageSwitcherType = (isGoogle, isPersonal) => {
    if (isGoogle) {
      return "drive";
    } else if (isPersonal) {
      return "s3";
    } else {
      return "stripe";
    }
  };

  setFolderItems = (historyKey) => {
    const sortBy = this.props.sortBy;
    const idSplit = this.props.location.pathname.split("/folder/");
    const id = idSplit[1];

    this.props.dispatch(setSearch(""));
    this.props.dispatch(setCurrentRouteType("folder"));
    this.props.dispatch(setQuickFiles([]));
    this.props.dispatch(setLastSelected(0));
    this.props.dispatch(resetSelectedItem());
    this.props.dispatch(resetCurrentlySearching());
    this.props.dispatch(setLastSelected(0));
    this.props.dispatch(resetSelected());
    this.props.dispatch(setParent(id));
    this.props.dispatch(startSetParentList(id));
    this.props.dispatch(loadMoreItems(true));
    // this.props.dispatch(startSetFolders(id, sortBy, undefined, isGoogle));
    // this.props.dispatch(startSetFiles(id, sortBy, undefined, isGoogle));
    this.props.dispatch(
      startSetFileAndFolderItems(historyKey, id, sortBy, undefined)
    );
    this.props.dispatch(setFolderTreeID(id));
    this.props.dispatch(setFirstLoadDetailsFolderTree({ _id: id }));
    this.props.dispatch(setRightSelected(""));
    this.props.dispatch(startSetStorage());
    this.props.dispatch(
      setStorageSwitcherStorage(this.getStorageSwitcherType(false))
    );
    env.uploadMode = this.getStorageSwitcherType(false);
  };

  historyUpdateCheck = () => {
    console.log("history update check");

    const pathname = this.props.location.pathname;

    if (pathname === "/home") {
      this.props.dispatch(setSearch(""));
      this.getFiles();
      this.props.dispatch(startSetStorage());
      this.props.dispatch(resetCurrentlySearching());
      this.props.dispatch(setParent("/"));
      this.props.dispatch(resetParentList());
      this.props.dispatch(startSetStorage());
    } else if (pathname.includes("/folder")) {
      this.setFolderItems();
    } else {
      const currentPathnameSplit = pathname.split("/search/");
      const value = currentPathnameSplit[1];
      const parent = "/";

      this.props.dispatch(setCurrentlySearching());
      this.props.dispatch(setParent(parent));
      this.props.dispatch(loadMoreItems(true));
      this.props.dispatch(startSetFiles(undefined, undefined, value));
      this.props.dispatch(startSetFolders(undefined, undefined, value));
      this.props.dispatch(setParent);
      this.props.dispatch(setParentList(["/"], ["Home"]));
      // this.props.dispatch(setSearch(""))
      this.props.dispatch(startSetStorage());
    }
  };

  componentDidMount = () => {
    window.addEventListener("resize", () => {
      this.props.dispatch(goneSideBar());
    });

    this.listStyleCheck();
    this.loginCheck();
    this.setSessionStorage();
  };

  setSessionStorage = () => {
    window.sessionStorage.setItem("uuid", uuid.v4());
  };

  componentWillUnmount = () => {
    window.removeEventListener("resize", () => {});
  };

  setSearchItems = () => {
    const currentPathname = this.props.location.pathname;

    const currentPathnameSplit = currentPathname.split("/search/");
    const value = currentPathnameSplit[1];

    const fullURL = window.location.href;

    const url = new URL(fullURL);

    const parent = url.searchParams.get("parent") || undefined;
    const storageType = url.searchParams.get("storageType") || undefined;
    const folderSearch = url.searchParams.get("folder_search") || undefined;

    this.props.dispatch(startResetCache());
    this.props.dispatch(setCurrentRouteType("search"));
    this.props.dispatch(setCachedSearch(value));
    this.props.dispatch(setNotGoogle());
    this.props.dispatch(setParent("/"));
    this.props.dispatch(loadMoreItems(true));
    // this.props.dispatch(startSetFiles(parent, undefined, value, undefined, storageType));
    // this.props.dispatch(startSetFolders(parent, undefined, value, undefined, storageType));
    this.props.dispatch(
      startSetFileAndFolderItems(
        "",
        parent,
        undefined,
        value,
        undefined,
        storageType,
        folderSearch
      )
    );
    this.props.dispatch(setCurrentlySearching());
    parent
      ? this.props.dispatch(startSetParentList(parent))
      : this.props.dispatch(setParentList(["/"], ["Home"]));
    this.props.dispatch(setSearch(value));
    this.props.dispatch(startSetStorage());
    this.props.dispatch(resetStorageSwitcherStorage());
    this.props.dispatch(setQuickFiles([]));
    //env.uploadMode = ""
  };

  historyUpdateCheckRefresh = () => {
    const currentPathname = this.props.location.pathname;

    console.log("history update check", this.props.location.key);

    if (
      this.lastLocationKey !== this.props.location.key &&
      currentPathname !== "/home" &&
      currentPathname.includes("/search")
    ) {
      this.setSearchItems();
    } else if (
      this.lastLocationKey !== this.props.location.key &&
      this.props.location.pathnamee !== "/home"
    ) {
      this.setFolderItems(this.props.location.key);
    } else if (this.lastLocationKey !== this.props.location.key) {
      this.props.dispatch(setSearch(""));
      this.props.dispatch(setCurrentRouteType("home"));
      this.props.dispatch(setNotGoogle());
      this.getFiles(this.clearCache);
      this.props.dispatch(startSetStorage());
      this.props.dispatch(resetCurrentlySearching());
      this.props.dispatch(setParent("/"));
      this.props.dispatch(startResetParentList());
      this.props.dispatch(startSetStorage());
      this.props.dispatch(resetFolderTreeID());
      this.props.dispatch(resetStorageSwitcherStorage());
      this.clearCache = false;
      //env.uploadMode = ""
    }

    this.lastLocationKey = this.props.location.key;
  };

  componentDidUpdate = () => {
    this.historyUpdateCheckRefresh();
  };

  getFiles = (clearCache) => {
    const sortBy = this.props.sortBy;

    // this.props.dispatch(startSetQuickFiles())
    // this.props.dispatch(startSetFolders(undefined, sortBy));
    // this.props.dispatch(startSetFiles(parent, sortBy))
    this.props.dispatch(startSetAllItems(clearCache, undefined, sortBy));
  };

  goHome = () => {
    this.clearCache = true;
    this.props.navigate("/home");
  };

  render() {
    return <HomePage goHome={this.goHome} {...this.state} {...this.props} />;
  }
}

const mapStoreToProps = (state) => ({
  sortBy: state.filter.sortBy,
  isAuthenticated: !!state.auth.id,
  photoID: state.photoViewer.id,
});

export default connect(mapStoreToProps)(withNavigate(HomePageContainer));
