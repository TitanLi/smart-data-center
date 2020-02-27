#include "DHT.h"
#include "EmonLib.h" 
DHT dht;
EnergyMonitor emon1; 
void setup() 
{
    Serial.begin(9600); 
    dht.setup(10);
    emon1.current(2, 20);  //Current: input pin, calibration.
}

void loop() 
{   

    float humidity = dht.getHumidity();
    float temperature = dht.getTemperature();
    double Irms = emon1.calcIrms(1480);  // Calculate Irms only
    if(humidity>=0){
      Serial.print("{\"Humidity\":"); 
      Serial.print(humidity, 1);
      Serial.print(",\"Temperature\":"); 
      Serial.print(temperature, 1);
      Serial.print(",\"currents\":");
      Serial.print(Irms);
      Serial.println("}");// Irms
    }
    delay(1000);
}
