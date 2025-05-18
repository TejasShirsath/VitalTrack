# VitalTrack - Real-time Health Care Monitoring System


https://github.com/user-attachments/assets/9f426045-daf7-42b7-89bd-e297180c076c


VitalTrack is a Health monitoring dashboard built using **Arduino Uno**, **HW-827 pulse sensor**, **Node.js**, **Socket.io**, and **React.js** to visualize live pulse data and BPM on an interactive UI.


---

## 🚀 Features

- 📈 **Live Pulse Graph**  
- 💓 **Real-time BPM Calculation**  
- 📊 **BPM History Visualization**  
- ✅ **Heart Status & Health Index**  

---

## 🛠️ Hardware Used

- **Arduino Uno**  
- **HW-827 Pulse Sensor**

---

## ⚙️ How It Works

1. **Pulse Sensor** captures analog heartbeat signals.  
2. **Arduino Uno** reads the raw pulse data and sends it via **Serial Port**.  
3. A **Node.js backend** reads this serial data and:  
   - Applies a threshold of `850` to detect heartbeats — when the pulse value rises **above this threshold**, it's considered a **beat**.  
   - Processes the number of detected beats over time to calculate **BPM**.  
   - Emits both raw pulse data (for graph plotting) and BPM (for vitals display) to the frontend using **Socket.io**.  

4. The **Frontend**:  
   - Plots the raw data using **Chart.js** for real-time waveform visualization.  
   - Displays BPM stats, history, and heart health status.

---

## 🧩 Tech Stack

| Part           | Technology            |
|----------------|------------------------|
| Microcontroller | Arduino Uno           |
| Sensor         | HW-827 Pulse Sensor    |
| Backend        | Node.js, Socket.io     |
| Frontend       | React.js               |
---

## 🔧 Setup Instructions

1. **Upload Arduino Code:**
   - Upload the `pulse_monitor.ino` file to your Arduino Uno using the Arduino IDE.

2. **Install All Packages:** 
   ```bash
   npm i; cd backend; npm i
   ```

3. **Run the Backend and Frontend together:**
   ```bash
   npm run both
   ```

> Make sure Arduino is connected and the COM port is correctly specified in `backend\index.js`.

---

## 📌 Note

This project is designed for educational and health visualization purposes only and **should not be used for medical diagnosis.** 

---
