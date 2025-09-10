#include "libreriaProgetto.h"

#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <MQTT.h>
#include <time.h>
#include "errors.h"
#include "configuration.h" // Configuration data
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define emptyString String() // NodeMCU sensor pin definition
// Definizione dei pin per il sensore MQ-2
// L'uscita analogica è collegata ad A0 e quella digitale, regolata tramite potenziometro, a D0.
#define TRIG_PIN D5
#define ECHO_PIN D6
#define BUFFER_MEMORIA 8192

#define MAX_DISTANCE 100

const int MQTT_PORT = 8883; // Define MQTT port

// Define subscription and publication topics (on thing shadow)
const char MQTT_SUB_TOPIC[] = "$aws/things/" THINGNAME "/shadow/update";
const char MQTT_PUB_TOPIC[] = "$aws/things/" THINGNAME "/shadow/update";

#ifdef USE_SUMMER_TIME_DST // Enable or disable summer-time
uint8_t DST = 1;
#else
uint8_t DST = 0;
#endif

// Create Transport Layer Security (TLS) connection
WiFiClientSecure net;

// Load certificates
BearSSL::X509List cert(cacert);
BearSSL::X509List client_crt(client_cert);
BearSSL::PrivateKey key(privkey);

// Initialize MQTT client
MQTTClient client;  
unsigned long lastMs = 0;
time_t now;
time_t nowish = 1510592825;

// Tiene il timestamp dell'ultima lettura effettuata
String timestampRead;

LiquidCrystal_I2C lcd(0x3F, 16, 2); // Imposta l'indirizzo LCD su 0x3F per un display 16x2
int recentBurglaryCount = 0;
int pendingBurglaryCount = 0;

// Verifica che la lettura e scruittura si possa fare
bool burglaryEnable = true;

// To calcolate
unsigned long previousMillis = 0;
const long interval = 5000;
unsigned long lastStatusCheck = 0;
unsigned long lastDataSend = 0;
unsigned long lastAlarmCheck = 0;

void sendAlarmToAWS();
void sendData(void);
void sendBurglaryDataToAWS(int distance);
void getAlarmDataToAWS();
void connectToWiFi(String init_str);
void NTPConnect(void);
String generateUniqueID();
void showDisplayAlarm();
void messageReceived(String &topic, String &payload);
void connectToMqtt(bool nonBlocking);
void verifyWiFiAndMQTT(void);
bool getSystemStatusFromAWS();

// Get time through Simple Network Time Protocol to sinchronize with AWS
void NTPConnect(void)
{
  Serial.print("Setting time using SNTP");
  configTime(TIME_ZONE * 3600, DST * 3600, "pool.ntp.org", "time.nist.gov");
  now = time(nullptr);

  while (now < nowish)
  {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }

  Serial.println("done!");
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);

  Serial.print("Current time: ");
  Serial.print(asctime(&timeinfo));
}

// MQTT management of incoming messages
void messageReceived(String &topic, String &payload)
{
  Serial.println("Received [" + topic + "]: " + payload);
}

// MQTT Broker connection
void connectToMqtt()
{
  bool nonBlocking = false;

  Serial.print("MQTT connecting ");
  while (!client.connected())
  {
    if (client.connect(THINGNAME))
    {
      Serial.println("connected!");

      if (!client.subscribe(MQTT_SUB_TOPIC))
        lwMQTTErr(client.lastError());
    }

    else
    { 
      Serial.print("SSL Error Code: ");
      Serial.println(net.getLastSSLError());
      Serial.print("failed, reason -> ");

      lwMQTTErrConnection(client.returnCode());

      if (!nonBlocking)
      {
        Serial.println(" < try again in 5 seconds");
        delay(5000);
      }

      else
        Serial.println(" <");
    }

    if (nonBlocking) break;
  }
}

// Wi-Fi connection
void connectToWiFi(String init_str)
{
  if (init_str != emptyString)
    Serial.print(init_str);

  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(1000);
  }

  if (init_str != emptyString)
    Serial.println("ok!");
}

void verifyWiFiAndMQTT(void)
{
  connectToWiFi("Checking WiFi");
  connectToMqtt();
}

// check if the smoke sensor value is over the trashold
bool checkTrashold(int value)
{
  if(value >= MAX_DISTANCE)
  {
    sendAlarmToAWS();
    return true;
  }
    
  return 
    false;  
}

