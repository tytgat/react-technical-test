import {Pokemon, PokemonSpecies} from "pokenode-ts";
import usePokeApi, {getLocalizedName, resolveResources} from "src/hooks/usePokeApi";
import {FunctionComponent, useEffect, useMemo, useRef, useState} from "react";
import PokemonEntry from "src/components/PokemonEntry.tsx";

export type LocalizedPokemon = { pokemon: Pokemon, name: string };

interface PokemonProps {
    pokemon: Pokemon;
    selectPokemonLine: (idx: LocalizedPokemon) => void
}


/**
 * Debounce function, to avoid call during typing
 */
function debounce(action: () => void, timeout = 500) {
  let timer: NodeJS.Timeout;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      action();
    }, timeout);
  };
}

// The variable must be a const to be able to put the ts typing https://stackoverflow.com/a/57062512
const Pokemon: FunctionComponent<PokemonProps> = ({pokemon, selectPokemonLine}: PokemonProps) => {
  const {data: species} = usePokeApi((api) => api.utility.getResourceByUrl<PokemonSpecies>(pokemon.species.url));

  if (!species) {
    return (
      <tr>
        <td width="1">
          <img
            src={"src/assets/pokeball.png"}
            style={{
              height: "30px",
            }}
            alt={"pokeball"}
          />
        </td>
        <td></td>
      </tr>);
  }

  const icon = pokemon.sprites.versions["generation-vii"].icons.front_default;
  const localizedName = getLocalizedName(species, document.documentElement.lang || undefined);
  return (
    <tr onClick={() => selectPokemonLine({pokemon: pokemon, name: localizedName})}>
      <td>#{pokemon.id}</td>
      <td width="1">
        <img
          src={icon ?? "src/assets/pokeball.png"}
          style={{
            height: "30px",
          }}
          alt={localizedName}
        />
      </td>
      {/* Id above 10000 are variants and mega and many other forms */}
      <td style={{fontStyle: pokemon.id > 10000 ? "italic" : "initial"}}>{localizedName}</td>
    </tr>);
};

const POKEMONS_PER_PAGES = 10

const PokemonList: FunctionComponent = () => {
  const [selectedPokemon, setSelectedPokemon] = useState<LocalizedPokemon | undefined>(undefined)
  const [offset, setOffset] = useState<number>(0) // Initialized at 1 because there is no pokemon 0
  const [pokemon, setPokemon] = useState<Array<Pokemon>>([])

  const inputRef = useRef<HTMLInputElement>(null)

  // For some reason the hook is triggered everytime the focus come back to the web page
  // The value isLoading isn't working as I wanted to, it can be improved
  const {refetch, isLoading} = usePokeApi((api) => {
    return api.pokemon.listPokemons(offset, POKEMONS_PER_PAGES)
      .then(resolveResources<Pokemon>).then((data) => {
        setPokemon(data.results)
        return data
      })
  }, {refetchOnMount: true, refetchOnWindowFocus: false, enabled: false});

  // When the offset has changed and the rerender finished, we ask the api to refresh the list
  useEffect(() => {
    if (offset >= 0) {
      refetch()
    }
  }, [offset, refetch])

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

    function changePage(difference: number) {
      if (isLoading) {
        return;
      }
      setOffset((locOffset) => {
        if (inputRef?.current?.value !== undefined) {
          inputRef.current.value = (locOffset + difference) / POKEMONS_PER_PAGES + ""
        }
        return Math.max(0, locOffset + difference);
      });
    }

    const moveToInputPage = debounce(() => {
      if (inputRef?.current?.value === undefined) {
        return
      }
      const inputValue = parseInt(inputRef?.current?.value, 10) * POKEMONS_PER_PAGES;
      setOffset(inputValue);
    });

    return (
      <div>
        <table border={1} className={"poke-table"}>
          <tbody>
            {pokemon.map((p) => (
              <Pokemon key={p.id} pokemon={p} selectPokemonLine={setSelectPokemonLine}/>
            ))}
          </tbody>
        </table>
        <div style={{display: "flex", maxWidth: "50px", justifyContent: "space-between"}}>
          <input
            style={{width: "50px", height: "100%"}}
            disabled={isLoading}
            type={"button"}
            value={"<"}
            onClick={() => {
              changePage(Math.min(0, -POKEMONS_PER_PAGES));
            }}/>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
            }}
          >Page
            <input type={"number"} ref={inputRef} placeholder={offset / POKEMONS_PER_PAGES + ""} onChange={moveToInputPage}/></div>
          <input
            disabled={isLoading}
            type={"button"}
            value={">"}
            onClick={() => {
              changePage(POKEMONS_PER_PAGES);
            }}/>
        </div>
      </div>
    );
  }, [pokemon, isLoading, offset]);

  if (!pokemon) return <div>Initialisation ...</div>;

  return (
    <div style={{display: "flex", width: "100%", justifyContent: "center"}}>
      {PokeTable}
      {selectedPokemon && <PokemonEntry localizedPokemon={selectedPokemon}/>}
    </div>
  );
};

export default PokemonList;
