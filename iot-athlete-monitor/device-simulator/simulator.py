# simulator.py
import time
import json
import random
import argparse
import paho.mqtt.client as mqtt

parser = argparse.ArgumentParser()
parser.add_argument("--host", default="localhost", help="MQTT broker host")
parser.add_argument("--port", type=int, default=1883, help="MQTT broker port")
parser.add_argument("--athlete-id", default="athlete01", help="Athlete ID / device id")
parser.add_argument("--interval", type=float, default=1.0, help="Publish interval in seconds")
args = parser.parse_args()

MQTT_HOST = args.host
MQTT_PORT = args.port
ATHLETE_ID = args.athlete_id
INTERVAL = args.interval
TOPIC = f"athlete/{ATHLETE_ID}/telemetry"

client = mqtt.Client()
client.connect(MQTT_HOST, MQTT_PORT, 60)
client.loop_start()

# initial state
distance = 0.0  # meters
speed_kmh = 10.0  # start speed in km/h

try:
    while True:
        # simulate small variations
        heartbeat = int(random.gauss(140, 8))  # e.g. avg 140bpm for athlete
        speed_kmh += random.uniform(-0.5, 0.5)
        speed_kmh = max(0.0, min(40.0, speed_kmh))
        # convert km/h to m/s
        speed_ms = speed_kmh / 3.6
        distance += speed_ms * INTERVAL  # meters

        payload = {
            "athlete_id": ATHLETE_ID,
            "timestamp": int(time.time()),
            "heartbeat": heartbeat,
            "speed_kmh": round(speed_kmh, 2),
            "distance_m": round(distance, 2)
        }
        client.publish(TOPIC, json.dumps(payload), qos=0)
        print(f"Published to {TOPIC}: {payload}")
        time.sleep(INTERVAL)
except KeyboardInterrupt:
    print("Simulator stopped")
finally:
    client.loop_stop()
    client.disconnect()
