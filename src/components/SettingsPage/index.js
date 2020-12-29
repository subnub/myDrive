import React from "react";
import Header from "../Header/index";
import axios from "../../axiosInterceptor"
import env from "../../enviroment/envFrontEnd";
import Swal from "sweetalert2"
import bytes from "bytes";
import moment from "moment"
import capitalize from "../../utils/capitalize";
import { resetCurrentRoute } from "../../actions/routes";
import { setFolders } from "../../actions/folders";
import { setQuickFiles } from "../../actions/quickFiles";
import { hideSettings } from "../../actions/settings";
import { startLogout, startLogoutAll } from "../../actions/auth";
import { setFiles, startResetCache } from "../../actions/files";
import {connect} from "react-redux"
import { setParent } from "../../actions/parent";
import uuid from "uuid"
import InvoiceItem from "../InvoiceItem";
import {setUpdateSettingsID} from "../../utils/updateSettings";
import HomepageSpinner from "../HomepageSpinner";
import { setLoading } from "../../actions/main";
// import {updateSettingsID} from "../MainSection"
// import { resetSettingsMain } from "../../actions/main";

class SettingsPageContainer extends React.Component {
  
    constructor(props) {
        super(props);

        this.state = {
            sideBarOpen: false,
            mode: "general",
            loaded: false,
            userDetails: {},
            addS3AccountOpen: false,
            s3ID: "",
            s3Key: "",
            s3Bucket: "",
            addGoogleAccountOpen: false,
            googleID: "",
            googleSecret: "",
            invoiceData: {},
            invoices: [],
            invoicesLoaded: false,
            showChangePassword: false,
            oldPassword: "",
            newPassword: "",
            verifyNewPassword: "",
            showAddName: false,
            name: "",
            listView: true,
            dateSort: true,
            descendingSort: true,
            dropToUpload: true,
            doubleClickFolders: false,
            hideFolderTree: false,
            showFolderTreeScrollBars: false
        }

        this.uploadReference = React.createRef()
    }

    getUserDetails = () => {

        this.props.dispatch(setLoading(true));

        axios.get("/user-service/user-detailed").then((response) => {
          
            env.name = response.data.name;
            env.emailAddress = response.data.email
            this.props.dispatch(setParent(uuid.v4()))

            this.setState(() => {
                return {
                    ...this.state,
                    loaded: true,
                    userDetails: response.data
                }
            }, () => {

              // this.getInvoiceData();
              this.props.dispatch(setLoading(false))

            })
        }).catch((err) => {

          console.log("Loading user details error", err);

          Swal.fire({
            title: 'Error loading user account',
            text: 'There was an error loading your account, would you like to logout?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'No'
          }).then((result) => {

            if (result.value) {
              console.log("Confirm logout");

              axios.post("/user-service/logout").then(() => {
                window.location.assign(env.url);
              }).catch((e) => {
                window.location.assign(env.url);
              })
            }
          
          })
        })
        
    }

    componentDidMount = () => {
        this.getUserDetails();
        this.setSettings();

        //console.log("env sub", this.state.userDetails.activeSubscription)
    }

    setSettings = () => {

      const gridMode = window.localStorage.getItem("grid-mode");
      const nameMode = window.localStorage.getItem("name-mode");
      const ascMode = window.localStorage.getItem("asc-mode");
      const dropToUpload = window.localStorage.getItem("non_drop-mode");
      const doubleClickFolders = window.localStorage.getItem("double-click-folders");
      const hideFolderTree = window.localStorage.getItem("hide-folder-tree");
      const showFolderTreeScrollBars = window.localStorage.getItem("show-folder-tree-scroll-bars")

      this.setState(() => {
        return {
          ...this.state,
          listView: !gridMode,
          dateSort: !nameMode,
          descendingSort: !ascMode,
          dropToUpload: !dropToUpload,
          doubleClickFolders: doubleClickFolders,
          hideFolderTree: hideFolderTree,
          showFolderTreeScrollBars
        }
      })
    }

    showSideBar = () => {

        this.setState(() => {
            return {
                ...this.state,
                sideBarOpen: !this.state.sideBarOpen
            }
        })
    }

    modeChangeFullScreen = (type) => {
     
        this.setState(() => {
            return {
                ...this.state,
                mode: type
            }
        })
    }

    modeChange = (type) => {

        this.setState(() => {
            return {
                ...this.state,
                mode: type
            }
        }, () => {
            this.showSideBar()
        })
        //this.showSideBar()
    }

    getProfilePicName = () => {

        if (!this.state.loaded) return "?";

        if (this.state.userDetails.name) {
            if (this.state.userDetails.name.length >= 1) {
                return this.state.userDetails.name.substring(0, 1).toUpperCase();
            } else {
                return "?"
            }
        } else if (this.state.userDetails.email.length >= 1) {
            return this.state.userDetails.email.substring(0,1).toUpperCase();
        } else {
            return "?"
        }
    }

    onChangeS3ID = (e) => {

        const value = e.target.value;

        this.setState(() => {
            return {
                ...this.state,
                s3ID: value
            }
        })
    }

