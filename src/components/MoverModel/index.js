import React from "react";

class MoverModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div class="modal__wrap" style="display:none;">
        <div class="inner__modal">
          <div class="destination__modal">
            <div class="destination__head">
              <h2>Choose destination</h2>
              <div class="close__modal">
                <a href="#">
                  <img src="/assets/close.svg" alt="close" />
                </a>
              </div>
            </div>
            <div class="destination__structure">
              <div class="folder__structure">
                <div class="elem__structure">
                  <div class="parent__structure">
                    <span>
                      <i class="fas fa-caret-right"></i>
                    </span>
                    <div class="info__name">
                      <p>myDrive</p>
                    </div>
                  </div>
                  <div class="child__structure" style="display:none;">
                    <div class="elem__structure">
                      <div class="parent__structure">
                        <span>
                          <i class="fas fa-caret-right"></i>
                        </span>
                        <div class="info__name">
                          <p>
                            <span>
                              <i class="fas fa-folder"></i>
                            </span>
                            Images
                          </p>
                        </div>
                      </div>
                      <div class="child__structure" style="display:none;">
                        <div class="elem__structure">
                          <div class="parent__structure last__structure">
                            <div class="info__name">
                              <p>
                                <span>
                                  <i class="fas fa-folder"></i>
                                </span>
                                Videos
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="child__structure" style="display:none;">
                    <div class="elem__structure">
                      <div class="parent__structure">
                        <span>
                          <i class="fas fa-caret-right"></i>
                        </span>
                        <div class="info__name">
                          <p>
                            <span>
                              <i class="fas fa-folder"></i>
                            </span>
                            Images
                          </p>
                        </div>
                      </div>
                      <div class="child__structure" style="display:none;">
                        <div class="elem__structure">
                          <div class="parent__structure last__structure">
                            <div class="info__name">
                              <p>
                                <span>
                                  <i class="fas fa-folder"></i>
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
                <div class="elem__structure">
                  <div class="parent__structure">
                    <span>
                      <i class="fas fa-caret-right"></i>
                    </span>
                    <div class="info__name">
                      <p>Amazon S3</p>
                    </div>
                  </div>
                </div>
                <div class="elem__structure">
                  <div class="parent__structure">
                    <span>
                      <i class="fas fa-caret-right"></i>
                    </span>
                    <div class="info__name">
                      <p>Google Drive</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="destination__move">
              <a href="#">Move To Folder</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MoverModel;