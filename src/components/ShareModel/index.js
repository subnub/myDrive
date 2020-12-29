import React from "react";
import {connect} from "react-redux"
import { editFile } from "../../actions/files";
import axios from "../../axiosInterceptor"
import env from "../../enviroment/envFrontEnd";
import capitalize from "../../utils/capitalize";
import bytes from "bytes";
import copy from "copy-text-to-clipboard";
import { setShareSelected, editSelectedItem, editShareSelected } from "../../actions/selectedItem";
import SpinnerImage from "../SpinnerImage";
import SpinnerPage from "../SpinnerPage";
import Swal from "sweetalert2";

const currentURL = env.url;

class ShareModelContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state= {
        shareableLink: "Fetching Link...",
        loaded: false,
        sendTo: "",
        emailSent: false,
        copySelected: false,
        public: false,
        shared: false,
    }

    this.lastLoadedID = ''
  }

  componentDidMount = () => {

    const id = this.props.shareSelected._id;

    //`/file-service/info/${id}`

    const url = this.props.shareSelected.metadata.drive ? `/file-service-google/info/${id}` : `/file-service/info/${id}`;

    axios.get(url).then((response) => {

        console.log("file info response", response.data);

        const linkType = response.data.metadata.linkType;

        const shareURL = this.props.shareSelected.metadata.drive ? response.data.metadata.link : `${currentURL}/download-page/${this.props.shareSelected._id}/${this.props.shareSelected.metadata.link}`

        console.log("share link type", linkType, response.data);

        this.setState(() => ({
          ...this.state,
          shared: linkType ? true : false,
          loaded: true,
          shareableLink: shareURL
        }))

    }).catch((e) => {
      console.log("Cannot get share file data", e);
    })

  }

  componentDidUpdate = () => {

    // console.log("share model updated");

    // if (this.lastLoadedID !== this.props.shareSelected._id && this.props.shareSelected !== "") {

    //     if (this.props.shareSelected.metadata.link && !this.props.shareSelected.metadata.drive) {
    //       console.log("link already exists");

    //       this.lastLoadedID = this.props.shareSelected._id;

    //       const shareURL = this.props.shareSelected.metadata.drive ? results.data : `${currentURL}/download-page/${this.props.shareSelected._id}/${this.props.shareSelected.metadata.link}`

    //       return this.setState(() => {
    //           return {
    //               ...this.state,
    //               shareableLink: shareURL,
    //               loaded: true,
    //               public: true
    //           }
    //       })
    //     }

    //     this.lastLoadedID = this.props.shareSelected._id;

    //     console.log("share props", this.props.shareSelected)

    //     const url = this.props.shareSelected.metadata.drive ? currentURL +`/file-service-google/make-public/${this.props.shareSelected._id}` : currentURL +`/file-service/make-public/${this.props.shareSelected._id}`;

    //     console.log("share", url)

    //     axios.patch(url, undefined).then((results) => {

    //         this.props.shareSelected.metadata.link = results.data;

    //         this.props.dispatch(editFile(this.props.shareSelected._id,{"metadata": {
    //             ...this.props.shareSelected.metadata,
    //             link: results.data,
    //             linkType: "public"
    //         }}));

    //         const shareURL = this.props.shareSelected.metadata.drive ? results.data : `${currentURL}/download-page/${this.props.shareSelected._id}/${this.props.shareSelected.metadata.link}`

    //         this.setState(() => {
    //             return {
    //                 ...this.state,
    //                 shareableLink: shareURL,
    //                 loaded: true,
    //                 public: true
    //             }
    //         })
    //     })
        
    // }
  }

  sendEmail = (e) => {

    e.preventDefault()

    if (this.state.sendTo.length === 0 || !this.state.loaded) return;

    if (!this.state.shared) {
      Swal.fire({
        icon: 'error',
        title: 'You must share the file first',
        text: 'Select make public or make one time before sending email',
      })
      return;
    }

    console.log("sending email share request")

    const data = {
        file: {
            _id: this.props.shareSelected._id,
            resp: this.state.sendTo
        }
    }

    axios.post("/file-service/send-share-email", data).then((response) => {

        console.log("sent email share");


        this.setState(() => {
            return {
                ...this.state,
                emailSent: true
            }
        })

    }).catch((err) => {
        console.log("share file email failed", err)
        Swal.fire({
          icon: 'error',
          title: 'Cannot send share email',
          text: 'An error occurred when sending share email',
        })
    })

  }

  onChangeEmail = (e) => {

    const value = e.target.value;

    this.setState(() => {

        return {
            ...this.state,
            sendTo: value
        }
    })
  }

  closeShareModel = () => {

    this.props.dispatch(setShareSelected(""))
    this.setState(() => {
      return {
        shareableLink: "Fetching Link...",
        loaded: false,
        sendTo: "",
        emailSent: false,
        copySelected: false,
        public: false
      }
    })
    this.lastLoadedID = ''
  }

  copyClick = () => {

    if (!this.state.loaded) return;

    copy(this.state.shareableLink)

    console.log("link copied")

    this.setState(() => {
        return {
            ...this.state,
            copySelected: true
        }
    }, () => {

        console.log("new state set")

        window.setTimeout(() => {
        
            this.setState(() => {

                return {
                    ...this.state,
                    copySelected: false
                }
            })
        
        }, 750)
    })
  }

  removePublicLink = async() => {
   
    const url = this.props.shareSelected.metadata.drive ? `/file-service-google/remove-link/${this.props.shareSelected._id}` : `/file-service/remove-link/${this.props.shareSelected._id}`

    axios.delete(url, {
    }).then(() => {

        this.props.dispatch(editFile(this.props.shareSelected._id,{"metadata": {
            ...this.props.shareSelected.metadata,
            link: undefined,
            linkType: undefined
        }}))

        this.props.dispatch(editSelectedItem({link: undefined,
            linkType: undefined}))
        

        this.props.dispatch(editShareSelected({"metadata": {
            ...this.props.shareSelected.metadata,
            link: undefined,
            linkType: undefined
        }}))

        this.setState(() => ({
          ...this.state,
          shared: false,
        }))

        //this.closeShareModel();

    }).catch((err) => {
        console.log(err)
        Swal.fire({
          icon: 'error',
          title: 'Cannot remove public link',
          text: 'An error occurred when removing public link',
        })
    })
    
  }

  makePublic = () => {

    this.showingSwal = true;

    Swal.fire({
        title: 'Are you sure?',
        text: "Making this public, will allow anyone to have access to it",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, make public'
      }).then((result) => {

        this.showingSwal = false;
        
        if (result.value) {

            const url = this.props.shareSelected.metadata.drive ? `/file-service-google/make-public/${this.props.shareSelected._id}` : `/file-service/make-public/${this.props.shareSelected._id}`;
    
            axios.patch(url, undefined).then((results) => {
                
                this.props.dispatch(editFile(this.props.shareSelected._id,{"metadata": {
                    ...this.props.shareSelected.metadata,
                    link: results.data,
                    linkType: "public"
                }}))

                this.props.dispatch(editSelectedItem({link: results.data,
                    linkType: "public"}))
                

                this.props.dispatch(editShareSelected({"metadata": {
                    ...this.props.shareSelected.metadata,
                    link: results.data,
                    linkType: "public"
                }}))

                const shareURL = this.props.shareSelected.metadata.drive ? results.data : `${currentURL}/download-page/${this.props.shareSelected._id}/${results.data}`

                
                this.setState(() => ({
                  ...this.state,
                  shared: true,
                  shareableLink: shareURL
                }))

            }).catch((err) => {
                console.log(err)
                Swal.fire({
                  icon: 'error',
                  title: 'Cannot make public',
                  text: 'An error occurred when making file public'
                })
            })
        }
      })
  }

  makeOne = () => {

      this.showingSwal = true;

      Swal.fire({
          title: 'Are you sure?',
          text: "One time link, will allow anyone to access this file once",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, create link'
        }).then((result) => {

          this.showingSwal = false;
          
          if (result.value) {
      
              axios.patch(`/file-service/make-one/${this.props.shareSelected._id}`, undefined).then((results) => {
                  
                  this.props.dispatch(editFile(this.props.shareSelected._id,{"metadata": {
                      ...this.props.shareSelected.metadata,
                      link: results.data,
                      linkType: "one"
                  }}))

                  this.props.dispatch(editSelectedItem({link: results.data,
                      linkType: "one"}))

                  this.props.dispatch(editShareSelected({"metadata": {
                      ...this.props.shareSelected.metadata,
                      link: results.data,
                      linkType: "one"
                  }}))

                  this.setState(() => ({
                    ...this.state,
                    shared: true,
                  }))

                  const shareURL = this.props.shareSelected.metadata.drive ? results.data : `${currentURL}/download-page/${this.props.shareSelected._id}/${results.data}`

                  this.setState(() => ({
                    ...this.state,
                    shared: true,
                    shareableLink: shareURL
                  }))
      
              }).catch((err) => {
                  console.log(err)
                  Swal.fire({
                    icon: 'error',
                    title: 'Cannot make one time public link',
                    text: 'An error occurred when making one time public link',
                  })
              })
            

          }
        })

  }

  removeLink = () => {

    const url = this.props.shareSelected.metadata.drive ? `/file-service-google/remove-link/${this.props.shareSelected._id}` : `/file-service/remove-link/${this.props.shareSelected._id}`

    axios.delete(url, {
    }).then(() => {

        this.props.dispatch(editFile(this.props.shareSelected._id,{"metadata": {
            ...this.props.shareSelected.metadata,
            link: undefined,
            linkType: undefined
        }}))

        this.props.dispatch(editSelectedItem({link: undefined,
            linkType: undefined}))
        

        this.props.dispatch(editShareSelected({"metadata": {
            ...this.props.shareSelected.metadata,
            link: undefined,
            linkType: undefined
        }}))
    }).catch((err) => {
        console.log(err)
        Swal.fire({
          icon: 'error',
          title: 'Cannot remove public link',
          text: 'An error occurred when removing public link',
        })
    })
  }

  render() {
    return (
      <div class="modal__wrap" style={this.props.shareSelected !== "" ? {display:"block"} : {display:"none"}}>
        <div class="inner__modal">
          <div class="share__modal">
            <div class="share__head">
              <div class="share__type">
                <img src="/assets/extension1.svg" alt="extension" />
              </div>
              <div class="share__info">
                <p>{this.props.shareSelected !== "" ? capitalize(this.props.shareSelected.filename) : ""}</p>
                <span>{this.props.shareSelected !== "" ? bytes(this.props.shareSelected.length) : 0}</span>
              </div>
              <div class="close__modal">
                <a>
                  <img src="/assets/close.svg" alt="close" onClick={this.closeShareModel}/>
                </a>
              </div>
            </div>
            <div class="share__recipient">
              <p>Send to:</p>
              <form onSubmit={this.sendEmail}>
                <div class="group__input float__span">
                  <input onChange={this.onChangeEmail} value={this.state.sendTo} type="text" placeholder="Email Address"/>
                  {/* <span>Email address</span> */}
                </div>
                <div class="group__submit">
                  <input type="submit" value="Send" />
                </div>
              </form>
              <div class="share__success" style={this.state.emailSent ? {display:"block"} : {display:"none"}}>
                <p>
                  <span>
                    <img src="/assets/success.svg" alt="success" />
                  </span>{" "}
                  Email sent successfully
                </p>
              </div>
            </div>
            <div className="share-model-spinner-wrapper" style={!this.state.loaded ? {} : {display: "none"}}>
              <SpinnerPage />
            </div>
            <div className="share-model-share-buttons-wrapper" style={!this.state.shared && this.state.loaded ? {} : {display:"none"}}>
              <div className="share-button__wrapper">
                <button onClick={this.makePublic} className="button popup-window__button">Make Public</button>
              </div>
              <div className="share-button__wrapper">
                <button onClick={this.makeOne} style={this.props.shareSelected.metadata.drive ? {display: "none"} : {}} className="button popup-window__button">Make One Time Link</button>
              </div>
            </div>
            <div class="get__share--link" style={this.state.shared ? {} : {display: "none"}}>
              <p>File link:</p>
              <div class="get__link">
                <div class="copied__wrap" style={this.state.copySelected ? {display: "block"} : {display:"none"}}>
                  <p>
                    <img src="/assets/copiedcheck.svg" alt="check" /> Copied
                  </p>
                </div>
                <input
                  type="text"
                  value={this.state.shareableLink}
                  readonly
                />
                <a onClick={this.copyClick}>
                  <img src="/assets/copy.svg" alt="copy" />
                </a>
              </div>
            </div>
            <div className="share-button__wrapper" style={this.state.shared ? {} : {display:"none"}}>
              <button onClick={this.removePublicLink} className="button popup-window__button">Remove Public Access</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const connectStoreToProp = (state) => ({
    shareSelected: state.selectedItem.shareSelected
})

export default connect(connectStoreToProp)(ShareModelContainer);
