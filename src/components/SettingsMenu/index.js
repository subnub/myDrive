import SettingsMenu from "./SettingsMenu";
import {setFiles} from "../../actions/files"
import {setQuickFiles} from "../../actions/quickFiles";
import {setFolders} from "../../actions/folders"
import {resetSelectedItem, setSelected} from "../../actions/selectedItem";
import {startSetStorage} from "../../actions/storage"
import {hideSettings} from "../../actions/settings";
import {startLogout, startLogoutAll} from "../../actions/auth";
import {resetCurrentRoute} from "../../actions/routes"
import env from "../../enviroment/envFrontEnd";
import Swal from "sweetalert2"; 
import axios from "axios";
import {connect} from "react-redux";
import React from "react";

const currentURL = env.url;

class SettingsMenuContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            style: "List (Default)",
            size: "50 (Default)"
        }
    }

    getProgressWidth = () => {
     
        const totalSpace = this.props.storage.total
        const usedSpace = this.props.storage.total - this.props.storage.available;

        const difference = (usedSpace / totalSpace) * 100;

        return difference + "%"
    }

    closeSettings = () => {

        this.props.dispatch(hideSettings());
    }

    setStyle = (e) => {

        const value = e.target.value;

        window.localStorage.setItem("list-style", value)

        this.setState(() => ({
            ...this.state,
            style: value
        }))
    }

    setSize = (e) => {

        const value = e.target.value;

        window.localStorage.setItem("list-size", value)

        this.setState(() => ({
            ...this.state,
            size: value
        }))

    }

    componentDidMount = () => {
        
        const prevStyle = window.localStorage.getItem("list-style");
        const prevSize = window.localStorage.getItem("list-size");

        if (prevSize && prevStyle) {

            this.setState(() => ({
                ...this.state,
                size: prevSize,
                style: prevStyle
            }))

        }  else if (prevStyle) {

            this.setState(() => ({
                ...this.state,
                style: prevStyle
            }))

        } else if (prevSize) {

            this.setState(() => ({
                ...this.state,
                size: prevSize
            }))

        }
    }

    logout = () => {

        this.props.dispatch(resetCurrentRoute())
        this.props.dispatch(setFolders([]));
        this.props.dispatch(setFiles([]));
        this.props.dispatch(setQuickFiles([]));
        this.props.dispatch(hideSettings())
        this.props.dispatch(startLogout())
    }

    logoutAll = () => {

        this.props.dispatch(resetCurrentRoute())
        this.props.dispatch(setFolders([]));
        this.props.dispatch(setFiles([]));
        this.props.dispatch(setQuickFiles([]));
        this.props.dispatch(hideSettings());
        this.props.dispatch(startLogoutAll());
    }

    changePassword = () => {

        Swal.mixin({
            input: 'password',
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
          }).queue([
            {
              title: 'Enter Current Password',
            },
            'Enter New Password',
            'Confirm New Password'
          ]).then((result) => {

            if (result.value.length !== 3) {return}

            if (result.value[1] !== result.value[2]) {

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'New passwords do not match',
                  })

            } else if (result.value[0].length === 0) {

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Enter a new password',
                  })

            } else {

                const config = {
                    headers: {'Authorization': "Bearer " + window.localStorage.getItem("token")}
                };

                const data = {
                    newPassword: result.value[1],
                    oldPassword: result.value[0]
                }
        
                axios.post(currentURL +`/user-service/change-password/`, data, config).then((results) => {
                    
                    const newToken = results.data;
                    window.localStorage.setItem("token", newToken);

                    Swal.fire(
                        'Password Changed',
                        'All other sessions have been logged out',
                        'success'
                      )


                }).catch((err) => {
                    console.log(err)
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error changing password',
                      })
                })

            }

          }).catch((e) => {
              console.log(e)
          })
    }

    infoStyle = () => {

        Swal.fire({
            icon: 'info',
            title: 'Default Style',
            text: 'Changes the default layout of files/folders when the homepage first loads',
           
          })
    }

    infoSize = () => {

        Swal.fire({
            icon: 'info',
            title: 'Default Size',
            text: 'Changes how many files are loaded when the homepage first loads.',
           
          })

    }

    infoLogoutAll = () => {

        Swal.fire({
            icon: 'info',
            title: 'Logout All',
            text: 'Logouts all sessions of this account, also removes all temporary tokens.',
           
          })
    }

    infoDeleteAll = () => {

        Swal.fire({
            icon: 'info',
            title: 'Delete All',
            text: 'Deletes all files and folders, this cannot be undone.',
           
          })
    }

    deleteAll = () => {

        Swal.fire({
            title: 'Delete All?',
            text: "You cannot undo this action.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete all'
          }).then((result) => {
            if (result.value) {

                const headers = {'Authorization': "Bearer " + window.localStorage.getItem("token")}

                axios.delete(currentURL +`/folder-service/remove-all`, {
                    headers
                }).then((results) => {

                    Swal.fire(
                        'Deleted',
                        'All files/folders have been deleted',
                        'success'
                      )
        
                      this.props.dispatch(setFolders([]));
                      this.props.dispatch(setFiles([]));
                      this.props.dispatch(setQuickFiles([]));
                      this.props.dispatch(resetSelectedItem());
                      this.props.dispatch(setSelected(""))
                      this.props.dispatch(startSetStorage())
                })

              
            }
          })
    }

    render() {

        return <SettingsMenu 
                closeSettings={this.closeSettings}
                infoStyle={this.infoStyle}
                setStyle={this.setStyle}
                setSize={this.setSize}
                infoSize={this.infoSize}
                changePassword={this.changePassword}
                logout={this.logout}
                logoutAll={this.logoutAll}
                infoLogoutAll={this.infoLogoutAll}
                deleteAll={this.deleteAll}
                infoDeleteAll={this.infoDeleteAll}
                state={this.state}
                {...this.props} />
    }

}

const connectStateToProp = (state) => ({

    showSettings: state.settings.showSettings,
})

export default connect(connectStateToProp)(SettingsMenuContainer);

