import paho.mqtt.client as mqtt #==1.5.0
import json
import pymongo #==3.8.0
from bson.objectid import ObjectId
from dateutil import parser #==2.8.0
import datetime
import time
from dotenv import load_dotenv #==0.0.5 , python-dotenv==0.10.1
load_dotenv()
import os



def update_data_mlab(data):
    mlab = os.getenv(MLAB)
    data_objectid = os.getenv(MLAB_OBJECTID)
    myclient = pymongo.MongoClient(mlab)
    mydb = myclient["smart-data-center"]
    mycol = mydb["cameraPower"]

    mlabdatetime = data['mlabdatetime']
    camera_power_total = mycol.find_one({'_id': ObjectId(data_objectid)},{ "_id": 0})
    try:
        sqldata_datetime = camera_power_total['datetime']
    except:
        sqldata_datetime = mlabdatetime
    if mlabdatetime > sqldata_datetime:
        camera_power_total_today = data['camera_today']
        try:
            camera_power_total_Yesterday = camera_power_total['camera_power_total_today']
            camera_power_consumption = camera_power_total_today - camera_power_total_Yesterday
        except:
            camera_power_total_Yesterday = 0
            camera_power_consumption = camera_power_total_today - camera_power_total_Yesterday

        data['camera_power_consumption'] = camera_power_consumption
        insert_operator_data_locale(data)
        myquery = { "_id": ObjectId(data_objectid)}
        newvalues = { "$set": { 
                        "camera_power_total_today": camera_power_total_today,
                        "camera_power_total_Yesterday":camera_power_total_Yesterday,
                        "camera_power_consumption":camera_power_consumption,
                        "datetime":mlabdatetime
                            }
                        }
        mycol.update_one(myquery, newvalues)
        print('------update data success------')
    else:
        print('---Today Data already exists---')

def insert_operator_data_locale(data):
    myclient_locale = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb_locale = myclient_locale["smart-data-center"]
    mycol_locale = mydb_locale["cameraPower"]

    datetime = data['datetime']
    camera_power_consumption = data['camera_power_consumption']
    mydict_locale = { "camera_power_consumption": camera_power_consumption, 'datetime':datetime}
    x = mycol_locale.insert_one(mydict_locale)
    print('------locale cameraPower insert data success------')

def insert_data_locale(data):
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient["smart-data-center"]
    mycol = mydb["camera"]
    datetime = data['datetime']
    camera_power_total = data['camera_today']
    mydict = { "camera_power_total": camera_power_total, 'datetime':datetime}
    x = mycol.insert_one(mydict)
    print('------locale camera insert data success------')

def on_connect(client, userdata, flags, rc):
    mqtt_topic = os.getenv(MQTT_TOPIC)
    client.subscribe(mqtt_topic)

def on_message(client, userdata, msg):
    data = json.loads(str(msg.payload.decode('ascii')))
    date_iso_conv = datetime.datetime.now().isoformat()
    date_iso = parser.parse(date_iso_conv)
    data['datetime'] = date_iso
    insert_data_locale(data)
    data['mlabdatetime'] = datetime.datetime.now().strftime("%Y-%m-%d")
    update_data_mlab(data)

mqtt_host = os.getenv(MQTT)
mqtt_port = os.getenv(MQTT_PORT)
MQTT_broker = mqtt_host
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(MQTT_broker, mqtt_port, 60)
client.loop_forever()