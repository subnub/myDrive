import React from "react";

const GoogleAccountPage = (props) => (
  <div
    className="modal__wrap"
    style={!props.state.accountDetailsLoaded ? { background: "unset" } : {}}
  >
    <div className="inner__modal">
      {props.state.accountDetailsLoaded ? (
        <div className="password__modal">
          <div className="head__password">
            <h2>Google Account</h2>
            <div className="close__modal">
              {/* <a onClick={props.changeShowAddName}><img src="/assets/close.svg" alt="close"/></a> */}
            </div>
          </div>
          <div className="password__content">
            <form onSubmit={props.addGoogleAccount}>
              {/* <div className="group__password">
                            <input value={props.state.name} onChange={props.onChangeAddName} placeholder="Name"/>
                        </div> */}
              <div className="password__submit">
                <input
                  type="submit"
                  value={
                    props.state.accountAdded ? "Go Back" : "Add Google Account"
                  }
                />
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div>
          <p>{props.state.info}</p>
        </div>
      )}
    </div>
  </div>
);

export default GoogleAccountPage;
