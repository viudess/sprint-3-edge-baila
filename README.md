# 🏃‍♂️ IoT - Monitoramento de Atletas  

Este projeto é uma solução IoT para monitoramento de **batimento cardíaco**, **velocidade** e **distância percorrida** por atletas em tempo real.  
Os dados coletados pelos sensores são enviados via **MQTT**, processados em uma arquitetura baseada em **FIWARE** (ou backend Node.js simples para testes), armazenados em **MongoDB** e disponibilizados para um **aplicativo móvel** e uma camada de **IA**.  

---

## 🚀 Objetivo  
Fornecer uma solução que permita:  
- Monitorar dados vitais e de performance de atletas em tempo real.  
- Armazenar e analisar o histórico de informações.  
- Exibir os dados em um **aplicativo mobile** de forma acessível.  
- Utilizar **Inteligência Artificial** para gerar insights sobre o desempenho do atleta.  

---

## 🏗️ Arquitetura do Sistema  

![Arquitetura IoT](./images/diagrama.png) 

### 📌 Componentes Principais  

1. **Dispositivos IoT**  
   - Sensor de batimentos cardíacos  
   - Sensor de movimento (velocidade e distância)  
   - Simulador em Python para testes locais  

2. **Back-End**  
   - **MQTT Broker (1883):** recebe os dados dos sensores (ex.: Mosquitto).  
   - **Servidor Node.js:**  
     - Consome mensagens MQTT  
     - Salva no **MongoDB**  
     - Expõe APIs REST  
     - Envia atualizações em tempo real via WebSocket (Socket.io)  

3. **Aplicações**  
   - **Mobile App (React Native/Expo):** exibe métricas em tempo real.  
   - **AI (futuro):** análises avançadas de performance (ex.: previsões, alertas).  

---

## 🔗 Fluxo de Dados  

1. Os sensores coletam dados (batimento, velocidade, distância).  
2. Os dados são enviados via **MQTT** para o **Broker**.  
3. O **Backend Node.js** recebe os dados, armazena no **MongoDB** e notifica os apps.  
4. O **Aplicativo Mobile** consome as APIs e recebe dados em tempo real.  
5. A **IA** pode analisar o histórico para gerar insights.  

---

## ⚙️ Tecnologias Utilizadas  

- **IoT (Simulação):** Python + Paho MQTT  
- **Comunicação:** MQTT (Mosquitto)  
- **Backend:** Node.js (Express, Mongoose, MQTT.js, Socket.io)  
- **Banco de Dados:** MongoDB  
- **Aplicação Mobile:** React Native com Expo  
- **AI (futuro):** modelos em Python/Node.js  

---

## ▶️ Como Executar  

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (>= 18.x)  
- [MongoDB](https://www.mongodb.com/try/download/community) (ou usar Docker)  
- [Mosquitto MQTT Broker](https://mosquitto.org/download/) (ou usar Docker)  
- [Python 3](https://www.python.org/downloads/)  
- [Expo CLI](https://docs.expo.dev/get-started/installation/) para rodar o app mobile  

---

### 2. Rodar o Backend  

```bash
cd backend
cp .env.example .env   # configure variáveis (MongoDB, MQTT, porta)
npm install
npm run start
```

- O backend sobe em: http://localhost:4000
- Endpoints disponíveis:
- GET /api/athletes/:id/latest → Última leitura
- GET /api/athletes/:id/history?limit=N → Histórico
- WebSocket: conectado no mesmo endereço (para updates em tempo real).

--- 

### 3. Rodar o Simulador de Dispositivo (Python)

```bash
cd device-simulator
pip install paho-mqtt
python simulator.py --athlete-id athlete01 --host localhost --port 1883 --interval 1
```

- Publica dados a cada segundo no tópico:

```bash
athlete/{athlete-id}/telemetry
```

Exemplo de payload publicado:

```json
{
  "athlete_id": "athlete01",
  "timestamp": 1694879421,
  "heartbeat": 142,
  "speed_kmh": 10.5,
  "distance_m": 350.2
}
```

---

### 4. Rodar o Mobile App (Expo)

```bash
cd mobile-app
npm install
npm start
```

-Ajuste o BACKEND_BASE em App.js para o IP da sua máquina (se rodar no celular físico).
-Abra no Expo Go (Android/iOS) ou emulador.

O app exibe:
- Batimentos cardíacos em tempo real
- Velocidade atual
- Distância acumulada
- Histórico de medições

---

## 📌 Futuras Melhorias  

- Integração com **FIWARE Orion + IoT Agent** para padronização NGSI-v2.
- Dashboard Web para técnicos acompanharem múltiplos atletas.
- Modelos de IA para previsão de fadiga e risco de lesão.
- Suporte a dispositivos reais (ex.: pulseiras inteligentes via BLE).
