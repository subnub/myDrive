import React from "react";
import bytes from "bytes";

const AddStorageItem = (props) => (
  <div
    className={
      !props.loaded
        ? "elem__storage"
        : props.userDetails.activeSubscription &&
          props.userDetails.planID === props.plan.id
        ? "elem__storage completed__storage"
        : "elem__storage"
    }
  >
    <div className="head__storage">
      <div className="info__storage">
        <p>
          {bytes(+props.plan.metadata.amount)} - {props.plan.interval_count}{" "}
          {props.plan.interval}(s)
        </p>
        <span className="status__text">
          {"$" + parseInt(props.plan.amount, 10) / 100}
        </span>
      </div>
      <div
        style={
          !props.loaded
            ? { display: "none" }
            : props.userDetails.activeSubscription &&
              props.userDetails.planID === props.plan.id
            ? { display: "block" }
            : { display: "none" }
        }
        className="success__storage"
      >
        <img src="/assets/checked.svg" alt="checked" />
      </div>
      <div
        style={
          !props.loaded
            ? {}
            : props.userDetails.activeSubscription &&
              props.userDetails.planID === props.plan.id
            ? { display: "none" }
            : {}
        }
        className="add__storage"
      >
        <a onClick={props.openDetails}>Details</a>
      </div>
    </div>
    <div
      className="storage__main"
      style={props.state.open ? { display: "block" } : { display: "none" }}
    >
      <p>
        Subscribe to myDrive, {bytes(+props.plan.metadata.amount)} of data for{" "}
        {"$" + parseInt(props.plan.amount, 10) / 100}, reoccuring every{" "}
        {props.plan.interval_count} {props.plan.interval}(s).
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button onClick={() => props.selectPlan(props.plan)}>Subscribe</button>
      </div>
    </div>
  </div>
);

export default AddStorageItem;