// MQTT and HTTP management of outgoing messages
void sendData(void)
{
  DynamicJsonDocument jsonBuffer(JSON_OBJECT_SIZE(3) + 100);
  JsonObject root = jsonBuffer.to<JsonObject>();
  JsonObject state = root.createNestedObject("state");
  JsonObject state_reported = state.createNestedObject("reported");

  // --- Attivazione del sensore HC-SR04 ---
  // 1. Assicurarsi che TRIG sia LOW
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  
  // 2. Invia un impulso di 10 µs sul pin TRIG
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // 3. Misura il tempo in cui l'eco (ECHO) rimane HIGH
  long duration = pulseIn(ECHO_PIN, HIGH);
  
  // 4. Calcola la distanza (la velocità del suono è ~0.034 cm/µs)
  float distanceF = (duration * 0.034) / 2;
  
  // 5. Prepara la stringa e pubblica su MQTT
  char distanceStr[8];
  dtostrf(distanceF, 1, 2, distanceStr);

  // Aggiorno il timestamp dell'ultima lettura
  timestampRead = generateTimestamp();

  // Stampa per debug
  Serial.print("Distance: ");
  Serial.print(distanceStr);
  Serial.println(" cm");

  int distance = (int) distanceF;

  bool alarm = checkTrashold(distance);

  // CHIAMATA MQTT (SHADOW THING)
  state_reported["unit"] = "cm";
  state_reported["value"] = distance;
  state_reported["type"] = "burglary";
  Serial.println();

  size_t jsonSize = measureJson(root) + 1;

  Serial.printf("Sending  [%s]: ", MQTT_PUB_TOPIC);
  serializeJson(root, Serial);

  // Safety cap: non superare 1024 byte
  if (jsonSize <= 1024)
  {
    char shadow[jsonSize];
    serializeJson(root, shadow, sizeof(shadow));
    Serial.println();
    Serial.print("MQTT Payload: ");
    Serial.println(shadow);
    if (!client.publish(MQTT_PUB_TOPIC, shadow, false, 0))
        lwMQTTErr(client.lastError());
    else
      Serial.print("MESSAGGIO PUBBLICATO");
  } 
  else
  {
      Serial.print("⚠️ MQTT payload troppo grande! Dimensione: ");
      Serial.println(jsonSize);
  }

  // CHIAMATA HTTP
  sendBurglaryDataToAWS(distance);
}

String generateUniqueID() 
{
  return "BurglarySensor_1" + String(micros());
}

String generateTimestamp()
{
  time_t now = time(nullptr);
  struct tm *timeinfo = localtime(&now);
  char buffer[25];
  snprintf(buffer, sizeof(buffer), "%04d-%02d-%02dT%02d:%02d:%02d",
           timeinfo->tm_year + 1900, timeinfo->tm_mon + 1, timeinfo->tm_mday,
           timeinfo->tm_hour, timeinfo->tm_min, timeinfo->tm_sec);

  struct timeval tv;
  gettimeofday(&tv, NULL);
  unsigned long milliseconds = (tv.tv_sec * 1000) + (tv.tv_usec / 1000);

  String timestamp1 = String(buffer);
  timestamp1 += ".";
  timestamp1 += String(milliseconds % 1000);  // solo i millisecondi

  return timestamp1;
}

void sendAlarmToAWS()
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;
    http.begin(net, "https://5hbksi3sja.execute-api.eu-north-1.amazonaws.com/prod/alarms");
    http.addHeader("Content-Type", "application/json");

    String uniqueID = generateUniqueID();
    String timestampNow = generateTimestamp();
    
    String jsonPayload = "{\"ID\":\"" + uniqueID +
                         "\",\"timestamp\":\"" + timestampNow +
                         "\",\"deviceId\":\"BurglarySensor_1\","
                         "\"status\":\"pending\","
                         "\"timestampRead\":\"" + timestampRead + "\","
                         "\"type\":\"burglary\"}";

    int httpResponseCode = http.POST(jsonPayload);
    Serial.print("HTTP Response code Alarm POST: ");
    Serial.println(httpResponseCode);
    Serial.println(http.getString());
    http.end();    
    net.stop(); // Chiude davvero la connessione
  }
}

void sendBurglaryDataToAWS(int distance)
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;

    // ⬇️ Usa lo stesso client già configurato con certificati!
    http.begin(net, "https://5hbksi3sja.execute-api.eu-north-1.amazonaws.com/prod/sensor-data");
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{\"timestamp\":\"" + timestampRead +
                         "\",\"deviceId\":\"BurglarySensor_1\","
                         "\"type\":\"burglary\","
                         "\"value\":\"" + String(distance) + "\","
                         "\"unit\":\"cm\"}";

    //Serial.print("JSON inviato: ");
    //Serial.println(jsonPayload);
    int httpResponseCode = http.POST(jsonPayload);

    Serial.print("HTTP Response code POST Burglary: ");
    Serial.println(httpResponseCode);

    Serial.print("Response body Burglary: ");
    Serial.println(http.getString());

    http.end();    
    net.stop(); // Chiude davvero la connessione
  } 
  else
    Serial.println("WiFi not connected, unable to send data.");
}

