import {Pokemon, PokemonSpecies} from "pokenode-ts";
import usePokeApi, {getLocalizedName, resolveResources} from "src/hooks/usePokeApi";
import {FunctionComponent, useMemo, useState} from "react";
import PokemonEntry from "src/components/PokemonEntry.tsx";

export type LocalizedPokemon = { pokemon: Pokemon, name: string };

interface PokemonProps {
  pokemon: Pokemon;
  selectPokemonLine: (idx: LocalizedPokemon) => void
}

// The variable must be a const to be able to put the ts typing https://stackoverflow.com/a/57062512
const Pokemon: FunctionComponent<PokemonProps> = ({pokemon, selectPokemonLine}: PokemonProps) => {
  const {data: species} = usePokeApi((api) => api.utility.getResourceByUrl<PokemonSpecies>(pokemon.species.url));

  if (!species){
    return (<tr>
      <td width="1">
        <img
          src={"src/assets/pokeball.png"}
          style={{
            height: "3em",
          }}
          alt={"pokeball"}
        />
      </td>
      <td></td>
    </tr>);
  }

  const icon = pokemon.sprites.versions["generation-vii"].icons.front_default;
  const localizedName = getLocalizedName(species);
  return (<tr onClick={() => selectPokemonLine({pokemon: pokemon, name: localizedName})}>
    <td width="1">
      <img
        src={icon ?? "src/assets/pokeball.png"}
        style={{
          height: "30px",
        }}
        alt={localizedName}
      />
    </td>
    <td>{localizedName}</td>
  </tr>);
};

const PokemonList: FunctionComponent = () => {
  const [selectedPokemon, setSelectedPokemon] = useState<LocalizedPokemon | undefined>(undefined)
  // For some reason the hook is triggered everytime the focus come back to the web page
  const {data: pokemon} = usePokeApi((api) => api.pokemon.listPokemons(0, 10).then(resolveResources<Pokemon>));


  const PokeTable = useMemo(() => {
    if (!pokemon) {
      return <></>
    }

    function setSelectPokemonLine(pokemon: LocalizedPokemon) {
      setSelectedPokemon((currentSelected) => {
        if (currentSelected?.pokemon.id === pokemon.pokemon.id) {
          return undefined
        }
        return pokemon
      })
    }

    return (
      <table border={1} className={"poke-table"}>
        <tbody>
        {pokemon.results.map((p) => (
          <Pokemon key={p.id} pokemon={p} selectPokemonLine={setSelectPokemonLine}/>
        ))}
        </tbody>
      </table>
    );
  }, [pokemon]);

  if (!pokemon) return <div>Chargement ...</div>;

  return <div style={{display: "flex", width: "100%", justifyContent: "center"}}> {PokeTable}
    {selectedPokemon && <PokemonEntry localizedPokemon={selectedPokemon}/>}
  </div>;
};

export default PokemonList;
