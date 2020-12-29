import React from "react";

const ShareMenu = React.forwardRef((props, ref) => {

    if (props.shareSelected === "") {

        return (
            <div className="sharemenu sharemenu--gone" ref={ref}>
            
            </div>
        )

    } else {
    
        return (
            <div div className="sharemenu"
            ref={ref}>

            {props.shareSelected.metadata.link ? 
                
                <div className="sharemenu--block">
                    <img className="sharemenu__close-button" onClick={props.hide} src="/images/close_icon.png"/>
                    <div className="sharemenu__link__wrapper">
                        <img onClick={props.copyLink} className="sharemenu__image" src="/images/copy.svg"/>
                        <p onClick={props.copyLink} className="sharemenu__title">{props.state.title}</p>
                    </div>
                    <button className="sharemenu__button__public" onClick={props.removeLink}>Remove Link</button>
                
                </div>

                :
                <div className="sharemenu--block">
                    <img className="sharemenu__close-button" onClick={props.hide} src="/images/close_icon.png"/>
                    <button className="sharemenu__button__public" onClick={props.makePublic}>Make Public</button>
                    <p className="sharemenu__subtitle">Or</p>
                    <button className="sharemenu__button__public" onClick={props.makeOne}>Create One Time Link</button>
                </div>
            }
            
            </div>
        )

    }

})

export default ShareMenu