import paho.mqtt.client as mqtt
import json
import http.client
from dotenv import load_dotenv #==0.0.5 , python-dotenv==0.10.1
load_dotenv()
import os

mqtt_host = os.getenv(MQTT)
mqtt_port = os.getenv(MQTT_PORT)
mqtt_topic = os.getenv(MQTT_TOPIC)

MQTT = mqtt_host
MQTT_Port = mqtt_port
MQTT_Topic = mqtt_topic

camera_today = '327620'
k = "{\"camera_today\":"+camera_today+"}"

mqttc = mqtt.Client("python_pub")
mqttc.connect(MQTT, MQTT_Port)
mqttc.publish(MQTT_Topic, k)
