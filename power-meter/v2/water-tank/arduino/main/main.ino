#include "EmonLib.h" 

EnergyMonitor emon1;
EnergyMonitor emon2;
EnergyMonitor emon3;

void setup() 
{
    Serial.begin(9600);
    emon1.current(0, 42);  //Current: input pin, calibration.
    emon2.current(1, 43);  //Current: input pin, calibration.
    emon3.current(2, 44);  //Current: input pin, calibration.
}

void loop() 
{   

    double Irms1 = emon1.calcIrms(1480);  // Calculate Irms1 only
    double Irms2 = emon2.calcIrms(1480);  // Calculate Irms2 only
    double Irms3 = emon3.calcIrms(1480);  // Calculate Irms3 only
    double Irms_W = (Irms1 + Irms2 + Irms3) / 3;

    if(Irms_W>=0){
      Serial.print("{\"current\":");
      Serial.print(Irms_W);
      Serial.println("}");// Irms
    }
    delay(1000);
}
