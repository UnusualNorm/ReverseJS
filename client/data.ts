import { ComputerData } from "../types/socket.ts";
import config from "./config.json" assert { type: "json" };

export type IpInfo =
  & ({
    status: "success";
    continent: string;
    continentCode: string;
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    district: string;
    zip: string;
    lat: number;
    lon: number;
    timezone: string;
    offset: number;
    currency: string;
    isp: string;
    org: string;
    as: string;
    asname: string;
    reverse: string;
    mobile: boolean;
    proxy: boolean;
    hosting: boolean;
  } | {
    status: "fail";
    message: string;
  })
  & {
    query: string;
  };

export function verifyIpInfo(info: IpInfo): info is IpInfo {
  return typeof info.query === "string" &&
      (info.status === "success" && typeof info.continent === "string" &&
        typeof info.continentCode === "string" &&
        typeof info.country === "string" &&
        typeof info.countryCode === "string" &&
        typeof info.region === "string" &&
        typeof info.regionName === "string" && typeof info.city === "string" &&
        typeof info.district === "string" && typeof info.zip === "string" &&
        typeof info.lat === "number" && typeof info.lon === "number" &&
        typeof info.timezone === "string" && typeof info.offset === "number" &&
        typeof info.currency === "string" && typeof info.isp === "string" &&
        typeof info.org === "string" && typeof info.as === "string" &&
        typeof info.asname === "string" && typeof info.reverse === "string" &&
        typeof info.mobile === "boolean" && typeof info.proxy === "boolean" &&
        typeof info.hosting === "boolean") ||
    (info.status === "fail" && typeof info.message === "string");
}

export async function getIpInfo(): Promise<IpInfo> {
  const ipLookup = await fetch(
    "http://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query",
  );
  const ipLookupJson = await ipLookup.json();

  if (!verifyIpInfo(ipLookupJson)) {
    return {
      status: "fail",
      message: "Invalid IP Lookup Response",
      query: "",
    };
  }

  return ipLookupJson;
}

export function verifyData(data: ComputerData): data is ComputerData {
  return typeof data.version === "string" && typeof data.ipInfo === "object" &&
    verifyIpInfo(data.ipInfo) &&
    typeof data.env === "object";
}

export async function getData(defaultConfig: typeof config) {
  const ipInfo = await getIpInfo();
  const env = Deno.env.toObject();

  return {
    ...defaultConfig,
    ipInfo,
    env,
  };
}
