import { ClientArgs, MainClient, Name, NamedAPIResourceList, UtilityClient } from "pokenode-ts";
import { UseBaseQueryOptions, useQuery } from "react-query";
import { useId } from "react";

class PokeClient extends MainClient {
  public utility: UtilityClient;

  constructor(clientOptions?: ClientArgs) {
    super(clientOptions);
    this.utility = new UtilityClient(clientOptions);
  }
}

const api = new PokeClient();

const usePokeApi = <T>(fetcher: (api: PokeClient) => Promise<T>, options?: UseBaseQueryOptions) =>
  useQuery<T>(useId(), () => fetcher(api), options as any);

export default usePokeApi;

export async function resolveResources<T>({ results: namedResources, ...response }: NamedAPIResourceList) {
  return {
    ...response,
    results: await Promise.all(namedResources.map((r) => api.utility.getResourceByUrl<T>(r.url))),
  };
}

interface LocalizedResource {
  name: string;
  names: Name[];
}

export function getLocalizedName(resource: LocalizedResource, lang = "fr") {
  return resource.names.find((localization) => localization.language.name === lang)?.name ?? resource.name;
}
