// App.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, FlatList, SafeAreaView } from "react-native";
import io from "socket.io-client";
import axios from "axios";

const BACKEND_BASE = "http://localhost:4000"; // se testar no celular, troque para IP da sua máquina (ex: http://192.168.0.5:4000)
const ATHLETE_ID = "athlete01";

export default function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // fetch latest once
    axios.get(`${BACKEND_BASE}/api/athletes/${ATHLETE_ID}/latest`)
      .then(res => setTelemetry(res.data))
      .catch(err => console.warn("Error fetching latest:", err.message));

    // fetch history
    axios.get(`${BACKEND_BASE}/api/athletes/${ATHLETE_ID}/history?limit=50`)
      .then(res => setHistory(res.data))
      .catch(err => console.warn("Error fetching history:", err.message));

    // socket.io
    const socket = io(BACKEND_BASE, { transports: ["websocket"] });
    socket.on("connect", () => {
      socket.emit("join", ATHLETE_ID);
    });
    socket.on("telemetry", data => {
      setTelemetry(data);
      setHistory(prev => [data, ...prev].slice(0, 200));
    });
    return () => {
      socket.emit("leave", ATHLETE_ID);
      socket.disconnect();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Athlete Monitor - {ATHLETE_ID}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Heartbeat</Text>
        <Text style={styles.value}>{telemetry?.heartbeat ?? "--"} bpm</Text>
        <Text style={styles.label}>Speed</Text>
        <Text style={styles.value}>{telemetry?.speed_kmh ?? "--"} km/h</Text>
        <Text style={styles.label}>Distance</Text>
        <Text style={styles.value}>{telemetry?.distance_m ?? "--"} m</Text>
        <Text style={styles.small}>{telemetry?.timestamp ? new Date(telemetry.timestamp * 1000).toLocaleTimeString() : ""}</Text>
      </View>

      <Text style={styles.subtitle}>Recent (history)</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item._id || `${item.timestamp}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{flex:1}}>{new Date(item.timestamp*1000).toLocaleTimeString()}</Text>
            <Text style={{width:80}}>{item.heartbeat} bpm</Text>
            <Text style={{width:80}}>{item.speed_kmh} km/h</Text>
            <Text style={{width:80}}>{Math.round(item.distance_m)} m</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:"#fff"},
  title: { fontSize:20, fontWeight:"bold", marginBottom:10 },
  subtitle: { marginTop:16, fontWeight:"600" },
  card: { padding:12, borderRadius:8, backgroundColor:"#f5f5f5", marginBottom:8 },
  label: { fontSize:12, color:"#444" },
  value: { fontSize:18, fontWeight:"600", marginBottom:6 },
  small: { fontSize:11, color:"#666" },
  row: { flexDirection:"row", paddingVertical:6, borderBottomWidth:0.5, borderBottomColor:"#eee" }
});
