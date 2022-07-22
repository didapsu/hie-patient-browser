1. npm run build 
2. Modify build/config/default.json5 with https://172.29.70.71:9443/fhir-server/api/v4 
3. (optional) npm run start 
4. cd security 
5. ./build_war.sh 
6. docker build . -t psu-fhir-server 
7. docker run -p 9443:9443 -e BOOTSTRAP_DB=true local-fhir-server 