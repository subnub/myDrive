import React from "react";

class ParentBarChild extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                <span class="spacer__path">
                    <img src="/assets/spacer.svg" alt="spacer" />
                </span>
            <p class="current__folder">{this.props.name}</p>
            </div>
        )
    }
}

export default ParentBarChild;