void getAlarmDataToAWS()
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;

    // ⬇️ Usa lo stesso client già configurato con certificati!
    http.begin(net, "https://5hbksi3sja.execute-api.eu-north-1.amazonaws.com/prod/alarms");

    int httpResponseCode = http.GET();

    Serial.print("HTTP Response code Alarm: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode > 0)
    {
      String response = http.getString();
      Serial.print("Response body: ");
      Serial.println(response);

      if (response.length() > 16000)
      {
        Serial.println("Warning: JSON response too large, skipping parse");
        return;
      }

      else
      {
        DynamicJsonDocument doc(BUFFER_MEMORIA);
        DeserializationError error = deserializeJson(doc, response);

        if (!error)
        {
          recentBurglaryCount = 0;
          pendingBurglaryCount = 0;
          JsonArray alarms = doc["alarms"].as<JsonArray>();
          for (JsonObject alarm : alarms)
          {
              const char* status = alarm["status"];
              const char* type = alarm["type"];
              Serial.print("Status: ");
              Serial.print(status);
              Serial.print(" --- Type: ");
              Serial.println(type);
              if (strcmp(status, "pending") == 0 && strcmp(type, "burglary") == 0)
                pendingBurglaryCount++;
              if (strcmp(type, "burglary") == 0)
                recentBurglaryCount++;
          }
          doc.clear();

          Serial.print("pendingBurglaryCount: ");
          Serial.println(pendingBurglaryCount);
          Serial.print("recentBurglaryCount: ");
          Serial.println(recentBurglaryCount);
        }
        else
        {
          Serial.print("deserializeJson() failed: ");
          Serial.println(error.c_str());
        }
      }
    }
    else
      Serial.println("Error on HTTP request");

    http.end();
    net.stop(); // Chiude davvero la connessione
  }
  else
    Serial.println("WiFi not connected, unable to send data.");
}

bool getSystemStatusFromAWS()
{
  if (WiFi.status() == WL_CONNECTED)
  {
    HTTPClient http;

    http.begin(net, "https://5hbksi3sja.execute-api.eu-north-1.amazonaws.com/prod/system-status");

    int httpResponseCode = http.GET();

    Serial.print("HTTP Response code SystemStatus: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode > 0)
    {
      String response = http.getString();
      Serial.print("Response body: ");
      Serial.println(response);

      if (response.length() > 16000)
      {
        Serial.println("Warning: JSON response too large, skipping parse");
      }
      else
      {
        DynamicJsonDocument doc(BUFFER_MEMORIA);
        DeserializationError error = deserializeJson(doc, response);

        if (!error)
        {
          JsonArray system_status = doc["system_status"].as<JsonArray>();
          for (JsonObject item : system_status)
          {
            const char* type = item["type"];
            bool alarm = item["alarm"];

            Serial.print("Type: ");
            Serial.print(type);
            Serial.print(" --- Alarm: ");
            Serial.println(alarm ? "true" : "false");

            if (strcmp(type, "burglary") == 0)
            {
              Serial.print("TRUE: ");
              return alarm;
            }  
            else 
              return false;
          }

          doc.clear();
        }
        else
        {
          Serial.print("deserializeJson() failed: ");
          Serial.println(error.c_str());
        }
      }
    }
    else
      Serial.println("Error on HTTP request");

    http.end();
    net.stop();
  }
  else
    Serial.println("WiFi not connected, unable to send data.");

  return false;  
}

void showDisplayAlarm()
{
  lcd.setCursor(0, 0);               
  lcd.print("Last2h: ");
  lcd.print(recentBurglaryCount);    

  lcd.setCursor(0, 1);              
  lcd.print("Pending: ");
  lcd.print(pendingBurglaryCount);
}

void setup()
{
  Serial.begin(115200);
  delay(5000);
  Serial.println();
  Serial.println();
  WiFi.hostname(THINGNAME);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);
  connectToWiFi(String("Trying to connect with SSID: ") + String(ssid));
  NTPConnect();  
  net.setTrustAnchors(&cert);
  net.setClientRSACert(&client_crt, &key);
  client.begin(MQTT_HOST, MQTT_PORT, net);
  client.onMessage(messageReceived);
  // Configurazione dei pin del sensore
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  // Configurazione display LCD
  lcd.init();                       // Inizializza il display LCD
  lcd.begin(16, 2);                 // Configura esplicitamente il display come 16x2
  lcd.backlight();                  // Accende la retroilluminazione
  lcd.clear();                      // Pulisce lo schermo
}

void loop() {
  now = time(nullptr);

  if (!client.connected())
    verifyWiFiAndMQTT();

  client.loop();

  unsigned long currentMillis = millis();

  // Ogni 30 secondi → controllo stato sensore
  if (currentMillis - lastStatusCheck > 30000)
  {
    burglaryEnable = getSystemStatusFromAWS();
    lastStatusCheck = currentMillis;
  }

  // Ogni 5 secondi → invio dati sensore (se abilitato)
  if (burglaryEnable && currentMillis - lastDataSend > 5000)
  {
    sendData();
    lastDataSend = currentMillis;
  }

  // Ogni 10 secondi → lettura stato allarmi
  if (currentMillis - lastAlarmCheck > 10000)
  {
    getAlarmDataToAWS();
    showDisplayAlarm();
    lastAlarmCheck = currentMillis;
  }
}
