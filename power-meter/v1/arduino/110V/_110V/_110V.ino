#include "DHT.h"
#include "EmonLib.h"  
#define DHTPIN A0 
#define DHTTYPE DHT11 

// Include Emon Library
EnergyMonitor emon1;                   // Create an instance

void setup()
{  
    Serial.begin(9600);
    Serial.println("DHT11 test!");
    
    emon1.current(1, 26);   
    dht.begin();// Current: input pin, calibration.
}

void loop()
{

   float h = dht.readHumidity();
   float t = dht.readTemperature(); //read Humidity and Temperature 
   double Irms = emon1.calcIrms(1480);  // Calculate Irms only
  if (isnan(t) || isnan(h)) 
    {
        Serial.println("Failed to read from DHT");
    } 
    else 
    {
        Serial.print("Humidity: "); 
        Serial.print(h);
        Serial.print(" %\t");
        Serial.print("Temperature: "); 
        Serial.print(t);
        Serial.println(" *C");
    }
  Serial.println(Irms);		       // Irms
  delay(1000);
}