    onChangeS3Bucket = (e) => {

        const value = e.target.value;

        this.setState(() => {
            return {
                ...this.state,
                s3Bucket: value
            }
        })
    }

    onChangeS3Key = (e) => {

        const value = e.target.value;

        this.setState(() => {
            return {
                ...this.state,
                s3Key: value
            }
        })
    }

    onChangeGoogleID = (e) => {

        const value = e.target.value;

        this.setState(() => {
            return {
                ...this.state,
                googleID: value
            }
        })
    }

    onChangeGoogleSecret = (e) => {

        const value = e.target.value;

        this.setState(() => {
            return {
                ...this.state,
                googleSecret: value
            }
        })
    }

    showS3Account = () => {

        this.setState(() => {
            return {
                ...this.state,
                addS3AccountOpen: !this.state.addS3AccountOpen
            }
        })
    }

    showGoogleAccount = () => {

        this.setState(() => {
            return {
                ...this.state,
                addGoogleAccountOpen: !this.state.addGoogleAccountOpen
            }
        })
    }

    submitS3Account = (e) => {

        e.preventDefault()

        const data = {
            id: this.state.s3ID,
            bucket: this.state.s3Bucket,
            key: this.state.s3Key
        }

        axios.post("/user-service/add-s3-storage", data).then((response) => {

            Swal.fire(
                'S3 Account Added',
                'Amazon S3 Account has been linked with myDrive',
                'success'
              ).then(() => {
                  //window.location.assign(env.url);
                  env.s3Enabled = true;

                  this.getUserDetails()
                  this.showS3Account()
                //   let newUser = this.state.userDetails;
                //   newUser = {...newUser, s3Enabled: true}
              })

        }).catch((err) => {
            Swal.fire({
              icon: 'error',
              title: 'Add S3 Account Error',
              text: 'Invalid S3 Credentials',
            })
        })
    }

    getInvoiceData = () => {

      if (!env.commercialMode || !this.state.userDetails.activeSubscription) return;

      axios.get("/user-service/payments").then((response) => {
  
        const invoices = response.data.invoices;

        let invoiceDetails = response.data;
        //delete invoiceDetails.invoices;

        this.setState(() => {
          return {
            ...this.state, 
            invoiceData: invoiceDetails,
            invoices, 
            invoicesLoaded: true}
        })

      }).catch((e) => {
        console.log("invoice err", e)
      })

    }

    removeS3Account = (e) => {

        if (e) e.preventDefault();

        Swal.fire({
            title: 'Remove S3 Account?',
            text: "This will unlink your Amazon S3 Account from myDrive.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove account'
          }).then((result) => {
            if (result.value) {

              axios.delete('/user-service/remove-s3-storage').then((response) => {

                let newUser = this.state.userDetails;
                delete newUser.s3Enabled;

                env.s3Enabled = undefined;
                this.setState(() => {
                    return {
                        ...this.state,
                        userDetails: newUser
                    }
                })

                this.showS3Account()
                Swal.fire(
                    'S3 Account Removed',
                    'Your Amazon S3 Account has been unlinked from myDrive',
                    'success'
                )

              }).catch((err) => {
                  console.log("could not remove google account", err);
              })


            }
          })
    }

    refreshStorageSize = () => {
      
        axios.patch("/user-service/refresh-storage-size", undefined).then((response) => {

            this.getUserDetails()

        }).catch((err) => {
            console.log("refresh storage error")
        })
    }

    submitGoogleAccount = (e) => {

      e.preventDefault()

      const clientID = this.state.googleID;
      const clientKey = this.state.googleSecret;
      const clientRedirect = "/add-google-account"

      const data = {
          clientID, 
          clientKey,
          clientRedirect
      }

      axios.post("/user-service/create-google-storage-url", data).then((response) => {

          const googleURL = response.data

          window.location.assign(googleURL)

      }).catch((err) => {
          console.log("create url error", err)
      })
    }

    removeGoogleAccount = (e) => {

      e.preventDefault();

      axios.delete('/user-service/remove-google-storage').then((response) => {

        env.googleDriveEnable = undefined;
        this.showGoogleAccount();
        this.getUserDetails();
          Swal.fire(
            'Google Account Removed',
            'Your Google Account has been unlinked from myDrive',
            'success'
        ).then(() => {
            // window.location.assign(env.url)
            
        })
      })
    }

    getStoragePercentage = () => {

      let value = Math.floor((this.state.userDetails.storageData.storageSize / this.state.userDetails.storageData.storageLimit) * 100);

      if (value < 0) value = 0;
      if (value > 100) value = 100;

      return value;
    }

    getStoragePercentageGoogle = () => {
      let value = Math.floor((this.state.userDetails.storageDataGoogle.storageSize / this.state.userDetails.storageDataGoogle.storageLimit) * 100);

      if (value < 0) value = 0;
      if (value > 100) value = 100;

      return value;
    }

