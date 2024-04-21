import { Route, route, Response } from "typera-express";
import * as Option from "fp-ts/lib/Option";
import { fetchUrlInfo } from "./fetch-url-info";
import { urlParser } from "./url-parser";
import { PUBLIC_KEY } from "./env";

type ActivityStreamUserResponse = {
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/v1"
  ];
  id: string;
  type: "Service";
  following?: string;
  followers?: string;
  inbox?: string;
  outbox?: string;
  preferredUsername: string;
  name?: string;
  summary?: string;
  url?: string;
  icon?: {
    type: "Image";
    mediaType: string;
    url: string;
  };
  publicKey: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };
};

type ActivityJsonHeader = {
  'Content-Type': 'application/activity+json';
};

const getMediaType = (icon: string) => {
  if (icon.endsWith('.png')) return 'image/png';
  if (icon.endsWith('.jpg') || icon.endsWith('.jpeg')) return 'image/jpeg';
  if (icon.endsWith('.gif')) return 'image/gif';
  return 'image/png';
}

export const usersRoute: Route<
  Response.Ok<ActivityStreamUserResponse, ActivityJsonHeader> | Response.NotFound
> = route
  .useParamConversions({ url: urlParser })
  .get("/:hostname(url)")
  .handler(async (req) => {
    const { hostname } = req.routeParams;
    const info = await fetchUrlInfo(hostname);
    if (Option.isNone(info)) return Response.notFound();

    const id = `https://${req.req.hostname}/${encodeURIComponent(hostname)}`;
    return Response.ok({
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      id,
      type: "Service",
      preferredUsername: hostname,
      name: info.value.name,
      inbox: `${id}/inbox`,
      summary: `This is a proxied RSS feed from ${info.value.rssUrl}`,
      icon: info.value.icon
        ? {
            type: "Image",
            mediaType: getMediaType(info.value.icon),
            url: info.value.icon,
          }
        : undefined,
      publicKey: {
        id: `${id}#main-key`,
        owner: id,
        publicKeyPem: PUBLIC_KEY,
      },
    }, { 'Content-Type': 'application/activity+json' });
  });
