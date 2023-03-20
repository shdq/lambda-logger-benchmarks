# AWS Lambda function with differents AWS Powertools Logger builds (Current/CommonJS/ES modules) to test performance

In the `funtions` directory source code of three functions. Current version of Logger uses package from `npm`. `CJS` and `ESM` functions use vendored package of Logger build with support both `CommonJS` and `ES` modules.

There is AWS SAM template to build and deploy these functions to AWS.

During build functions bundle dependencies in one file. It is not minified, so check out the source code. Pay attention to paths:

- `CurrentLogger` requires from `node_modules/@aws-lambda-powertools/logger/lib/**/*.js`
- `CJSLogger` imports from `node_modules/aws-lambda-powertools-logger-next/lib/cjs/**/*.js`
- `ESMLogger` imports from `node_modules/aws-lambda-powertools-logger-next/lib/esm/**/*.js`

`esbuild` parameters in the `template.yml`

## How to benchmark

### Prerequisites

[Setup AWS SAM with this guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html#prerequisites-install-cli)

### Validate AWS SAM Template

```bash
sam validate --lint
```

### Adjust AWS SAM Template

You can adjust template, e.g. target platform: `nodejs14.x`, `nodejs16.x`, or `nodejs18.x`.

```yml
Properties:
  Runtime: nodejs16.x
```

### Build functions from AWS SAM Template

```bash
sam build
```

### Invoke functions locally

There three functions: `CurrentLogger`, `CJSLogger`, `ESMLogger`

```bash
sam local invoke <name-of-the-function>

# for example:

sam local invoke CurrentLogger
```

### Deploy functions to AWS

```bash
sam deploy --guided
```

Copy prompted `API Gateway URL to paste in artillery config:` value. It looks like this:

`https://42blablabla.execute-api.awesome-region-1.amazonaws.com/Prod/`

and paste it in `./artillery/config.yaml` to the `target` section.

## Testing with Artillery

### Run tests
Inside `functions` directory run commands for each function:

```bash
# For current logger package:
npm run test:current

# For logger-next CJS package:
npm run test:cjs

# For logger-next ESM package:
npm run test:esm
```

### Adjust tests load

To change load adjust settings in the config: `./artillery/config.yaml`

Docs: https://www.artillery.io/docs/guides/getting-started/writing-your-first-test#load-phases

# Results

## Node 18

This is results with current tests setup: 10 requests per second for 60 seconds.

Same query was used to get results of the measurements: https://aws.amazon.com/blogs/compute/optimizing-node-js-dependencies-in-aws-lambda/

**Export from CloudWatch Logs Insights:**

<details>
  <summary>Current logger</summary>

---
| function | coldstart | invocations | p0 | p25 | p50 | p75 | p90 | p95 | p99 | p100 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| logger | 0 | 597 | 1.35 | 1.5385 | 1.65 | 1.8883 | 6.7197 | 20.4195 | 88.7441 | 119.48 |
| logger | 1 | 3 | 288.08 | 288.08 | 291.29 | 351.89 | 351.89 | 351.89 | 351.89 | 351.89 |
---

</details>


<details>
  <summary>CJS</summary>


---
| function | coldstart | invocations | p0 | p25 | p50 | p75 | p90 | p95 | p99 | p100 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| logger | 0 | 597 | 1.28 | 1.5095 | 1.5885 | 1.759 | 6.6996 | 17.8957 | 74.2803 | 117.77 |
| logger | 1 | 3 | 279.22 | 279.22 | 284.02 | 303.9 | 303.9 | 303.9 | 303.9 | 303.9 |
---

</details>

<details>
  <summary>ESM</summary>

  ---
| function | coldstart | invocations | p0 | p25 | p50 | p75 | p90 | p95 | p99 | p100 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| logger | 0 | 597 | 1.23 | 1.4188 | 1.5385 | 1.6883 | 5.2866 | 19.1734 | 90.8079 | 176.06 |
| logger | 1 | 3 | 251.43 | 251.43 | 267.84 | 291 | 291 | 291 | 291 | 291 |
---

</details>

## Node 16

With with increasing and sustained load:

```
phases:
  - duration: 60
    arrivalRate: 5
    name: Warm up
  - duration: 120
    arrivalRate: 5
    rampTo: 50
    name: Ramp up load
  - duration: 300
    arrivalRate: 50
    name: Sustained load
```

<img width="100%" alt="Logger ES module benchmarks" src="https://user-images.githubusercontent.com/1219618/226328459-f58a27f7-b3be-4d9d-9ae7-ee2d9a8bdefd.png">


**Export from CloudWatch Logs Insights:**

<details>
  <summary>Current Logger</summary>

---
| function | coldstart | invocations | p0 | p25 | p50 | p75 | p90 | p95 | p99 | p100 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2023 | 0 | 18593 | 0.99 | 1.352 | 1.4637 | 1.6885 | 6.1078 | 10.1504 | 25.0855 | 178.09 |
| 2023 | 1 | 7 | 211.4 | 213.88 | 219.6 | 232.93 | 380.44 | 380.44 | 380.44 | 380.44 |
---

</details>


<details>
  <summary>Logger CJS built</summary>

---
| function | coldstart | invocations | p0 | p25 | p50 | p75 | p90 | p95 | p99 | p100 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2023 | 0 | 18592 | 1.06 | 1.3956 | 1.4637 | 1.6619 | 3.8545 | 9.0829 | 28.9378 | 182.11 |
| 2023 | 1 | 8 | 212.15 | 235.62 | 242.67 | 365.99 | 380.45 | 380.45 | 380.45 | 380.45 |
---

</details>

<details>
  <summary>Logger ESM built</summary>

---
| function | coldstart | invocations | p0 | p25 | p50 | p75 | p90 | p95 | p99 | p100 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2023 | 0 | 18592 | 0.98 | 1.3307 | 1.418 | 1.5596 | 3.6752 | 8.3899 | 24.3016 | 153.28 |
| 2023 | 1 | 8 | 215.67 | 222.84 | 232.06 | 345.54 | 358.62 | 358.62 | 358.62 | 358.62 |
---

</details>