    launchStoragePage = () => {

      window.location.assign(env.url+"/add-storage")
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

  changeShowChangePassword = () => {

    this.setState(() => {
      return {
        ...this.state,
        showChangePassword: !this.state.showChangePassword,
        oldPassword: "",
        newPassword: "",
        verifyNewPassword: ""
      }
    })
  }

  goHome = () => {
    window.location.assign(env.url)
  }

  onChangeOldPassword = (e) => {

    const value = e.target.value;

    this.setState(() => {
        return {
            ...this.state,
            oldPassword: value
        }
    })
  }

  onChangeNewPassword = (e) => {

    const value = e.target.value;

    this.setState(() => {
        return {
            ...this.state,
            newPassword: value
        }
    })
  }

  onChangeVerifyNewPassword = (e) => {

    const value = e.target.value;

    this.setState(() => {
        return {
            ...this.state,
            verifyNewPassword: value
        }
    })
  }

  submitPasswordChange = (e) => {

    e.preventDefault()

    if (this.state.oldPassword.length === 0 || this.state.newPassword.length === 0 || this.state.verifyNewPassword.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Enter All Required Fields',
      })
    }

    if (this.state.verifyNewPassword !== this.state.newPassword) {

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'New passwords do not match',
      })
      return;
    }

    const data = {
      newPassword: this.state.newPassword,
      oldPassword: this.state.oldPassword
    }

    axios.post(`/user-service/change-password/`, data).then((results) => {
                    
      //const newToken = results.data;
      // window.localStorage.setItem("token", newToken);

      this.changeShowChangePassword()
      //this.getUserDetails()

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

  onChangeAddName = (e) => {

    const value = e.target.value;

    this.setState(() => {
        return {
            ...this.state,
            name: value
        }
    })
  }

  doubleClickOnChange = (e) => {

    if (this.state.doubleClickFolders) {
      localStorage.removeItem("double-click-folders");
    } else {
      localStorage.setItem("double-click-folders", "true");
    }

    this.setState(() => {
      return {
        ...this.state,
        doubleClickFolders: !this.state.doubleClickFolders
      }
    })

    //this.props.dispatch(resetSettingsMain(uuid.v4()));
    // updateSettingsID = uuid.v4();
    // setUpdateSettingsID(uuid.v4());
  }

  changeShowAddName = () => {

    this.setState(() => {
      return {
        ...this.state,
        showAddName: !this.state.showAddName,
        name: ""
      }
    })
  }

  submitAddName = (e) => {

    e.preventDefault()

    if (this.state.name.length === 0) return;

    const data = {
      name: this.state.name
    }

    axios.patch("/user-service/add-name", data).then((response) => {
      
      this.changeShowAddName();
      this.getUserDetails()
      Swal.fire(
        'Name Updated',
        'Your name has been sucessfully updated',
        'success'
      )
    
    }).catch(() => {
      console.log("could not change name")
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error changing name',
      })
    })
  }

  goHome = () => {
    window.location.assign(env.url)
  }

  downloadPersonalFileList = (e) => {

    e.preventDefault()

    axios.post('/user-service/get-token').then((response) => {

      const finalUrl = `/user-service/download-personal-file-list`;

      const link = document.createElement('a');
      document.body.appendChild(link);
      link.href = finalUrl;
      link.setAttribute('type', 'hidden');
      link.setAttribute("download", true);
      link.click();
    })
  }

  uploadPersonalFileList = (e) => {

    e.preventDefault();

    if (this.uploadReference.current.files && this.uploadReference.current.files[0]) {

      const currentFile = this.uploadReference.current.files[0];

      const config = {
        headers: {
        'Content-Type': 'application/json'
        }
      }
      
      axios.post('/user-service/upload-personal-file-list', currentFile, config).then((response) => {
               
        this.uploadReference.current.value = ''

        Swal.fire(
          'Personal Data Uploaded',
          'Your Peronsal Metadata has been uploaded to myDrive successfully',
          'success'
        )

      }).catch((err) => {
        console.log("upload personal file list error", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error uploading personal file list',
        })
      }) 
      
    }
    
  }

  removeS3Metadata = (e) => {
    e.preventDefault();

    Swal.fire({
      title: 'Remove S3 Metadata?',
      text: "This will remove all S3 Metadata from myDrive, please download your metadata list before removing.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove metadata'
    }).then((result) => {
      if (result.value) {

        axios.delete("/user-service/remove-s3-metadata").then((response) => {

          Swal.fire(
            'S3 Metadata removed',
            'Your S3 metadata has been removed from myDrive successfully.',
            'success'
          )
        }).catch((err) => {
          console.log("delete s3 data err", err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error deleting S3 metadata',
          })
        })
        
      }
    })
  }

  listViewOnChange = (e) => {

    if (this.state.listView) {
      window.localStorage.setItem("grid-mode", true);
    } else {
      window.localStorage.removeItem("grid-mode");
    }

    this.setState(() => {
      return {
        ...this.state,
        listView: !this.state.listView
      }
    })

    // this.setSettings();
  }

  sortByDateChange = () => {

    if (this.state.dateSort) {
      window.localStorage.setItem("name-mode", true);
    } else {
      window.localStorage.removeItem("name-mode")
    }

    this.setState(() => {
      return {
        ...this.state,
        dateSort: !this.state.dateSort
      }
    })
  }

  sortByDescendingChange = () => {

    if (this.state.descendingSort) {
      window.localStorage.setItem("asc-mode", true);
    } else {
      window.localStorage.removeItem("asc-mode")
    }

    this.setState(() => {
      return {
        ...this.state,
        descendingSort: !this.state.descendingSort
      }
    })
  }

  dropOnChange = () => {

    if (this.state.dropToUpload) {
      window.localStorage.setItem("non_drop-mode", true)
    } else {
      window.localStorage.removeItem("non_drop-mode");
    }

    this.setState(() => {
      return {
        ...this.state,
        dropToUpload: !this.state.dropToUpload
      }
    })
  }

  hideFolderTreeOnChange = () =>{

    if (this.state.hideFolderTree) {

      window.localStorage.removeItem("hide-folder-tree");

    } else {

      console.log("setting hide folder tree to true")

      window.localStorage.setItem("hide-folder-tree", true);
    }
    
    this.setState(() => ({
      ...this.state,
      hideFolderTree: !this.state.hideFolderTree
    }))

  }

  showFolderTreeScrollBarsOnChange = () => {

    if (this.state.showFolderTreeScrollBars) {

      window.localStorage.removeItem("show-folder-tree-scroll-bars");

    } else {

      window.localStorage.setItem("show-folder-tree-scroll-bars", true);
    }

    this.setState(() => ({
      ...this.state,
      showFolderTreeScrollBars: !this.state.showFolderTreeScrollBars
    }))

  }

  render() {

    if (this.props.loading) {
      return <HomepageSpinner />
    }

    return (

        <div>

            <div class="main__wrapper">

<div onClick={this.showSideBar} class="overlay" style={this.state.sideBarOpen ? {display: "block"} : {display:"none"}}></div>

<Header goHome={this.goHome}/>

<div class="main__wrapper--container settings__container" style={this.props.loading ? {display: "none"} : {}}>
  <div class="menu__block" style={this.state.sideBarOpen ? {left: "0px"} : {left:"-250px"}}>
    <div class="file__settings">
      <div class="back__button">
        <a onClick={this.goHome}>
          <span>
            <img src="/assets/backarrow.svg" alt="backarrow" />
          </span>{" "}
          BACK TO FILES
        </a>
      </div>
      <div class="settings__menu">
        <ul>
          <li
            class={this.state.mode === "general" ? "active__settings" : ""}
            data-settings="general__settings"
          >
            <a onMouseDown={() => this.modeChange("general")}>General</a>
          </li>
          <li class={this.state.mode === "storage" ? "active__settings" : ""} data-settings="storage__accounts">
            <a onMouseDown={() => this.modeChange("storage")}>Storage accounts</a>
          </li>
          <li style={env.commercialMode ? {display: "block"} : {display:"none"}} class={this.state.mode === "billing" ? "active__settings" : ""} data-settings="billing__settings">
            <a onMouseDown={() => this.modeChange("billing")}>Billing & payments</a>
          </li>
          <li class={this.state.mode === "notifications" ? "active__settings" : ""} data-settings="notification__settings">
            <a onMouseDown={() => this.modeChange("notifications")}>Settings</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="menu__block">
    <div class="file__settings">
      <div class="back__button">
        <a onClick={this.goHome}>
          <span>
            <img src="/assets/backarrow.svg" alt="backarrow" />
          </span>{" "}
          BACK TO FILES
        </a>
      </div>
      <div class="settings__menu">
        <ul>
          <li
            class={this.state.mode === "general" ? "active__settings" : ""}
            data-settings="general__settings"
          >
            <a onMouseDown={() => this.modeChangeFullScreen("general")}>General</a>
          </li>
          <li class={this.state.mode === "storage" ? "active__settings" : ""} data-settings="storage__accounts">
            <a onMouseDown={() => this.modeChangeFullScreen("storage")}>Storage accounts</a>
          </li>
          <li style={env.commercialMode ? {display: "block"} : {display:"none"}} class={this.state.mode === "billing" ? "active__settings" : ""} data-settings="billing__settings">
            <a onMouseDown={() => this.modeChangeFullScreen("billing")}>Billing & payments</a>
          </li>
          <li class={this.state.mode === "notifications" ? "active__settings" : ""} data-settings="notification__settings">
            <a onMouseDown={() => this.modeChangeFullScreen("notifications")}>Settings</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
  
  <div class="content__block">
    <div class="small__switcher--content">
      <a onClick={this.showSideBar} class="menu__button">
        <i class="fas fa-bars"></i>
      </a>
      {/* <a href="#" class="image__viewer">
        <i class="fas fa-images"></i>
      </a> */}
    </div>
    <div class="main__settings--block">
      <div class="inner__settings general__settings" style={this.state.mode === "general" ? {display:"block"} : {display:"none"}}>
        <div class="elem__settings">
          <div class="head__settings">
            <h2>Personal info</h2>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <p>Profile picture</p>
            </div>
            <div class="control__value">
              <div class="profile__picture">
                <p style={{backgroundColor:"#3c85ee"}}>
                  <span style={{color:"#fff"}}>{this.getProfilePicName()}</span>
                </p>
              </div>
            </div>
            <div class="value__updater">
              {/* <a href="#">Upload</a> */}
            </div>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <p>Name</p>
            </div>
            <div class="control__value">
              <p>{this.state.loaded ? this.state.userDetails.name ? capitalize(this.state.userDetails.name) : "No Name Set" : "Loading..."}</p>
            </div>
            <div class="value__updater">
              <a onClick={this.changeShowAddName}>Change</a>
            </div>
          </div>
        </div>
        <div class="elem__settings">
          <div class="head__settings">
            <h2>Security</h2>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <p>Logout Account</p>
            </div>
            <div class="control__value">
                <p></p>
            </div>
            <div class="value__updater">
              <a onClick={this.logout}>Logout</a>
            </div>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <p>Email</p>
            </div>
            <div class="control__value">
                <p>{this.state.loaded ? this.state.userDetails.email : "Loading..."}</p>
            </div>
            <div class="value__updater">
              {/* <a href="#">Change</a> */}
            </div>
          </div>

          <div class="elem__control--settings">
            <div class="control__title">
              <p>Password</p>
            </div>
            <div class="control__value">
              <p>{this.state.loaded ? this.state.userDetails.passwordLastModified ? `Updated ${moment(this.state.userDetails.passwordLastModified).calendar()}` : "Password Not Updated Yet" : "Loading..."}</p>
            </div>
            <div class="value__updater">
              <a
                onClick={this.changeShowChangePassword}
                class="modal__button"
                data-modal="password__modal"
              >
                Change
              </a>
            </div>
          </div>

          <div class="elem__control--settings">
            <div class="control__title">
              <p>Logout All Accounts</p>
            </div>
            <div class="control__value">
                <p></p>
            </div>
            <div class="value__updater">
              <a onClick={this.logoutAll}>Logout All</a>
            </div>
          </div>
          {/* <div class="elem__control--settings">
            <div class="control__title">
              <p>Two factor authentication</p>
            </div>
            <div class="control__value">
              <p>Disabled</p>
            </div>
            <div class="value__updater">
              <a href="#">Enable</a>
            </div>
          </div> */}
        </div>

        <div class="elem__settings" style={{display:"none"}}>
          <div class="head__settings">
            <h2>Preferences</h2>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <p>Language</p>
            </div>
            <div class="control__value">
              <p>English</p>
            </div>
            <div class="value__updater">
              <a href="#">Change</a>
            </div>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <p>Date format</p>
            </div>
            <div class="control__value">
              <p>MM / DD / YYYY</p>
            </div>
            <div class="value__updater">
              <a href="#">Change</a>
            </div>
          </div>

          <div class="elem__control--settings">
            <div class="control__title">
              <p>Date Time zone</p>
            </div>
            <div class="control__value">
              <p>GMT +7</p>
            </div>
            <div class="value__updater">
              <a href="#">Change</a>
            </div>
          </div>
        </div>
      </div>
      <div
        class="inner__settings storage__accounts"
        style={this.state.mode === "storage" ? {display:"block"} : {display:"none"}}
      >
        <div class="elem__settings">
          <div class="head__settings">
            <h2>Storage Accounts</h2>
          </div>
          <div class="elem__control--settings storage__control">
            <div class="active__storage">
              <div class="control__title">
                <div class="double__title">
                  <p>{env.commercialMode ? "myDrive" : "Local Storage"}</p>
                  <span>{!this.state.loaded ? "Loading..." : (env.commercialMode && this.state.userDetails.activeSubscription) ? "Plan Type" : ""}</span>
                </div>
              </div>
              <div class="control__value">
                <div class="available__space--wrap">
                  <div class="space__bar" style={!this.state.loaded ? {} : (env.commercialMode && !this.state.userDetails.activeSubscription) ? {display:"none"} : {display:"block"}}>
                    <div
                      class="active__space--bar"
                      style={{backgroundColor:"#3c85ee",width: !this.state.loaded ? "0%" : env.commercialMode ? this.state.userDetails.activeSubscription ? `${this.getStoragePercentage()}%` : `100%` : "100%"}}
                    ></div>
                  </div>
                  <span>{!this.state.loaded ? "Loading..." : 
                  (env.commercialMode && this.state.userDetails.activeSubscription) ? 
                  `${bytes(this.state.userDetails.storageData.storageSize)} of 
                  ${bytes(this.state.userDetails.storageData.storageLimit)} used` : !env.commercialMode ? `${bytes(this.state.userDetails.storageData.storageSize)} used` : ''}</span>
                </div>
              </div>
              <div class="value__updater">
                <a onClick={env.commercialMode ? this.launchStoragePage : this.refreshStorageSize}>{env.commercialMode ? "Upgrade" : "Refresh"}</a>
              </div>
            </div>
            <div class="more__space" style={{display:"none"}}>
              <p>
                <img src="/assets/star.svg" alt="star" />{" "}
                <span>Earn more free space.</span> Get an additional
                10GB of storage for every friend you invite.
              </p>
              <a href="#">Invite Friends</a>
            </div>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <div class="double__title">
                <p>Google Drive</p>
                <span>{!this.state.loaded ? "Loading..." : this.state.userDetails.googleDriveEnabled ? this.state.userDetails.googleDriveData.id : "No Google Account"}</span>
              </div>
            </div>
            <div class="control__value">
              <div class="available__space--wrap">
                <div class="space__bar" style={!this.state.loaded ? {} : this.state.userDetails.googleDriveEnabled ? {display:"block"} : {display:"none"}}>
                  <div
                    class="active__space--bar"
                    style={{backgroundColor:"#3c85ee", width: !this.state.loaded ? "0%" : this.state.userDetails.googleDriveEnabled ? `${this.getStoragePercentageGoogle()}%` : '0%'}}
                  ></div>
                </div>
                <span>{this.state.userDetails.googleDriveEnabled ? !this.state.userDetails.storageDataGoogle.failed ? `${bytes(this.state.userDetails.storageDataGoogle.storageSize)} of 
                  ${bytes(this.state.userDetails.storageDataGoogle.storageLimit)} used` : "Failed" : ""}
                </span>
              </div>
            </div>
            <div class="value__updater">
              <a onClick={this.showGoogleAccount}>{!this.state.loaded ? "Loading..." : this.state.userDetails.googleDriveEnabled ? "Edit" : "Add"}</a>
            </div>
          </div>
          
          <div class="elem__control--settings">
            <div class="control__title">
              <div class="double__title">
                <p>Amazon S3</p>
                <span>{!this.state.loaded ? "Loading..." : this.state.userDetails.s3Enabled ? this.state.userDetails.s3Data.bucket : "S3 Not Enabled"}</span>
              </div>
            </div>
            <div class="control__value" style={!this.state.loaded ? {} : this.state.userDetails.s3Enabled ? {display:"block"} : {display:"none"}}>
              <div class="available__space--wrap">
                <div class="space__bar">
                  <div
                    class="active__space--bar"
                    style={{backgroundColor:"#3c85ee", width:"100%"}}
                  ></div>
                </div>
                <span>{this.state.userDetails.s3Enabled ? !this.state.userDetails.storageDataPersonal.failed ? 
                `${bytes(this.state.userDetails.storageDataPersonal.storageSize)} used` : "Failed" : ""}</span>
              </div>
            </div>
            <div class="value__updater">
              <a onClick={this.showS3Account}>{!this.state.loaded ? "Loading..." : this.state.userDetails.s3Enabled ? "Edit" : "Add"}</a>
            </div>
          </div>
        </div>
        <div class="elem__settings more__accounts" style={{display:"none"}}>
          <div class="head__settings">
            <h2>Add more accounts</h2>
          </div>
          <div style={{display:"flex", flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
            <p>More Storage Options Coming Soon!</p>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <p>BackBlaze</p>
            </div>
            <div class="value__updater">
              <a href="#">Enable</a>
            </div>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <p>Sia Network</p>
            </div>
            <div class="value__updater">
              <a href="#">Enable</a>
            </div>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <p>Localhost</p>
            </div>
            <div class="value__updater">
              <a href="#">Enable</a>
            </div>
          </div>
        </div>
      </div>

      <div
        class="inner__settings billing__settings"
        style={this.state.mode === "billing" ? {display:"block"} : {display:"none"}}
      >
        <div class="elem__settings">
          <div class="head__settings">
            <h2>Payment</h2>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <p>Payment method</p>
            </div>
            <div class="control__value">
              <p>{(this.state.loaded && this.state.invoicesLoaded) ? 
              !this.state.invoiceData.card ? "No Payment Method" : 
              `${this.state.invoiceData.card.brand} ending in ${this.state.invoiceData.card.last4}` : "No Payment Method"}</p>
            </div>
            <div class="value__updater">
              <a onClick={this.launchStoragePage}>Change</a>
            </div>
          </div>
          <div class="elem__control--settings">
            <div class="control__title">
              <p>Billing cycle</p>
            </div>
            <div class="control__value">
              <p>{(this.state.loaded && this.state.invoicesLoaded) ? 
              !this.state.invoiceData.subscription ? "No Subscription" : 
              capitalize(this.state.invoiceData.subscription.plan.interval) : "No Subscription"}</p>
            </div>
            <div class="value__updater">
              <a onClick={this.launchStoragePage}>Change</a>
            </div>
          </div>
        </div>
        <div class="elem__settings">
          <div class="head__settings">
            <h2>History</h2>
          </div>
          <div class="history__table">
            <table>

                <tr>
                    <th class="date__history">DATE</th>
                    <th class="plan__history">PLAN</th>
                    <th class="amount__history">AMOUNT</th>
                    <th class="status__history">STATUS</th>
                    <th></th>
                </tr>

              {(!this.state.loaded || !this.state.invoicesLoaded) ? undefined : this.state.invoices.map((currentInvoice) => {

                return <InvoiceItem currentInvoice={currentInvoice}/>

              })}
              {/* <tr>
                <td class="date__history">May 1, 2020</td>
                <td class="plan__history">myDrive Standard Plan</td>
                <td class="amount__history">$9.99</td>
                <td class="status__history unpaid">Unpaid</td>
                <td>
                  <a href="#">Invoice</a>
                </td>
              </tr>
              <tr>
                <td class="date__history">May 1, 2020</td>
                <td class="plan__history">myDrive Standard Plan</td>
                <td class="amount__history">$9.99</td>
                <td class="status__history paid">Paid</td>
                <td>
                  <a href="#">Receipt</a>
                </td>
              </tr>
              <tr>
                <td class="date__history">May 1, 2020</td>
                <td class="plan__history">myDrive Standard Plan</td>
                <td class="amount__history">$9.99</td>
                <td class="status__history paid">Paid</td>
                <td>
                  <a href="#">Receipt</a>
                </td>
              </tr> */}
            </table>
          </div>
        </div>
      </div>

      <div
        class="inner__settings notification__settings"
        style={this.state.mode === "notifications" ? {display:"block"} : {display:"none"}}
      >
        <div class="elem__settings">
          <div class="head__settings">
            <h2>Customization</h2>
          </div>
          <div class="settings__switchers">
            <span>Set Defaults</span>
            <p>
              <input checked={this.state.listView} onChange={this.listViewOnChange} type="checkbox" id="test1" />
              <label for="test1">List Style</label>
            </p>
            <p>
              <input checked={this.state.dateSort} onChange={this.sortByDateChange} type="checkbox" id="test2" />
              <label for="test2">
                Sort By Date
              </label>
            </p>
            <p>
              <input checked={this.state.descendingSort} onChange={this.sortByDescendingChange} type="checkbox" id="test3" />
              <label for="test3">
                Descending Order
              </label>
            </p>
            <p>
              <input checked={this.state.dropToUpload} onChange={this.dropOnChange} type="checkbox" id="test4" />
              <label for="test4">Drag And Drop To Upload</label>
            </p>
            <p>
              <input checked={this.state.doubleClickFolders} onChange={this.doubleClickOnChange} type="checkbox" id="test5" />
              <label for="test5">Double Click To Enter Folders On Mobile</label>
            </p>
            <p>
              <input checked={this.state.hideFolderTree} onChange={this.hideFolderTreeOnChange} type="checkbox" id="test6" />
              <label for="test6">Hide Folder Tree</label>
            </p>
            <p>
              <input checked={this.state.showFolderTreeScrollBars} onChange={this.showFolderTreeScrollBarsOnChange} type="checkbox" id="test7" />
              <label for="test7">Show Folder Tree Scroll Bars</label>
            </p>
          </div>
        </div>

        {/* <div class="elem__settings">
          <div class="head__settings">
            <h2>Marketing</h2>
          </div>
          <div class="settings__switchers">
            <span>Email me about</span>
            <p>
              <input type="checkbox" id="test4" />
              <label for="test4">New features and updates</label>
            </p>
            <p>
              <input type="checkbox" id="test5" />
              <label for="test5">Tips on using myDrive</label>
            </p>
            <p>
              <input type="checkbox" id="test6" />
              <label for="test6">
                Feedback surveys to help improve myDrive
              </label>
            </p>
          </div>
        </div> */}
      </div>
    </div>
  </div>
</div>
</div>

    <div class="modal__wrap" style={this.state.addS3AccountOpen ? {display:"block"} : {display:"none"}}>
            <div class="inner__modal">
                <div class="password__modal">
                    <div class="head__password">
                        <h2>{!this.state.loaded ? "Loading..." : this.state.userDetails.s3Enabled ? "Edit Amazon S3 Account" : "Add Amazon S3 Account"}</h2>
                        <div class="close__modal">
                            <a onClick={this.showS3Account}><img src="/assets/close.svg" alt="close"/></a>
                        </div>
                    </div>
                    <div class="password__content">
                        <form onSubmit={!this.state.loaded ? this.submitS3Account : this.state.userDetails.s3Enabled ? this.removeS3Account : this.submitS3Account}>
                            <div class="group__password" style={!this.state.loaded ? {} : this.state.userDetails.s3Enabled ? {display:"none"} : {display:"block"}}>
                                <input value={this.state.s3ID} onChange={this.onChangeS3ID} placeholder="S3 ID"/>
                            </div>
                            <div class="group__password" style={!this.state.loaded ? {} : this.state.userDetails.s3Enabled ? {display:"none"} : {display:"block"}}>
                                <input value={this.state.s3Bucket} onChange={this.onChangeS3Bucket} placeholder="S3 Bucket"/>
                            </div>
                            <div class="group__password" style={!this.state.loaded ? {} : this.state.userDetails.s3Enabled ? {display:"none"} : {display:"block"}}>
                                <input value={this.state.s3Key} onChange={this.onChangeS3Key} type="password" placeholder="S3 Key"/>
                            </div>
                            <div class="password__submit">
                                <input type="submit" value={!this.state.loaded ? "Loading..." : this.state.userDetails.s3Enabled ? "Remove Account" : "Add Account"}/>
                            </div>
                        </form>
                        <form onSubmit={this.downloadPersonalFileList} style={!this.state.loaded ? {display:"none"} : this.state.userDetails.s3Enabled ? {display:"block", marginTop: "13px"} : {display:"none"}}>
                            <div class="password__submit">
                                {/* <input onClick={this.downloadPersonalFileList} value="Download S3 File List"/> */}
                                <button>Download S3 Metadata List</button>
                            </div>
                        </form>
                        <form style={!this.state.loaded ? {display:"none"} : this.state.userDetails.s3Enabled ? {display:"block", marginTop: "13px"} : {display:"none"}}>
                            <div class="password__submit">
                              <div>
                                <input ref={this.uploadReference} onChange={this.uploadPersonalFileList} type="file" multiple={false}/>
                                <p>Upload S3 Metadata List</p>
                              </div>
                                {/* <input onClick={this.downloadPersonalFileList} value="Download S3 File List"/> */}
                                
                            </div>
                        </form>
                        <form onSubmit={this.removeS3Metadata} style={!this.state.loaded ? {display:"none"} : this.state.userDetails.s3Enabled ? {display:"block", marginTop: "13px"} : {display:"none"}}>
                            <div class="password__submit">
                                {/* <input onClick={this.downloadPersonalFileList} value="Download S3 File List"/> */}
                                <button>Delete S3 Metadata</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal__wrap" style={this.state.addGoogleAccountOpen ? {display:"block"} : {display:"none"}}>
            <div class="inner__modal">
                <div class="password__modal">
                    <div class="head__password">
                        <h2>{!this.state.loaded ? "Loading..." : this.state.userDetails.googleDriveEnabled ? "Remove Google Drive Account" : "Add Google Drive Account"}</h2>
                        <div class="close__modal">
                            <a onClick={this.showGoogleAccount}><img src="/assets/close.svg" alt="close"/></a>
                        </div>
                    </div>
                    <div class="password__content">
                        <form onSubmit={!this.state.loaded ? this.submitGoogleAccount : this.state.userDetails.googleDriveEnabled ? this.removeGoogleAccount : this.submitGoogleAccount}>
                            <div class="group__password" style={!this.state.loaded ? {} : this.state.userDetails.googleDriveEnabled ? {display:"none"} : {display:"block"}}>
                                <input value={this.state.googleID} onChange={this.onChangeGoogleID} placeholder="Drive Client ID"/>
                            </div>
                            <div class="group__password" style={!this.state.loaded ? {} : this.state.userDetails.googleDriveEnabled ? {display:"none"} : {display:"block"}}>
                                <input value={this.state.googleSecret} onChange={this.onChangeGoogleSecret} type="password" placeholder="Drive Client Secret"/>
                            </div>
                            <div class="password__submit">
                                <input type="submit" value={!this.state.loaded ? "Loading..." : this.state.userDetails.googleDriveEnabled ? "Remove Account" : "Add Account"}/>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal__wrap" style={this.state.showChangePassword ? {display:"block"} : {display:"none"}}>
          <div class="inner__modal">
            <div class="password__modal">
              <div class="head__password">
                <h2>Update password</h2>
                <div class="close__modal">
                  <a onClick={this.changeShowChangePassword}><img src="/assets/close.svg" alt="close"/></a>
                </div>
              </div>
              <div class="password__content">
                <form onSubmit={this.submitPasswordChange}>
                <div class="group__password">
                    <input onChange={this.onChangeOldPassword} value={this.state.oldPassword} type="password" placeholder="Old password"/>
                  </div>
                  <div class="group__password">
                    <input onChange={this.onChangeNewPassword} value={this.state.newPassword} type="password" placeholder="New password"/>
                  </div>
                  <div class="group__password">
                    <input onChange={this.onChangeVerifyNewPassword} value={this.state.verifyNewPassword} type="password" placeholder="Repeat new password"/>
                  </div>
                  <div class="password__submit">
                    <input type="submit" value="Update Password"/>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div class="modal__wrap" style={this.state.showAddName ? {display:"block"} : {display:"none"}}>
            <div class="inner__modal">
                <div class="password__modal">
                    <div class="head__password">
                        <h2>{"Update Name"}</h2>
                        <div class="close__modal">
                            <a onClick={this.changeShowAddName}><img src="/assets/close.svg" alt="close"/></a>
                        </div>
                    </div>
                    <div class="password__content">
                        <form onSubmit={this.submitAddName}>
                            <div class="group__password">
                                <input value={this.state.name} onChange={this.onChangeAddName} placeholder="Name"/>
                            </div>
                            <div class="password__submit">
                              <input type="submit" value="Update Name"/>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        </div>

    

    );
  }
}

const connectStoreToProp = (state) => ({
  loading: state.main.loading
})

export default connect(connectStoreToProp)(SettingsPageContainer);