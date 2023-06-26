import { Pokemon, PokemonSpecies } from "pokenode-ts";
import usePokeApi, { getLocalizedName, resolveResources } from "src/hooks/usePokeApi";

interface PokemonProps {
  species: PokemonSpecies;
}

function Pokemon({ species }: PokemonProps) {
  const { data: pokemon } = usePokeApi(async (api) => {
    const defaultVariety = species.varieties.find((variety) => variety.is_default);
    if (defaultVariety) {
      return api.utility.getResourceByUrl<Pokemon>(defaultVariety.pokemon.url);
    }
  });

  return (
    <tr>
      <td width="1">
        <img
          src={pokemon?.sprites.other?.["official-artwork"].front_default ?? "src/assets/pokeball.png"}
          style={{
            height: "3em",
          }}
        />
      </td>
      <td>{getLocalizedName(species)}</td>
    </tr>
  );
}

function PokemonList() {
  const { data: pokemonSpecies } = usePokeApi((api) =>
    api.pokemon.listPokemonSpecies(0, 10).then(resolveResources<PokemonSpecies>)
  );

  if (!pokemonSpecies) return <div>Chargement ...</div>;

  return (
    <table border={1} style={{ background: "white", color: "blue", width: 800 }}>
      <tbody>
        {pokemonSpecies.results.map((s) => (
          <Pokemon key={s.id} species={s} />
        ))}
      </tbody>
    </table>
  );
}

export default PokemonList;
