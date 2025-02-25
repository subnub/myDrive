// class CachedSubsriptions {

//     cachedSubscriptionStatuses: any;
    
//     constructor() {
//         this.cachedSubscriptionStatuses = {}
//     }

//     addToCachedSubscriptionStatus = (userID: string) => {
//         this.cachedSubscriptionStatuses[userID] = true;
//         console.log("new cached", this.cachedSubscriptionStatuses)
//     } 

//     checkCachedSubscriptionStatus = (userID: string) => {
//         console.log("cache check", this.cachedSubscriptionStatuses)
//         return this.cachedSubscriptionStatuses[userID];
//     }
// }

// export default CachedSubsriptions;

// const cachedSubscriptionStatuses: any = {};

// export default cachedSubscriptionStatuses;

// import redis from "redis";

// const client = redis.createClient();

// export const setCachedValue = (userID: string) => {

//     const date = new Date();

//     return new Promise((resolve, reject) => {
//         client.set(userID, date.getTime().toString(), (err, res) => {
//             if (err) {
//                 console.log("Redis key err", err);
//                 reject()
//             }
//             resolve();
//         });
//     })
// }

// export const checkCachedValue = (userID: string) => {

//     return new Promise((resolve, reject) => {
//         client.get(userID, (err) => {
//             if (err) {
//                 console.log("Redis key err", err);
//                 reject()
//             } else {
//                 resolve();
//             }
//         })
//     })
// }