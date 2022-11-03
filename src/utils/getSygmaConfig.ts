import { SSM } from "@aws-sdk/client-ssm";
import { secrets } from "docker-secret";

const SSM_PARAMETER_NAME = secrets.SSM_PARAMETER_NAME || process.env.SSM_PARAMETER_NAME

const ssm = new SSM({
  region: "us-east-2",
});

const getLocalConfig = () => require("../../public/sygma-explorer-runtime-config.json")

const getConfigFromSSM = async () => {
  try {
    const data = await ssm.getParameter({
      Name: SSM_PARAMETER_NAME,
      WithDecryption: true,
    });
    const rawResponse = data.Parameter?.Value;
    if (rawResponse) {
      const parsedResponse = JSON.parse(rawResponse);
      return parsedResponse;
    }
  } catch (e) {
    console.warn("AWS SSM request failed");
    console.error(e);
    return {error: e}
  }
};

export async function getSygmaConfig(){
  let config
  try {
    if (process.env.NODE_ENV === 'production') {
      config = await getConfigFromSSM()
    } else {
      config = await getLocalConfig()
    }
  } catch(e) {
    return { error: { message: "Failed to fetch" } };
  }

  return config;
}
