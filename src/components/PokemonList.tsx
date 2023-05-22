import { PokemonSpecies } from "pokenode-ts";
import usePokeApi, { getLocalizedName, resolveResources } from "src/hooks/usePokeApi";

function PokemonList() {
  const { data: pokemons } = usePokeApi((api) =>
    api.pokemon.listPokemonSpecies(0, 10).then(resolveResources<PokemonSpecies>)
  );

  if (!pokemons) return <div>Chargement ...</div>;

  return (
    <table border={1}>
      <tbody>
        {pokemons.results.map((pokemon) => (
          <tr key={pokemon.id}>
            <td>{getLocalizedName(pokemon)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default PokemonList;
