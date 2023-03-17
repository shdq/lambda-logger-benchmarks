import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
const logger = new Logger();

export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  
  // Log the incoming event
  logger.info("Lambda invocation event", { event });

  // Append awsRequestId to each log statement
  logger.appendKeys({
    awsRequestId: context.awsRequestId,
  });

  let response: APIGatewayProxyResult;

  try {
    // Success
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "hello from current version of logger",
      }),
    };
    logger.info(
      `Successful response from API enpoint: ${event.path}`,
      response.body
    );
  } catch (err) {
    // Error
    response = {
      statusCode: 500,
      body: JSON.stringify({
        message: "Some error happened",
      }),
    };
    logger.error(
      `Error response from API enpoint: ${event.path}`,
      response.body
    );
  }

  return response;
};
