## ValidateVirtualAddress

https://developerapi.icicibank.com:8443/api/v0/upi1/validateaddress

Curl:
```
curl -H "Content-Type: application/json" -H "apikey: l7xx062b5f407bb14a719d0986f85f7ee381" -d '{"MobileNumber": "90404XXXXX", "deviceId": "84521654864135", "sequenceNumber": "ef1e92b4a01d4618a0eca5fdecc37ff23f3", "channelCode": "IMobile", "profileId": "561", "VirtualAddress": "abc@icici", "payeeName": "ABC" }' https://developerapi.icicibank.com:8443/api/v0/upi1/validateaddress
```

Payload:
```json
{
  "MobileNumber": "90404XXXXX",
  "deviceId": "84521654864135",
  "sequenceNumber": "ef1e92b4a01d4618a0eca5fdecc37ff23f3",
  "channelCode": "IMobile",
  "profileId": "561",
  "VirtualAddress": "abc@icici",
  "payeeName": "ABC"
}
```
