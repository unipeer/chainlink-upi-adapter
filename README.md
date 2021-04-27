# UPI 2.0 External Adapter

This is a Chainlink External Adapter for connecting to a UPI
(Unified Payments Interface) API provided
by a partner bank or a PSP (Payment Service Provider).

This adapter has the necessary interfaces to add and support more than one bank API
providers.

Currently there is existing support for these API providers:
* [RBL Bank][1]
* [Cashfree][2]

## How to use

* Install dependencies `npm install`

* Build TypeScript files `npm run build`

* Set up [Environment variables](#environment-variables)

* *Optional:* Run tests `npm test`. Please read [Testing](#testing) first!

* Run this adapter using a serverless provider:
    * use the `handler()` wrapper for AWS Lambda
    * use the `gcpservice()` wrapper for GCP

* Use one of the available [Available methods](#available-methods)
    * Set method name in `data.method`, along with method-specific parameters

To create a ZIP file to upload to AWS/GCP, run:

```bash
zip -r cl-ea.zip .
```

## Run with Docker

```bash
docker build . -t upi-adapter
docker run -d \
    -p 8080:8080 \
    -e EA_PORT=8080 \
    --env-file .env
    upi-adapter
```

## Environment variables

For a complete list of environment variable required see `src/config.ts`.

You need to set atleast the chainlink NODE_* environment variables and any other
bank API related parameters as env variables.

## Testing

Before you start testing, make sure you have necessary PayPal developer credentials set up.
Set the `MODE` env variable to `sandbox`.

To test the getPayout method with another payout other than the one created in the test, set the `TEST_PAYOUT_ID` env var.

## Available banks

The `src/httpClients/index.ts` file has the up to date list of supported banks.
The bank can be specified by the `bank` key in the request body.

Currently accepted values for the `bank` field are:
* `mock`
* `rbl`
* `cashfree`

## Available methods

Method can be specified by the `method` key in the request body or the `API_METHOD` environment variable. If the
environment variable is set, it takes precedence over the method specified in the request body.

### collectRequest

Send a payout with the collectRequest API.

#### Request

| Variable | Type |   | Description |
|----------|------|---|-------------|
| `amount` | Integer, decimal | **Required** | Amount to request from the payer VPA. |
| `sender` | String | **Required** | The VPA/UPI ID of the payer |
| `receiver` | String | **Required** | The VPA/UPI ID of the payee |
| `note` | String | *Optional* | Custom note for this collect request |

Please refer to the Bank API documentation for more information on each parameter.

### getStatus

Get details of a transaction.

#### Request

| Variable | Type |   | Description |
|----------|------|---|-------------|
| `txId` | String | **Required** | The transaction ID of the payment to look up |

Please refer to the Bank API documentation for more information on each parameter.

## TODO

- [ ] Add bug reporting
- [ ] Add logging collector/debugging
- [ ] Add metrics monitoring
- [ ] Have a scheduling mechanism for refreshing bank session token.

## Disclaimer

In order to use this adapter, you will need to create an account with and obtain credentials from a payments bank acting as a PSP for the UPI payments network and agree to and comply with their applicable terms, conditions and policies.

[1]: https://developer.rblbank.com/content/upi-collection-api-product
[2]: https://dev.cashfree.com/payment-gateway/payments/upi
