import React from "react";

class MoverModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="modal__wrap" style="display:none;">
        <div className="inner__modal">
          <div className="destination__modal">
            <div className="destination__head">
              <h2>Choose destination</h2>
              <div className="close__modal">
                <a href="#">
                  <img src="/assets/close.svg" alt="close" />
                </a>
              </div>
            </div>
            <div className="destination__structure">
              <div className="folder__structure">
                <div className="elem__structure">
                  <div className="parent__structure">
                    <span>
                      <i className="fas fa-caret-right"></i>
                    </span>
                    <div className="info__name">
                      <p>myDrive</p>
                    </div>
                  </div>
                  <div className="child__structure" style="display:none;">
                    <div className="elem__structure">
                      <div className="parent__structure">
                        <span>
                          <i className="fas fa-caret-right"></i>
                        </span>
                        <div className="info__name">
                          <p>
                            <span>
                              <i className="fas fa-folder"></i>
                            </span>
                            Images
                          </p>
                        </div>
                      </div>
                      <div className="child__structure" style="display:none;">
                        <div className="elem__structure">
                          <div className="parent__structure last__structure">
                            <div className="info__name">
                              <p>
                                <span>
                                  <i className="fas fa-folder"></i>
                                </span>
                                Videos
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="child__structure" style="display:none;">
                    <div className="elem__structure">
                      <div className="parent__structure">
                        <span>
                          <i className="fas fa-caret-right"></i>
                        </span>
                        <div className="info__name">
                          <p>
                            <span>
                              <i className="fas fa-folder"></i>
                            </span>
                            Images
                          </p>
                        </div>
                      </div>
                      <div className="child__structure" style="display:none;">
                        <div className="elem__structure">
                          <div className="parent__structure last__structure">
                            <div className="info__name">
                              <p>
                                <span>
                                  <i className="fas fa-folder"></i>
                                </span>
                                Videos
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="elem__structure">
                  <div className="parent__structure">
                    <span>
                      <i className="fas fa-caret-right"></i>
                    </span>
                    <div className="info__name">
                      <p>Amazon S3</p>
                    </div>
                  </div>
                </div>
                <div className="elem__structure">
                  <div className="parent__structure">
                    <span>
                      <i className="fas fa-caret-right"></i>
                    </span>
                    <div className="info__name">
                      <p>Google Drive</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="destination__move">
              <a href="#">Move To Folder</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MoverModel;
