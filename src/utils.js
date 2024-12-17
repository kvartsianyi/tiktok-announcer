export const log = message => console.log(message);
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));