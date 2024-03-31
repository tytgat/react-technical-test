import {MainClient, Name, NamedAPIResourceList} from "pokenode-ts";
import {UseBaseQueryOptions, useQuery} from "react-query";
import {useId} from "react";

export const api = new MainClient();

/**
 * @link https://pokenode-ts.vercel.app/
 */

/**
 * Hook to get data on Pokémon based on the options, will cal the fetcher
 * @param fetcher function for the caller to get the MainClient api
 * @param options options to add to the call
 */
const usePokeApi = <T>(
  fetcher: (api: MainClient) => Promise<T>,
  options?: UseBaseQueryOptions
)=> useQuery<T>(useId(), () => fetcher(api), {...options as any});

export default usePokeApi;

export async function resolveResources<T>({results: namedResources, ...response}: NamedAPIResourceList) {
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
