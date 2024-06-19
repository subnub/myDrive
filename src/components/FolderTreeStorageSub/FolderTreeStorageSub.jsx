import React from "react";
import { useNavigate } from "react-router-dom";

const FolderTreeStorageSub = (props) => {
  const navigate = useNavigate();

  const folderOnClick = () => {
    navigate(`/folder/${props.folder._id}`);
  };

  return (
    <div className="folder-tree-sub__storage">
      <div className="folder-tree-sub__storage__box">
        <div className="folder-tree-sub__storage__image-div">
          <img
            onClick={(e) => {
              props.skipUpdate = false;
              props.clickEvent(e);
            }}
            className="folder-tree-sub__storage__image"
            src="/assets/arrowstructure.svg"
            style={props.state.open ? { transform: "rotate(90deg)" } : {}}
          />
        </div>
        <div className="folder-tree-sub__icon-wrapper">
          <img
            className="folder-tree-sub__icon"
            src={
              props.selectedID === props.folder._id
                ? "/images/folder-svg-purple.svg"
                : "/images/folder-svg.svg"
            }
          />
        </div>
        <div className="folder-tree-sub__storage__text-div">
          <p
            style={
              props.selectedID === props.folder._id ? { color: "#3c85ee" } : {}
            }
            onClick={folderOnClick}
            className="folder-tree-sub__storage__text"
          >
            {props.folder.name}
          </p>
        </div>
      </div>

      <div className="folder-tree-sub__storage-subview">
        <div className="folder-tree-sub__storage-subview-box">
          {props.state.open ? props.renderFolders() : undefined}
        </div>
      </div>
    </div>
  );
};

export default FolderTreeStorageSub;
