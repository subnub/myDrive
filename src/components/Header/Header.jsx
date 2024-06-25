import React from "react";
import { useNavigate } from "react-router-dom";

const Header = (props) => {
  const navigate = useNavigate();

  return (
    <header>
      <div className="container">
        <div className="outer__header">
          <div className="left__header">
            <div className="logo__wrapper">
              <a onClick={() => navigate("/")}>
                <img
                  className="header__icon"
                  src="/images/mydrive-logo.png"
                  alt="logo"
                />
              </a>
            </div>
            <div className="search__wrapper">
              <a href="#">
                <img src="/assets/searchicon.svg" alt="search" />
              </a>
              <input
                type="text"
                onChange={props.searchOnChange}
                value={props.search}
                placeholder="Search"
                onFocus={props.showSuggested}
                onBlur={props.hideSuggested}
              />
              <div
                className="search__files--dropdown"
                style={
                  props.state.focused && props.searchValue.length !== 0
                    ? { display: "block" }
                    : { display: "none" }
                }
              >
                <div
                  onMouseDown={props.selectSuggestedByParent}
                  className="elem__search--files search__filter--local"
                >
                  <a>
                    Search for{" "}
                    <span className="file__name">{props.searchValue}</span>
                    <span className="spacer">
                      <img src="/assets/spacer.svg" alt="spacer" />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="right__header">
            <div className="profile__info">
              <div className="settings__button">
                <a onClick={props.goToSettings}>
                  <img src="/assets/settings.svg" alt="settings" />
                </a>
              </div>
              <div className="profile__wrapper">
                <div className="profile__button">
                  <a style={{ backgroundColor: "#3c85ee" }}>
                    <span style={{ color: "#fff" }}>
                      {props.getProfilePic()}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
