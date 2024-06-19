import React from "react";

const GoogleAccountPage = (props) => (
    <div class="modal__wrap" style={!props.state.accountDetailsLoaded ? {background: 'unset'} : {}}>
        <div class="inner__modal">
            {props.state.accountDetailsLoaded ? 
            <div class="password__modal">
                <div class="head__password">
                    <h2>Google Account</h2>
                    <div class="close__modal">
                        {/* <a onClick={props.changeShowAddName}><img src="/assets/close.svg" alt="close"/></a> */}
                    </div>
                </div>
                <div class="password__content">
                    <form onSubmit={props.addGoogleAccount}>
                        {/* <div class="group__password">
                            <input value={props.state.name} onChange={props.onChangeAddName} placeholder="Name"/>
                        </div> */}
                        <div class="password__submit">
                        <input type="submit" value={props.state.accountAdded ? 'Go Back' : "Add Google Account"}/>
                        </div>
                    </form>
                </div>
            </div>  :
            <div>
                <p>{props.state.info}</p>
            </div>  
        }
        </div>
    </div>
)

export default GoogleAccountPage;