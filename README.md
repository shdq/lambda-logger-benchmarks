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

This is results with current tests setup: 10 requests per second for 60 seconds.

Same query was used to get results of the measurements: https://aws.amazon.com/blogs/compute/optimizing-node-js-dependencies-in-aws-lambda/

**CloudWatch Logs Insights**

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
