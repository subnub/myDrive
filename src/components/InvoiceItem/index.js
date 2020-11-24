import React from "react";
import Swal from "sweetalert2";
import InvoiceItem from "./InvoiceItem";

class InvoiceItemContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            disabled: false,
        }
    }

    downloadInvoice = () => {

        if (this.state.disabled) return;

        if (this.props.currentInvoice.invoice_pdf) {

            const finalUrl = this.props.currentInvoice.invoice_pdf;
            
            const link = document.createElement('a');
            document.body.appendChild(link);
            link.href = finalUrl;
            link.setAttribute('type', 'hidden');
            link.click();

            this.setState(() => {
                return {
                    ...this.state,
                    disabled: true
                }
            }, () => {

                setTimeout(() => {
                   this.setState(() => {
                        return {
                            ...this.state,
                            disabled: false
                        }
                   })
                }, 2000);
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error no invoice data, please contact admin',
              })
        }
    }

    render() {
        return <InvoiceItem 
                    downloadInvoice={this.downloadInvoice} 
                    state={this.state}
                    {...this.props}/>
    }
}

export default InvoiceItemContainer;