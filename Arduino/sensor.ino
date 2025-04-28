const int pulsePin = A0; 

void setup() {
  Serial.begin(9600);  
}

void loop() {
  int pulseValue = ((analogRead(pulsePin))-500)*50; 
  if(pulseValue > 1023){
    pulseValue = 1022;
  }else if(pulseValue <= 0){
    pulseValue = 0;
  }
  Serial.println(pulseValue);           
  delay(10);                            
}