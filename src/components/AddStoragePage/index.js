import React from "react";
import axios from "../../axiosInterceptor";
import Swal from "sweetalert2"
import env from "../../enviroment/envFrontEnd";
import AddStoragePage from "./AddStoragePage";

class AddStoragePageContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            storagePlans: [],
            loaded: false,
            planSelected: false,
            selectedDetails: {},
            creditCardNumber: "",
            creditCardCVC: "",
            creditCardExpiry: "",
            creditCardNumberError: false,
            creditCardExpiryError: false,
            creditCardCVCError: false,
            userDetails: {},
            loaded: false,
            showCreditCard: false,
            paymentLoading: false,
        }
    }

    getUserDetails = () => {

        axios.get("/user-service/user-detailed").then((response) => {
            
            this.setState(() => {
                return {
                    ...this.state,
                    loaded: true,
                    userDetails: response.data
                }
            })
        }).catch((err) => {
            console.log("Loading user details error", err);
        })
        
    }

    componentDidMount = () => {

        this.getUserDetails();

        axios.get("/user-service/get-plans").then((response) => {

            this.setState(() => {
                return {
                    ...this.state,
                    storagePlans: response.data.data,
                    loaded: true
                }
            })

        }).catch((err) => {
            console.log("get plans error");
        })
    }

    selectPlan = (plan) => {
        
        if (this.state.planSelected) {
            return this.setState(() => {
                return {
                    ...this.state,
                    planSelected: false,
                    selectedDetails: {},
                    showCreditCard: false
                }
            })
        } else {
            this.setState(() => {
                return {
                    ...this.state,
                    planSelected: true,
                    selectedDetails: plan,
                    showCreditCard: true
                }
            })
        }


    }

    onChangeCreditCardNumber = (e) => {

        let value = e.target.value

        if (value.length < this.state.creditCardNumber.length) {
            return this.setState(() => {
                return {
                    ...this.state,
                    creditCardNumber: value,
                    creditCardNumberError: false
                }
            })
        } 
    
        const numericalValue = value.replace(/[^0-9.]/g,"")

        let reconstucted = '';

        for (let currentChar of numericalValue) {
         
            reconstucted += currentChar;

            const numericalOnly = reconstucted.replace(/[^0-9.]/g,"")

            if (numericalOnly.length !== 16 && numericalOnly.length % 4 === 0) {
                reconstucted += '-'
            } else if (numericalOnly.length >= 16) {
                break;
            }
        }

        this.setState(() => {
            return {
                ...this.state,
                creditCardNumber: reconstucted,
                creditCardNumberError: false
            }
        })
    }

    onChangeCreditCardCVC = (e) => {

        let value = e.target.value
        
        value = value.replace(/[^0-9.]/g,"");

        if (value.length >= 4) {
            return;
        }

        this.setState(() => {
            return {
                ...this.state,
                creditCardCVC: value,
                creditCardCVCError: false
            }
        })
    }

    onChangeCreditCardExpiry = (e) => {

        let value = e.target.value

        if (value.length < this.state.creditCardExpiry.length) {
            return this.setState(() => {
                return {
                    ...this.state,
                    creditCardExpiry: value,
                    creditCardExpiryError: false,
                }
            })
        }

        const numericalValue = value.replace(/[^0-9.]/g,"")

        let reconstucted = ''

        
        for (let currentChar of numericalValue) {
         
            reconstucted += currentChar;

            const numericalOnly = reconstucted.replace(/[^0-9.]/g,"")

            if (numericalOnly.length === 2) {
                reconstucted += '/'
            } else if (numericalOnly.length >= 4) {
                break;
            }
        }
        
        this.setState(() => {
            return {
                ...this.state,
                creditCardExpiry: reconstucted,
                creditCardExpiryError: false,
            }
        })
    }

    pay = (e) => {

        e.preventDefault();

        if (this.state.paymentLoading) {
            return;
        }

        const creditCardNumber = this.state.creditCardNumber;
        const creditCardCVC = this.state.creditCardCVC;
        const creditCardExpiry = this.state.creditCardExpiry;

        let ccNumError = false;
        let ccCVCError = false;
        let ccExpiryError = false;

        if (creditCardNumber.replace(/[^0-9.]/g,"").length !== 16) {
            ccNumError = true;
        } 
        
        if (creditCardCVC.replace(/[^0-9.]/g,"").length !== 3) {
            ccCVCError = true
        } 
        
        if (creditCardExpiry.replace(/[^0-9.]/g,"").length !== 4) {
            ccExpiryError = true;
        }

        if (ccNumError || ccCVCError || ccExpiryError) {
            return this.setState(() => {
                return {
                    ...this.state,
                    creditCardNumberError: ccNumError,
                    creditCardExpiryError: ccExpiryError,
                    creditCardCVCError: ccCVCError
                }
            })
        }


        const data = {
            card: {
                number: creditCardNumber,
                expiry: creditCardExpiry,
                cvc: creditCardCVC,
                id: this.state.selectedDetails.id
            }
        }

        Swal.fire({
            title: 'Confirm Payment',
            text: `Confirm ${'$' + parseInt(this.state.selectedDetails.amount, 10) / 100} payment`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Pay'
          }).then((result) => {
            if (result.value) {

                this.setState(() => {
                    return {
                        ...this.state,
                        paymentLoading: true
                    }
                })
        
                axios.post("/user-service/create-subscription", data).then((response) => {
        
                    this.setState(() => {
                        return {
                            ...this.state,
                            paymentLoading: false
                        }
                    })
                    
                    Swal.fire(
                        'Payment Successful',
                        'Thank You! Payment Was Successful',
                        'success'
                      ).then(() => {
                          window.location.assign(env.url)
                      })

                }).catch((e) => {
                    console.log("create stripe token err", e);
                    this.setState(() => {
                        return {
                            ...this.state,
                            paymentLoading: false
                        }
                    })
                    Swal.fire({
                        icon: 'error',
                        title: 'Payment Error',
                        text: 'Could Not Process Payment',
                      })
                })
            }
          })
    }

    removeSubscription = () => {
        
        Swal.fire({
            title: 'Remove Subscription?',
            text: "This will remove all myDrive files",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel subscription'
          }).then((result) => {
            if (result.value) {

              axios.delete('/user-service/remove-subscription').then((response) => {

                Swal.fire(
                    'Subscription Removed',
                    'Your subscription for myDrive has been canceled.',
                    'success'
                ).then(() => {
                    window.location.assign(env.url)
                    
                })

              }).catch((err) => {
                  console.log("could not remove subscription", err);
                  Swal.fire({
                    icon: 'error',
                    title: 'Remove Subscription Error',
                    text: 'Could Not Renive Subscription',
                  })
              })


            }
          })
    }

    render() {

        return (

            <AddStoragePage
            removeSubscription={this.removeSubscription}
            pay={this.pay}
            onChangeCreditCardExpiry={this.onChangeCreditCardExpiry}
            onChangeCreditCardCVC={this.onChangeCreditCardCVC}
            onChangeCreditCardNumber={this.onChangeCreditCardNumber}
            selectPlan={this.selectPlan}
            getUserDetails={this.getUserDetails}
            state={this.state} 
            {...this.props}/>
            // <div>

            //     <div className="storage__back">

            //     <div class="storage__block">
            //             <div class="inner__storage">
            //                 <div class="login__logo">
            //                     <img src="/images/icon.png" alt="logo"/>
            //                 </div>
            //                 <div class="storage__main">
            //                     <h2>Select Storage Plan</h2>
            //                     <div class="wrap__storage--elements">
            //                         {this.state.storagePlans.map((currentPlan) => <AddStorageItem selectPlan={this.selectPlan} plan={currentPlan} loaded={this.state.loaded} userDetails={this.state.userDetails}/>)}
            //                     </div>
            //                 </div>
            //                 {!this.state.loaded ? undefined : this.state.userDetails.activeSubscription ? 
            //                 <div className="add-storage-card__button-wrapper">
            //                     <button className="storage-item__button" onClick={this.removeSubscription}>Remove Subscription</button>
            //                 </div> : undefined} 
            //             </div>
            //         </div>
            //     </div>

            //     <div class="modal__wrap" style={this.state.showCreditCard ? {display:"block"} : {display:"none"}}>
            //         <div class="inner__modal">
            //             <div class="password__modal">
            //                 <div class="head__password">
            //                 <h2>Subscribe - {'$' + parseInt(this.state.selectedDetails.amount, 10) / 100} / {this.state.selectedDetails.interval_count} {this.state.selectedDetails.interval}(s)</h2>
            //                     <div class="close__modal">
            //                         <a onClick={this.selectPlan}><img src="/assets/close.svg" alt="close"/></a>
            //                     </div>
            //                 </div>
            //                 <div class="password__content">
            //                     <form onSubmit={this.pay}>
            //                         <div class="group__password" style={this.state.creditCardNumberError ? {border:'2px solid red'} : {}}>
            //                             <input value={this.state.creditCardNumber} onChange={this.onChangeCreditCardNumber} placeholder="Credit Card Number"/>
            //                         </div>
            //                         <div class="group__password" style={this.state.creditCardExpiryError ? {border:'2px solid red'} : {}}>
            //                             <input value={this.state.creditCardExpiry} onChange={this.onChangeCreditCardExpiry} placeholder="(MM/YY) Expiration Date"/>
            //                         </div>
            //                         <div class="group__password" style={this.state.creditCardCVCError ? {border:'2px solid red'} : {}}>
            //                             <input value={this.state.creditCardCVC} onChange={this.onChangeCreditCardCVC} placeholder="Credit Card CVC"/>
            //                         </div>
            //                         <div class="password__submit">
            //                             <input type="submit" value="Submit"/>
            //                         </div>
            //                     </form>
            //                 </div>
            //                 <div style={this.state.paymentLoading ? {
            //                     display: "flex",
            //                     justifyContent: "center",
            //                     alignItems: "center",
            //                     height: "61px",
            //                     paddingBottom: "23px"
            //                 } : {display: "none"}}>
            //                     <SpinnerLogin />
            //                 </div>
            //             </div>
            //         </div>
            //     </div>

            //     {/* {!this.state.planSelected ? 
                
            //     // <div className="add-storage__box">

            //     //     <p className="add-storage__title">Storage Plans</p>
                    
            //     //     <div className="add-storage__body">

            //     //         {this.state.storagePlans.map((currentPlan) => <AddStorageItem selectPlan={this.selectPlan} plan={currentPlan}/>)} 
            //     //     </div>

            //     //     {!this.state.loaded ? undefined : this.state.userDetails.activeSubscription ? <div className="add-storage-card__button-wrapper">
            //     //         <button className="storage-item__button" onClick={this.removeSubscription}>Remove Subscription</button>
            //     //     </div> : undefined} 

            //     // </div>
            //     <div className="storage__back">

            //         <div class="storage__block">
            //                 <div class="inner__storage">
            //                     <div class="login__logo">
            //                         <img src="/images/icon.png" alt="logo"/>
            //                     </div>
            //                     <div class="storage__main">
            //                         <h2>Select Storage Plan</h2>
            //                         <div class="wrap__storage--elements">
            //                             {this.state.storagePlans.map((currentPlan) => <AddStorageItem selectPlan={this.selectPlan} plan={currentPlan}/>)}
            //                         </div>
            //                     </div>
            //                 </div>
            //             </div>

            //     </div>
                
            //     :

            //     <div className="add-storage-card__wrapper">

            //         <div className="add-storage-card__close-wrapper">
            //             <img onClick={this.selectPlan} className="add-storage-card__close" src="/images/close_icon.png"/>
            //         </div>

            //         <div className="add-storage-card__title-wrapper">
            //             <p className="add-storage-card__title">{bytes(+this.state.selectedDetails.metadata.amount)} Plan / {this.state.selectedDetails.interval_count} {this.state.selectedDetails.interval}(s)</p>
            //         </div>

            //         <div className="add-storage-card__number-wrapper">
            //             <input className="add-storage-card__number" onChange={this.onChangeCreditCardNumber} value={this.state.creditCardNumber} placeholder="Credit Card Number"/>
            //         </div>

            //         <div className="add-storage-card__expiry-wrapper"> 
            //             <input className="add-storage-card__expiry" onChange={this.onChangeCreditCardExpiry} value={this.state.creditCardExpiry} placeholder="Expire Date (MM/YYYY)"/>
            //             <input className="add-storage-card__cvc" onChange={this.onChangeCreditCardCVC} value={this.state.creditCardCVC} placeholder="CVC"/>
            //         </div>

            //         <div className="add-storage-card__button-wrapper">
            //             <button className="storage-item__button" onClick={this.pay}>Pay {'$' + parseInt(this.state.selectedDetails.amount, 10) / 100}</button>
            //         </div>

            //     </div>
                
            //     } */}

            // </div>
        
        )
    }
}

export default AddStoragePageContainer;