// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const axios = require('axios');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function elevatorHandler() {
    return axios.get(`https://tranquil-reaches-97237.herokuapp.com/api/elevators`);
  }
  
  function statusHandler() {
    return axios.get(`https://tranquil-reaches-97237.herokuapp.com/api/interventions`);
  }
  
  function buildingHandler() {
  	return axios.get(`https://tranquil-reaches-97237.herokuapp.com/api/buildings`);
  }
  
  function customerHandler() {
  	return axios.get(`https://tranquil-reaches-97237.herokuapp.com/api/customers`);
  }
  
  function batteriesHandler() {
  	return axios.get(`https://tranquil-reaches-97237.herokuapp.com/api/batteries`);
  }
  
  function addressesHandler() {
  	return axios.get(`https://tranquil-reaches-97237.herokuapp.com/api/addresses`);
  }
  
  function elevators(agent) {
    var id = agent.parameters.id;
    agent.add(`The status for elevator ${id} is:`);
  	return axios.get(`https://tranquil-reaches-97237.herokuapp.com/api/elevators/${id}`)
    .then(function (elevStatus){
      const elev1 = elevStatus.data;
      console.log(elev1.status);
      agent.add(`${elev1.status}`);
    });
  }
  
   function quotesHandler() {
     return axios.get(`https://tranquil-reaches-97237.herokuapp.com/api/quotes`);
   }
  
	//function interventionHandler(agent) {
    //	return axios.get(`https://tranquil-reaches-97237.herokuapp.com/api/interventions/8`).then((result) => {
      //    console.log(result.data);
       //   var wordObj = result.data.map(wordObj => {
       //     console.log(wordObj.status);
       //     agent.add(`what if i ${wordObj.status} ok`);
       //   });
       //   agent.add(`what if i ${wordObj.status} nevermind`);
       // });
  //  }
  
  function cityHandler() {
     return axios.all([elevatorHandler()])
    .then(axios.spread(function (address) {
  	  const addr = address.data;
      let city = [];
      for (let i=0; i < addr.length; i++) {
      	city.push(addr.data[i].city);
        //var totalCities = new Set(city).size;
        //agent.add(`There are ${elev} elevators deployed in the ${build} buildings of your ${cust} customers. Currently, ${stat} elevators are not in Running Status and are being serviced.${batt} Batteries are deployed across ${totalCities} cities`);
      }}));
  }
  
  function liftStatus(){ 
    // var id = agent.parameter.id;
    return axios.get(`https://tranquil-reaches-97237.herokuapp.com/api/elevators/5`);
  }
  
  function getElevator(agent) {
  	return axios.all([liftStatus()])
    .then(axios.spread(function(elev) {
      const lift = elev.data.status;
      //const stringLift = JSON.stringify(lift.data);
      //console.log(lift);
      //response.json({ message: 'Request received!', lift });
      agent.add(`hello ${lift}`);
    }));
  }
  
  function getGreeting(agent) {
    return axios.all([elevatorHandler(), buildingHandler(), customerHandler(), batteriesHandler(), statusHandler(), addressesHandler(), quotesHandler()])
    .then(axios.spread(function (elevator, building, customer, battery, status, addresses, quotes) {
      const elev = elevator.data.length;
      const build = building.data.length;
      const cust = customer.data.length;
      const batt = battery.data.length;
      const stat = status.data.length;
      const addr = addresses.data.length;
      const quot = quotes.data.length;
      
      agent.add(`Greetings! There are ${elev} elevators deployed in the ${build} buildings of your ${cust} customers. Currently, ${stat} elevators are not in Running Status and are being serviced. ${batt} Batteries are deployed across ${addr} cities. You also have ${quot} leads in your contact requests.`);
     }));
  }
  
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  let newPromise = new Map();
  intentMap.set('Greetings', getGreeting);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Elevators', elevators);
  //intentMap.set('Interventions', statusHandler);
  agent.handleRequest(intentMap);
  //agent.handleRequest(newPromise);
});
