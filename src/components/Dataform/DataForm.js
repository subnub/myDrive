import FileItem from ".././FileItem";
import FolderItem from ".././FolderItem";
import React from "react";
import QuickAccess from "../QuickAccess";
import ParentBar from "../ParentBar";
import Spinner from "../Spinner";
import SpinnerImage from "../SpinnerImage";

const DataForm = (props) => (
  <div className={props.parent === "/" ? "file__control--panel" : "file__control--panel folder__view"}>
    
    {!props.loading ? 
      <QuickAccess
        fileClick={props.fileClick}
        downloadFile={props.downloadFile}
      /> : undefined  
    }

    {/* style={props.folders.length === 0 ? {} : props.parent === "/" ? {marginTop:"50px", display:"block"} : {display:"block"} */}
    <div className={props.parent === "/" ? "folders__panel" : "folders__panel folders__panel__folder"} style={props.loading ? {display: "none"} : {display:"block"}}>
      <div class="head__folders">
        <h2 className="noSelect">{props.folders.length === 0 ? "No Folders" : "Folders"}</h2>
      </div>

      <div className="inner__folders">
        {props.folders.map((folder) => (
          <FolderItem
            {...folder}
            key={folder._id}
            itemSelected={folder._id === props.selected}
            folderClick={props.folderClick}
            deleteFolder={props.deleteFolder}
          />
        ))}
      </div>
    </div>

    <div className="file__view noSelect">
      

      <div class="recent__table--wrap">


        {props.parent === "/" ? (
        <div class="head__recent--files noSelect" style={props.loading ? {display: "none"} : {}}>
          <h2>{props.search !== "" ? "Files" : "Home Files"}</h2>
          <div class="view__recent">
            <ul>
              <li onClick={props.changeListViewMode}>
                <a style={props.listView ? {color:"#919eab"} : {color:"#3c85ee"}}>
                  <i class="fas fa-th-large"></i>
                </a>
              </li>
              <li onClick={props.changeListViewMode} class="active__view">
                <a style={!props.listView ? {color:"#919eab"} : {color:"#3c85ee"}}>
                  <i class="fas fa-list"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div class="head__recent--files noSelect" style={props.loading ? {display: "none"} : {marginTop: "20px"}}>
            <ParentBar/>
          <div class="view__recent">
            <ul>
              <li>
                <a style={props.listView ? {color:"#919eab"} : {color:"#3c85ee"}} onClick={props.changeListViewMode}>
                  <i class="fas fa-th-large"></i>
                </a>
              </li>
              <li class="active__view">
                <a style={!props.listView ? {color:"#919eab"} : {color:"#3c85ee"}} onClick={props.changeListViewMode}>
                  <i class="fas fa-list"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}


      {!props.listView ? 
      <div className="main__access">

      {props.files.map((file) => (<FileItem
              {...file}
              key={file._id}
              itemSelected={file._id === props.selected}
              downloadFile={props.downloadFile}
              removeFile={props.removeFile}
              fileClick={props.fileClick}
            />))}

      </div>
    
    :

    <table class="recent__table noSelect" style={props.loading ? {display: "none"} : {}}>
          <tr>
            <th class="name__row">
              <select className="sorting__select" onChange={props.onChangeSelect} value={props.sortBy === "alp_desc" || props.sortBy === "alp_asc" ? 'name' : 'date'}>
                <option value="date">Modified</option>
                <option value="name">Name</option>
              </select>
              <a onClick={props.switchSortBy}>
                <img src="/assets/sortarrow.svg" alt="sortarrow" style={props.sortBy === "date_desc" || props.sortBy === "alp_desc" ? {transform: "scaleY(-1)"} : {}}/>
              </a>
            </th>
            <th class="location__row">Location</th>
            <th class="modified__row">Modified</th>
            <th class="settings__row"></th>
          </tr>

          {props.files.map((file) => (
            <FileItem
              {...file}
              key={file._id}
              itemSelected={file._id === props.selected}
              downloadFile={props.downloadFile}
              removeFile={props.removeFile}
              fileClick={props.fileClick}
            />
          ))}
        </table> 
        }

        <div className="dataform-loadmore-files" style={props.loadingMoreItems ? {} : {display: "none"}}>
          <SpinnerImage />
        </div>
  
        {/* {props.loading ? 
        <div className="dataform__spinner__wrapper">
          <Spinner />
        </div> : undefined} */}
        
        {/* */}
      </div>
    </div>
  </div>

);

export default DataForm;
