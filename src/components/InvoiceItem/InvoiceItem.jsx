import React from "react";
import moment from "moment";

const InvoiceItem = (props) => (
    <tr>
        <td class="date__history">{moment.unix(props.currentInvoice.created).format("L")}</td>
        <td class="plan__history">myDrive Standard Plan</td>
        <td class="amount__history">{'$' + parseInt(props.currentInvoice.amount_due, 10) / 100}</td>
        <td class={props.currentInvoice.paid ? "status__history" : "status__history unpaid"}>{props.currentInvoice.paid ? "Paid" : "Unpaid"}</td>
        <td>
        <a onClick={props.downloadInvoice}>Invoice</a>
        </td>
    </tr>
)

export default InvoiceItem;