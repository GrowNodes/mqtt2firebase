const mqtt = require('mqtt')
const mqttClient = mqtt.connect('mqtt://demo.grownodes.com')
var fb_admin = require("firebase-admin");

var serviceAccount = require("./grownodes-fb-service-account.json");

fb_admin.initializeApp({
  credential: fb_admin.credential.cert(serviceAccount),
  databaseURL: "https://grownodes.firebaseio.com"
});

var fb_db_ref = fb_admin.database().ref("grownodes");

mqttClient.subscribe('nodes/+/air_sensor/humidity')
mqttClient.subscribe('nodes/+/air_sensor/temperature')
mqttClient.subscribe('nodes/+/water_temp/temperature')
mqttClient.on('message', handleMsg);



function handleMsg(topic, payload) {
  const msg_text = payload.toString()

  const topic_without_root = topic.replace('nodes/','')
  var node_serial = topic_without_root.split('/')[0];
  var sensor_name = topic_without_root.split('/')[1]
  var attribute_name = topic_without_root.split('/')[2];;
  console.log(node_serial, sensor_name, attribute_name)

  const timestamp = Math.floor(Date.now() / 1000);

  fb_db_ref.child(`${node_serial}/log_${sensor_name}`).push({
	  timestamp: timestamp,
	  [attribute_name]: msg_text
	});
}