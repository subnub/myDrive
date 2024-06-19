import React from "react";;
import FolderTree from "./FolderTree";

class FolderTreeContrainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            hideFolderTree: false,
            showFolderTreeScrollBars: false
        }
    }

    componentDidMount = () => {

        //folder-tree__box-hide-scroll-bars

        const hideFolderTree = localStorage.getItem("hide-folder-tree");
        const showFolderTreeScrollBars = localStorage.getItem("show-folder-tree-scroll-bars")

        //console.log("show folder tree scroll bars");

        if (hideFolderTree) {

            this.setState(() => ({
                hideFolderTree,
            }))

        } else {

            this.setState(() => ({
                showFolderTreeScrollBars
            }))
        }
    }

    render() {
        
        if (this.state.hideFolderTree) return <div></div>

        return <FolderTree state={this.state}/>
    }
}

export default FolderTreeContrainer;